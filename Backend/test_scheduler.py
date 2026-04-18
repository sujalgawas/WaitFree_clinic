"""
Quick smoke test for the Hybrid Scheduling System.
Run from Backend/ directory:
    python test_scheduler.py
"""
from datetime import datetime, timedelta
from app.scheduling import ai_predictor, scheduler


def run():
    # ── AI Prediction tests ────────────────────────────────────────────────
    # Patient A: 10 km away (Mumbai centre → suburb), off-peak hour
    tA = ai_predictor.predict_travel_time(19.076, 72.877, 19.120, 72.940, hour_of_day=11)
    assert tA["travel_time_min"] > 5, "Travel time for 10km must be > 5 min"
    print(f"Patient A travel : {tA['travel_time_min']} min")
    print(f"  Explanation    : {tA['explanation']}")

    # Patient B: only 1 km away
    tB = ai_predictor.predict_travel_time(19.118, 72.938, 19.120, 72.940, hour_of_day=11)
    assert tB["travel_time_min"] < tA["travel_time_min"], "B (1km) must be faster than A (10km)"
    print(f"\nPatient B travel : {tB['travel_time_min']} min")
    print(f"  Explanation    : {tB['explanation']}")

    # Urgency
    uEmergency = ai_predictor.predict_urgency(is_emergency=True)
    assert uEmergency["urgency_score"] == 1.0
    uRoutine = ai_predictor.predict_urgency(is_emergency=False, symptoms="routine checkup")
    assert uRoutine["urgency_score"] < 0.3
    print(f"\nEmergency urgency : {uEmergency['urgency_score']}  ({uEmergency['urgency_label']})")
    print(f"Routine urgency   : {uRoutine['urgency_score']}  ({uRoutine['urgency_label']})")

    # Consultation
    cGen = ai_predictor.predict_consultation_time("general", "fever", is_new_patient=True)
    assert cGen["consultation_time_min"] >= 15
    print(f"\nConsultation time : {cGen['consultation_time_min']} min")
    print(f"  Explanation     : {cGen['explanation']}")

    # ── Timeline Simulation test ──────────────────────────────────────────
    clinic_open = datetime(2026, 4, 19, 9, 0)

    patients = [
        # Patient A: 10km away, moderate urgency → expected last
        {
            "appointment_id": "appt_A",
            "patient_uid": "uid_A",
            "patient_name": "Patient A (Far)",
            "booking_time": clinic_open - timedelta(hours=2),
            "travel_time_min": tA["travel_time_min"],
            "consultation_time_min": 20,
            "urgency_score": 0.3,
            "estimated_arrival": clinic_open + timedelta(minutes=tA["travel_time_min"]),
            "predictions": {"urgency": {"urgency_label": "medium"}},
        },
        # Patient B: 1km away, same urgency → expected second (or earlier than A)
        {
            "appointment_id": "appt_B",
            "patient_uid": "uid_B",
            "patient_name": "Patient B (Nearby)",
            "booking_time": clinic_open - timedelta(hours=1),
            "travel_time_min": tB["travel_time_min"],
            "consultation_time_min": 15,
            "urgency_score": 0.3,
            "estimated_arrival": clinic_open + timedelta(minutes=tB["travel_time_min"]),
            "predictions": {"urgency": {"urgency_label": "medium"}},
        },
        # Patient C: Emergency → must be first
        {
            "appointment_id": "appt_C",
            "patient_uid": "uid_C",
            "patient_name": "Patient C (Emergency)",
            "booking_time": clinic_open - timedelta(minutes=5),
            "travel_time_min": 5.0,
            "consultation_time_min": 20,
            "urgency_score": 1.0,
            "estimated_arrival": clinic_open + timedelta(minutes=5),
            "predictions": {"urgency": {"urgency_label": "critical"}},
        },
    ]

    result = scheduler.simulate(patients, clinic_open_time=clinic_open)
    summary = scheduler.compute_schedule_summary(result)

    print("\n--- Optimised Queue -------------------------------------------")
    for r in result:
        print(
            f"  [{r['queue_position']}] {r['patient_name']:<30s}"
            f"  appt={r['appointment_time_str']}"
            f"  depart={r['departure_time_str']}"
            f"  urgency={r['urgency_score']:.2f}"
        )

    print("\n--- Summary ---------------------------------------------------")
    for k, v in summary.items():
        print(f"  {k}: {v}")

    # Assertions
    assert result[0]["patient_uid"] == "uid_C", "Emergency patient MUST be first!"
    assert result[-1]["patient_uid"] == "uid_A", "Far/low-priority patient should be last!"
    print("\nALL TESTS PASSED [OK]")


if __name__ == "__main__":
    run()
