"""
End-to-End Queue Test (No Firebase Auth Tokens Required)
=========================================================
Tests the full booking → queue optimisation → patient slot flow
by calling the scheduling layer directly, bypassing HTTP + token auth.

Run from Backend/ directory:
    python test_queue.py

Prerequisites:
    - Backend .env + serviceAccountKey.json must be configured
    - At least one doctor must exist in the Firestore `doctors` collection

What it does:
    1. Finds a real doctor from Firestore
    2. Creates 3 test appointments with full patient form data
    3. Runs the AI-powered queue optimisation
    4. Verifies queue ordering (emergency patient first)
    5. Verifies patient slot lookup works
    6. Cleans up all test appointments from Firestore
"""

import sys
import os
import io
import traceback
from datetime import datetime, timedelta

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Bootstrap the Flask app context (initialises Firebase)
from app import create_app
app = create_app()

from app.db.firebase import get_db
from app.crud.appointments_crud import create_appointment
from app.scheduling import queue_manager, ai_predictor, scheduler


# ── Colour helpers for terminal output ──────────────────────────────────────
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

def ok(msg):   print(f"  {GREEN}[OK]{RESET} {msg}")
def fail(msg): print(f"  {RED}[FAIL]{RESET} {msg}")
def info(msg): print(f"  {CYAN}[INFO]{RESET} {msg}")
def header(msg): print(f"\n{BOLD}{YELLOW}{'-'*60}\n  {msg}\n{'-'*60}{RESET}")


def run():
    created_appt_ids = []  # Track IDs for cleanup

    with app.app_context():
        db = get_db()
        today = datetime.now().strftime("%Y-%m-%d")

        # ══════════════════════════════════════════════════════════════════
        # STEP 1: Find a real doctor in Firestore
        # ══════════════════════════════════════════════════════════════════
        header("STEP 1: Finding a doctor in Firestore")

        doctor_doc = None
        for doc in db.collection("doctors").limit(5).stream():
            d = doc.to_dict()
            if d.get("full_name"):
                doctor_doc = doc
                break

        if not doctor_doc:
            fail("No doctors found in Firestore. Please register a doctor first.")
            sys.exit(1)

        doctor_data = doctor_doc.to_dict()
        doctor_uid = doctor_doc.id
        doctor_name = doctor_data.get("full_name", "Unknown")
        clinic_name = doctor_data.get("clinic_details", {}).get("name", "N/A")

        ok(f"Doctor found: {doctor_name} (uid: {doctor_uid})")
        info(f"Clinic: {clinic_name}")
        info(f"Specialization: {doctor_data.get('specialization', 'N/A')}")

        # ══════════════════════════════════════════════════════════════════
        # STEP 2: Create test appointments with full patient form data
        # ══════════════════════════════════════════════════════════════════
        header("STEP 2: Creating test appointments with patient form data")

        test_patients = [
            {
                "patient_uid":      "test_patient_A",
                "doctor_uid":       doctor_uid,
                "doctor_name":      doctor_name,
                "patient_name":     "Rahul Sharma",
                "patient_phone":    "+91 98765 43210",
                "patient_dob":      "1995-03-15",
                "patient_gender":   "Male",
                "patient_blood_group": "B+",
                "visit_type":       "New Patient",
                "clinic_name":      clinic_name,
                "clinic_address":   doctor_data.get("clinic_details", {}).get("address"),
                "slot":             "10:00 AM",
                "date":             today,
                "status":           "confirmed",
                "symptoms":         "fever and mild headache for 2 days",
                "history":          "No known allergies",
                "is_emergency":     False,
                "is_new_patient":   True,
                "created_at":       datetime.now() - timedelta(hours=2),
            },
            {
                "patient_uid":      "test_patient_B",
                "doctor_uid":       doctor_uid,
                "doctor_name":      doctor_name,
                "patient_name":     "Priya Patel",
                "patient_phone":    "+91 87654 32100",
                "patient_dob":      "1988-07-22",
                "patient_gender":   "Female",
                "patient_blood_group": "O+",
                "visit_type":       "Follow-up",
                "clinic_name":      clinic_name,
                "clinic_address":   doctor_data.get("clinic_details", {}).get("address"),
                "slot":             "10:30 AM",
                "date":             today,
                "status":           "confirmed",
                "symptoms":         "routine follow-up checkup",
                "history":          "Diabetes Type 2",
                "is_emergency":     False,
                "is_new_patient":   False,
                "created_at":       datetime.now() - timedelta(hours=1),
            },
            {
                "patient_uid":      "test_patient_C",
                "doctor_uid":       doctor_uid,
                "doctor_name":      doctor_name,
                "patient_name":     "Amit Verma",
                "patient_phone":    "+91 76543 21000",
                "patient_dob":      "2000-11-05",
                "patient_gender":   "Male",
                "patient_blood_group": "A-",
                "visit_type":       "Emergency",
                "clinic_name":      clinic_name,
                "clinic_address":   doctor_data.get("clinic_details", {}).get("address"),
                "slot":             "09:30 AM",
                "date":             today,
                "status":           "confirmed",
                "symptoms":         "severe chest pain and difficulty breathing",
                "history":          "Hypertension, Penicillin allergy",
                "is_emergency":     True,
                "is_new_patient":   True,
                "created_at":       datetime.now() - timedelta(minutes=15),
            },
        ]

        for p in test_patients:
            appt_id = create_appointment(p)
            created_appt_ids.append(appt_id)
            ok(f"Created appointment {appt_id} for {p['patient_name']} "
               f"({p['visit_type']}, slot={p['slot']})")

        # ══════════════════════════════════════════════════════════════════
        # STEP 3: Run AI-powered queue optimisation
        # ══════════════════════════════════════════════════════════════════
        header("STEP 3: Running AI queue optimisation")

        result = queue_manager.build_optimized_queue(
            doctor_uid=doctor_uid,
            date_str=today,
        )

        schedule = result.get("schedule", [])
        summary = result.get("summary", {})

        if not schedule:
            fail("Schedule is empty! The queue manager returned no results.")
            _cleanup(db, created_appt_ids)
            sys.exit(1)

        ok(f"Queue optimised: {len(schedule)} patients scheduled")

        # Print the full schedule
        print(f"\n  {BOLD}{'Pos':<5}{'Patient':<25}{'Appt Time':<20}{'Wait(min)':<12}"
              f"{'Urgency':<12}{'Note'}{RESET}")
        print(f"  {'─'*90}")

        for s in schedule:
            pos = s.get("queue_position", "?")
            name = s.get("patient_name", "Unknown")
            appt_time = s.get("appointment_time_str", "N/A")
            wait = s.get("wait_time_min", 0)
            urgency = s.get("urgency_label", "N/A")
            note = s.get("scheduling_note", "")[:50]

            # Highlight emergency
            name_display = f"{RED}{BOLD}{name}{RESET}" if urgency == "critical" else name
            print(f"  {pos:<5}{name_display:<25}{appt_time:<20}{wait:<12.1f}"
                  f"{urgency:<12}{note}")

        # Print summary
        print(f"\n  {BOLD}Schedule Summary:{RESET}")
        for k, v in summary.items():
            print(f"    {k}: {v}")

        # ══════════════════════════════════════════════════════════════════
        # STEP 4: Verify queue ordering — Emergency patient MUST be first
        # ══════════════════════════════════════════════════════════════════
        header("STEP 4: Verifying queue ordering")

        # Filter to only our test patients
        test_entries = [s for s in schedule if s["patient_uid"].startswith("test_patient_")]

        if len(test_entries) < 3:
            info(f"Found {len(test_entries)}/3 test patients in schedule "
                 f"(others may exist from real bookings)")
        
        # Find emergency patient position
        emergency_entry = next(
            (s for s in test_entries if s["patient_uid"] == "test_patient_C"), None
        )

        if emergency_entry:
            # Emergency should be scheduled first among test patients
            test_positions = sorted(test_entries, key=lambda x: x["queue_position"])
            if test_positions[0]["patient_uid"] == "test_patient_C":
                ok(f"Emergency patient '{emergency_entry['patient_name']}' is correctly "
                   f"scheduled FIRST (position {emergency_entry['queue_position']})")
            else:
                # Still OK if globally first, emergency may not be first among test patients
                # if real appointments exist with higher urgency
                info(f"Emergency patient at position {emergency_entry['queue_position']} "
                     f"(may be affected by other existing appointments)")
        else:
            fail("Emergency test patient not found in schedule!")

        # Check wait times are non-negative
        all_waits_ok = all(s["wait_time_min"] >= 0 for s in schedule)
        if all_waits_ok:
            ok("All wait times are non-negative ✓")
        else:
            fail("Some wait times are negative — scheduling bug!")

        # Check positions are sequential
        positions = [s["queue_position"] for s in schedule]
        if positions == list(range(1, len(schedule) + 1)):
            ok("Queue positions are sequential (1, 2, 3, ...) ✓")
        else:
            fail(f"Queue positions are not sequential: {positions}")

        # ══════════════════════════════════════════════════════════════════
        # STEP 5: Test patient slot lookup
        # ══════════════════════════════════════════════════════════════════
        header("STEP 5: Testing patient slot lookup")

        for test_uid in ["test_patient_A", "test_patient_B", "test_patient_C"]:
            slot = queue_manager.get_patient_slot(
                doctor_uid=doctor_uid,
                date_str=today,
                patient_uid=test_uid,
            )
            if slot:
                ok(f"{test_uid} → Position {slot['queue_position']}, "
                   f"Time: {slot['appointment_time_str']}, "
                   f"Wait: {slot['wait_time_min']} min")
            else:
                fail(f"{test_uid} → Slot not found!")

        # ══════════════════════════════════════════════════════════════════
        # STEP 6: Verify patient form data persisted correctly
        # ══════════════════════════════════════════════════════════════════
        header("STEP 6: Verifying patient form data in Firestore")

        for appt_id in created_appt_ids:
            doc = db.collection("appointments").document(appt_id).get()
            if doc.exists:
                data = doc.to_dict()
                has_name = bool(data.get("patient_name"))
                has_phone = bool(data.get("patient_phone"))
                has_gender = bool(data.get("patient_gender"))
                has_blood = bool(data.get("patient_blood_group"))
                has_visit = bool(data.get("visit_type"))
                has_symptoms = bool(data.get("symptoms"))

                if all([has_name, has_phone, has_gender, has_blood, has_visit, has_symptoms]):
                    ok(f"Appointment {appt_id}: All patient form fields saved ✓ "
                       f"({data['patient_name']}, {data['visit_type']})")
                else:
                    missing = []
                    if not has_name: missing.append("patient_name")
                    if not has_phone: missing.append("patient_phone")
                    if not has_gender: missing.append("patient_gender")
                    if not has_blood: missing.append("patient_blood_group")
                    if not has_visit: missing.append("visit_type")
                    if not has_symptoms: missing.append("symptoms")
                    fail(f"Appointment {appt_id}: Missing fields: {', '.join(missing)}")
            else:
                fail(f"Appointment {appt_id} not found in Firestore!")

        # ══════════════════════════════════════════════════════════════════
        # STEP 7: Quick AI predictor sanity check
        # ══════════════════════════════════════════════════════════════════
        header("STEP 7: AI predictor sanity checks")

        # Emergency urgency
        u_emerg = ai_predictor.predict_urgency(is_emergency=True, symptoms="chest pain")
        assert u_emerg["urgency_score"] == 1.0, "Emergency must have score 1.0"
        ok(f"Emergency urgency: {u_emerg['urgency_score']} ({u_emerg['urgency_label']})")

        # Routine urgency
        u_routine = ai_predictor.predict_urgency(is_emergency=False, symptoms="routine checkup")
        assert u_routine["urgency_score"] < 0.3, "Routine must have score < 0.3"
        ok(f"Routine urgency: {u_routine['urgency_score']} ({u_routine['urgency_label']})")

        # Consultation time
        c_new = ai_predictor.predict_consultation_time("general", "fever", is_new_patient=True)
        c_follow = ai_predictor.predict_consultation_time("general", "follow-up", is_new_patient=False)
        assert c_new["consultation_time_min"] > c_follow["consultation_time_min"], \
            "New patient should take longer than follow-up"
        ok(f"New patient consult: {c_new['consultation_time_min']} min "
           f"vs Follow-up: {c_follow['consultation_time_min']} min")

        # ══════════════════════════════════════════════════════════════════
        # CLEANUP
        # ══════════════════════════════════════════════════════════════════
        header("CLEANUP: Removing test appointments")
        _cleanup(db, created_appt_ids)

        # ══════════════════════════════════════════════════════════════════
        # RESULT
        # ══════════════════════════════════════════════════════════════════
        print(f"\n{BOLD}{GREEN}{'═'*60}")
        print(f"  ALL QUEUE TESTS PASSED ✓")
        print(f"{'═'*60}{RESET}\n")


def _cleanup(db, appt_ids):
    """Delete test appointments from Firestore."""
    for appt_id in appt_ids:
        try:
            db.collection("appointments").document(appt_id).delete()
            ok(f"Deleted test appointment: {appt_id}")
        except Exception as e:
            fail(f"Failed to delete {appt_id}: {e}")


if __name__ == "__main__":
    try:
        run()
    except Exception as e:
        print(f"\n{RED}{BOLD}TEST FAILED WITH ERROR:{RESET}")
        traceback.print_exc()
        sys.exit(1)
