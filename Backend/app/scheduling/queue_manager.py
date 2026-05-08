"""
Queue Manager — Scheduler Orchestrator
=======================================
Bridges the Firestore data layer and the scheduling engine.

Responsibilities
----------------
1. Fetch all appointments for a (doctor_uid, date) pair from Firestore.
2. Enrich each appointment with patient/doctor context from Firestore.
3. Run AI predictions (ai_predictor) for every patient.
4. Build the enriched patient list and hand it to the scheduler.
5. Optionally persist the scheduling results back to Firestore in a
   non-destructive `scheduler` sub-field on each appointment document.
6. Return the ordered schedule + summary to the caller.

This module is the single entry point other code should use — the routes
call `build_optimized_queue()` and nothing else.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any, Optional

from app.db.firebase import get_db
from app.scheduling import ai_predictor
from app.scheduling import scheduler as sched_engine

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Default clinic open time (hour, minute) — used when no explicit time given
DEFAULT_OPEN_HOUR = 9
DEFAULT_OPEN_MINUTE = 0

# Whether to write scheduling results back to each appointment doc in Firestore
PERSIST_RESULTS = True


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def build_optimized_queue(
    doctor_uid: str,
    date_str: str,                     # "YYYY-MM-DD"
    clinic_open_override: Optional[str] = None,  # "HH:MM"
) -> dict[str, Any]:
    """
    Build and return the fully optimised queue for a doctor on a given date.

    Parameters
    ----------
    doctor_uid : str
        Firestore document ID of the doctor.
    date_str : str
        Target date in "YYYY-MM-DD" format.
    clinic_open_override : str | None
        Optional "HH:MM" string to override the default clinic open time.

    Returns
    -------
    dict with keys:
        schedule  : list[dict]   — ordered scheduled patient entries
        summary   : dict         — aggregate session statistics
        doctor_uid: str
        date      : str
    """
    db = get_db()

    # ── 1. Fetch doctor profile ────────────────────────────────────────────
    doctor_doc = db.collection("doctors").document(doctor_uid).get()
    if not doctor_doc.exists:
        raise ValueError(f"Doctor not found: {doctor_uid}")

    doctor_data = doctor_doc.to_dict()
    specialization = doctor_data.get("specialization", "general").lower()
    clinic_loc = doctor_data.get("clinic_details", {}).get("location", {})
    clinic_lat = clinic_loc.get("lat")
    clinic_lng = clinic_loc.get("lng")

    # ── 2. Determine clinic open time ─────────────────────────────────────
    if clinic_open_override:
        hh, mm = map(int, clinic_open_override.split(":"))
    else:
        hh, mm = DEFAULT_OPEN_HOUR, DEFAULT_OPEN_MINUTE

    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    clinic_open_dt = date_obj.replace(hour=hh, minute=mm, second=0, microsecond=0)

    # ── 3. Fetch all appointments for this doctor + date ──────────────────
    appt_query = (
        db.collection("appointments")
        .where("doctor_uid", "==", doctor_uid)
        .where("date", "==", date_str)
    )
    appt_docs = list(appt_query.stream())

    if not appt_docs:
        return {
            "schedule": [],
            "summary": {},
            "doctor_uid": doctor_uid,
            "date": date_str,
            "message": "No appointments found for this date.",
        }

    # ── 4. Enrich each appointment with patient context + predictions ──────
    enriched_patients: list[dict] = []

    for appt_doc in appt_docs:
        appt = appt_doc.to_dict()
        appt_id = appt_doc.id

        status = appt.get("status", "confirmed").lower()
        if status in ["done", "skipped", "cancelled", "completed"]:
            continue

        patient_uid = appt.get("patient_uid", "")

        # Fetch patient profile
        patient_doc = db.collection("patients").document(patient_uid).get()
        patient_data = patient_doc.to_dict() if patient_doc.exists else {}

        # Also try users collection for display name
        user_doc = db.collection("users").document(patient_uid).get()
        user_data = user_doc.to_dict() if user_doc.exists else {}
        patient_name = (
            appt.get("patient_name")
            or user_data.get("full_name")
            or patient_data.get("full_name")
            or "Patient"
        )

        # Patient location
        loc = patient_data.get("last_known_location", {})
        patient_lat = loc.get("lat")
        patient_lng = loc.get("lng")

        # Patient demographics / clinical flags
        age = patient_data.get("age") or user_data.get("age")
        symptoms = appt.get("symptoms") or patient_data.get("symptoms") or ""
        is_emergency = bool(appt.get("is_emergency") or patient_data.get("is_emergency"))
        is_new_patient = bool(appt.get("is_new_patient", True))

        # Booking timestamp — used as tie-breaker in scheduler
        booking_ts = appt.get("created_at")
        if booking_ts and hasattr(booking_ts, "datetime"):
            booking_dt = booking_ts.datetime()        # Firestore DatetimeWithNanoseconds
        elif isinstance(booking_ts, datetime):
            booking_dt = booking_ts
        else:
            booking_dt = clinic_open_dt               # fallback

        # Parse the booked slot time (e.g. "10:00 AM") to get a rough arrival expectation
        booked_slot_dt = _parse_slot(appt.get("slot", ""), date_obj, clinic_open_dt)

        # ── AI Predictions ──────────────────────────────────────────────
        # Travel time prediction
        if patient_lat and patient_lng and clinic_lat and clinic_lng:
            travel_pred = ai_predictor.predict_travel_time(
                patient_lat, patient_lng,
                clinic_lat, clinic_lng,
                hour_of_day=booked_slot_dt.hour,
            )
        else:
            # Fallback: no patient location stored — assume 15 min
            travel_pred = {
                "travel_time_min": 15.0,
                "distance_km": None,
                "explanation": "Patient location unavailable — default 15 min travel assumed.",
            }

        # Consultation time prediction
        consult_pred = ai_predictor.predict_consultation_time(
            specialization=specialization,
            symptoms=symptoms,
            is_new_patient=is_new_patient,
        )

        # Urgency prediction
        urgency_pred = ai_predictor.predict_urgency(
            is_emergency=is_emergency,
            symptoms=symptoms,
            age=age,
        )

        # Estimated arrival = booked_slot_dt (appointments arrive ~on time by design)
        # We use the booked slot as the earliest arrival reference.
        # The scheduler will decide the actual appointment_time.
        estimated_arrival = booked_slot_dt - timedelta(minutes=travel_pred["travel_time_min"])
        # Clamp: patient cannot arrive before clinic opens
        estimated_arrival = max(estimated_arrival, clinic_open_dt)

        enriched_patients.append({
            "appointment_id":       appt_id,
            "patient_uid":          patient_uid,
            "patient_name":         patient_name,
            "booking_time":         booking_dt,
            "booked_slot":          booked_slot_dt.strftime("%H:%M"),
            "travel_time_min":      travel_pred["travel_time_min"],
            "consultation_time_min": consult_pred["consultation_time_min"],
            "urgency_score":        urgency_pred["urgency_score"],
            "estimated_arrival":    estimated_arrival,
            "predictions": {
                "travel":      travel_pred,
                "consultation": consult_pred,
                "urgency":     urgency_pred,
            },
        })

    # ── 5. Run the simulation ─────────────────────────────────────────────
    scheduled = sched_engine.simulate(
        patients=enriched_patients,
        clinic_open_time=clinic_open_dt,
    )

    summary = sched_engine.compute_schedule_summary(scheduled)

    # ── 6. Persist results to Firestore (optional) ────────────────────────
    if PERSIST_RESULTS:
        _persist_schedule(db, scheduled)

    # ── 7. Serialise for JSON response ────────────────────────────────────
    serialised = _serialise_schedule(scheduled)

    return {
        "schedule": serialised,
        "summary": summary,
        "doctor_uid": doctor_uid,
        "date": date_str,
    }


def get_patient_slot(
    doctor_uid: str,
    date_str: str,
    patient_uid: str,
    appointment_id: str | None = None,
) -> dict[str, Any] | None:
    """
    Return the scheduled slot for a specific patient within an optimised queue.
    Returns None if no appointment is found for this patient on the given date.
    """
    result = build_optimized_queue(doctor_uid, date_str)
    
    if appointment_id:
        for entry in result.get("schedule", []):
            if entry.get("appointment_id") == appointment_id:
                return entry

    for entry in result.get("schedule", []):
        if entry["patient_uid"] == patient_uid:
            return entry
    return None


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _parse_slot(slot_str: str, date_obj: datetime, fallback: datetime) -> datetime:
    """
    Parse a slot string like "10:00 AM", "14:30", or "2:30 PM" into a datetime.
    Falls back gracefully if parsing fails.
    """
    if not slot_str:
        return fallback

    slot_str = slot_str.strip().upper()
    formats = ["%I:%M %p", "%H:%M", "%I %p", "%I:%M%p"]
    for fmt in formats:
        try:
            t = datetime.strptime(slot_str, fmt)
            return date_obj.replace(hour=t.hour, minute=t.minute, second=0, microsecond=0)
        except ValueError:
            continue

    log.warning(f"Could not parse slot '{slot_str}' — using clinic open time as fallback")
    return fallback


def _persist_schedule(db, scheduled: list[dict]) -> None:
    """
    Write scheduling metadata back to Firestore in a non-destructive sub-field.
    Uses a batch write for efficiency.
    """
    from firebase_admin import firestore as fs

    try:
        batch = db.batch()
        for entry in scheduled:
            ref = db.collection("appointments").document(entry["appointment_id"])
            batch.update(ref, {
                "scheduler": {
                    "queue_position":       entry["queue_position"],
                    "appointment_time":     entry["appointment_time_str"],
                    "departure_time":       entry["departure_time_str"],
                    "travel_time_min":      entry["travel_time_min"],
                    "consultation_time_min": entry["consultation_time_min"],
                    "urgency_score":        entry["urgency_score"],
                    "urgency_label":        entry["urgency_label"],
                    "wait_time_min":        entry["wait_time_min"],
                    "scheduling_note":      entry["scheduling_note"],
                    "optimized_at":         fs.SERVER_TIMESTAMP,
                }
            })
        batch.commit()
        log.info(f"Scheduler results persisted for {len(scheduled)} appointments.")
    except Exception as e:
        # Persistence failure must never break the API response
        log.error(f"Failed to persist scheduler results: {e}")


def _serialise_schedule(scheduled: list[dict]) -> list[dict]:
    """
    Convert datetime objects to strings so the list is JSON-serialisable.
    """
    result = []
    for entry in scheduled:
        s = dict(entry)
        # Remove the raw datetime objects (str versions already present)
        s.pop("appointment_time", None)
        s.pop("departure_time", None)
        result.append(s)
    return result
