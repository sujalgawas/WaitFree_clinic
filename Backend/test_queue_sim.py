from datetime import datetime
from app.scheduling.scheduler import simulate

patients = [
    {
        "appointment_id": "1",
        "patient_uid": "p1",
        "booking_time": datetime(2024, 1, 1, 8, 0),
        "travel_time_min": 15,
        "consultation_time_min": 15,
        "urgency_score": 0.5,
        "estimated_arrival": datetime(2024, 1, 1, 9, 45),
        "predictions": {"urgency": {}}
    },
    {
        "appointment_id": "2",
        "patient_uid": "p2",
        "booking_time": datetime(2024, 1, 1, 8, 5),
        "travel_time_min": 15,
        "consultation_time_min": 15,
        "urgency_score": 0.5,
        "estimated_arrival": datetime(2024, 1, 1, 9, 45), # Same slot
        "predictions": {"urgency": {}}
    },
    {
        "appointment_id": "3",
        "patient_uid": "p3",
        "booking_time": datetime(2024, 1, 1, 8, 10),
        "travel_time_min": 15,
        "consultation_time_min": 15,
        "urgency_score": 0.5,
        "estimated_arrival": datetime(2024, 1, 1, 10, 15), # Different slot
        "predictions": {"urgency": {}}
    }
]

open_time = datetime(2024, 1, 1, 9, 0)
res = simulate(patients, open_time)
for p in res:
    print(f"{p['patient_uid']}: queue_pos={p['queue_position']}, appt={p['appointment_time_str']}")
