"""
Timeline Simulation Scheduler
==============================
Option B — Greedy Timeline Simulation

Algorithm overview
------------------
Given a list of patients (each annotated with AI predictions), the scheduler
builds a doctor's timeline by repeatedly:

  1. Collecting all patients who could realistically arrive by the current
     timeline cursor (their estimated_arrival <= cursor + ARRIVAL_BUFFER_MIN).
  2. Among those candidates, selecting the one with the highest priority score:
         priority = urgency_score / (travel_time_min + consultation_time_min)
     Ties are broken by earlier booking timestamp.
  3. Scheduling that patient:
         appointment_time = max(cursor, patient.estimated_arrival)
         departure_time   = appointment_time - travel_time_min
         next_cursor      = appointment_time + consultation_time_min
  4. If no candidate is available yet, the cursor advances to the next
     earliest estimated arrival (doctor idles rather than skipping a patient).

This ensures:
  - Urgent patients are prioritised.
  - The doctor is never idle longer than necessary.
  - No two appointments overlap.
  - Scheduling decisions are fully explainable (no black box).

Design Principles
-----------------
- This module is PURE — no DB access, no side effects.
- All inputs/outputs are plain Python dicts/lists — easy to test.
- Datetime arithmetic uses only stdlib (no heavy dependencies).
"""

from __future__ import annotations

import math
from datetime import datetime, timedelta
from typing import Any


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Minutes of slack — a patient is considered "available" if they can arrive
# within this buffer of the current cursor.  Avoids rejecting a patient who
# is 2 minutes away just because the doctor finished 1 minute early.
ARRIVAL_BUFFER_MIN: int = 5

# Hard minimum gap between consecutive appointments (minutes) — e.g. cleaning
INTER_APPOINTMENT_GAP_MIN: int = 2


# ---------------------------------------------------------------------------
# Data Types (plain dicts, typed via TypedDict for documentation only)
# ---------------------------------------------------------------------------

# Input: one patient entry fed to the scheduler
# {
#   "appointment_id"      : str,
#   "patient_uid"         : str,
#   "patient_name"        : str,       # display only
#   "booking_time"        : datetime,  # when the appointment was booked
#   "travel_time_min"     : float,
#   "consultation_time_min": int,
#   "urgency_score"       : float,     # 0.0 – 1.0
#   "estimated_arrival"   : datetime,  # computed from booking + travel_time
#   "predictions"         : dict,      # raw output from ai_predictor (for response)
# }

# Output: scheduled slot for one patient
# {
#   "appointment_id"      : str,
#   "patient_uid"         : str,
#   "patient_name"        : str,
#   "queue_position"      : int,       # 1-based
#   "appointment_time"    : datetime,
#   "departure_time"      : datetime,
#   "wait_time_min"       : float,     # time patient waits at clinic
#   "doctor_idle_min"     : float,     # idle time before this patient
#   "urgency_score"       : float,
#   "urgency_label"       : str,
#   "predictions"         : dict,
#   "scheduling_note"     : str,       # plain-English explanation of the decision
# }


# ---------------------------------------------------------------------------
# Core Algorithm
# ---------------------------------------------------------------------------

def simulate(
    patients: list[dict[str, Any]],
    clinic_open_time: datetime,
    clinic_close_time: datetime | None = None,
) -> list[dict[str, Any]]:
    """
    Run the Timeline Simulation and return an ordered, scheduled patient list.

    Parameters
    ----------
    patients : list[dict]
        Each dict must contain the keys listed in the "Input" comment above.
        The list may be in any order — the algorithm determines the optimal order.
    clinic_open_time : datetime
        When the doctor is first available (e.g. 2026-04-19 09:00).
    clinic_close_time : datetime | None
        Optional clinic closing time.  Patients who cannot be scheduled before
        this time are flagged with a note but still included in the output
        (ordering remains valid even if some overflow).

    Returns
    -------
    list[dict]
        Patients in scheduled order, each with appointment_time, departure_time,
        and other scheduling metadata.  Empty list if `patients` is empty.
    """
    if not patients:
        return []

    # Work on a mutable copy; track which are still unscheduled
    remaining = list(patients)
    scheduled: list[dict[str, Any]] = []

    cursor: datetime = clinic_open_time
    total_doctor_idle_min: float = 0.0
    queue_pos: int = 1

    while remaining:
        # ── Step 1: Find candidates who can arrive by cursor + buffer ──────
        candidates = [
            p for p in remaining
            if p["estimated_arrival"] <= cursor + timedelta(minutes=ARRIVAL_BUFFER_MIN)
        ]

        if not candidates:
            # No one can arrive yet → advance cursor to the next earliest arrival
            next_arrival = min(p["estimated_arrival"] for p in remaining)
            idle_gap = (next_arrival - cursor).total_seconds() / 60
            total_doctor_idle_min += idle_gap
            cursor = next_arrival
            continue

        # ── Step 2: Select best candidate ─────────────────────────────────
        # Primary key  : urgency_score / (travel_time + consultation_time)  (desc)
        # Tie-breaker  : booking_time  (earlier booking wins)
        def priority_key(p: dict) -> tuple:
            denom = p["travel_time_min"] + p["consultation_time_min"]
            # Guard against zero denominator (can happen only if both are 0)
            score = p["urgency_score"] / denom if denom > 0 else p["urgency_score"]
            return (score, -p["booking_time"].timestamp())

        best = max(candidates, key=priority_key)

        # ── Step 3: Schedule the chosen patient ────────────────────────────
        # Doctor must wait if patient hasn't arrived yet
        appt_start = max(cursor, best["estimated_arrival"])

        # How long the doctor was idle before this patient
        doctor_idle = max(0.0, (appt_start - cursor).total_seconds() / 60)

        # How long the patient waits at clinic after arriving
        wait_at_clinic = max(0.0, (appt_start - best["estimated_arrival"]).total_seconds() / 60)

        appt_end = appt_start + timedelta(minutes=best["consultation_time_min"])

        # Departure time = when patient must leave home/current location
        departure = appt_start - timedelta(minutes=best["travel_time_min"])

        # Check for clinic close-time overflow
        scheduling_note = _build_scheduling_note(best, appt_start, doctor_idle, wait_at_clinic)
        if clinic_close_time and appt_end > clinic_close_time:
            scheduling_note += " ⚠ Appointment may extend beyond clinic closing time."

        scheduled_entry = {
            "appointment_id":       best["appointment_id"],
            "patient_uid":          best["patient_uid"],
            "patient_name":         best.get("patient_name", "Unknown"),
            "queue_position":       queue_pos,
            "appointment_time":     appt_start,
            "appointment_time_str": appt_start.strftime("%Y-%m-%d %H:%M"),
            "departure_time":       departure,
            "departure_time_str":   departure.strftime("%Y-%m-%d %H:%M"),
            "wait_time_min":        round(wait_at_clinic, 1),
            "doctor_idle_min":      round(doctor_idle, 1),
            "urgency_score":        best["urgency_score"],
            "urgency_label":        best["predictions"].get("urgency", {}).get("urgency_label", ""),
            "travel_time_min":      best["travel_time_min"],
            "consultation_time_min": best["consultation_time_min"],
            "predictions":          best["predictions"],
            "scheduling_note":      scheduling_note,
        }
        scheduled.append(scheduled_entry)

        # ── Step 4: Advance cursor ─────────────────────────────────────────
        cursor = appt_end + timedelta(minutes=INTER_APPOINTMENT_GAP_MIN)
        total_doctor_idle_min += doctor_idle
        queue_pos += 1
        remaining.remove(best)

    return scheduled


# ---------------------------------------------------------------------------
# Summary Statistics
# ---------------------------------------------------------------------------

def compute_schedule_summary(scheduled: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Return aggregate metrics for the full scheduled session.

    Useful for the doctor's dashboard to evaluate schedule quality.
    """
    if not scheduled:
        return {}

    total_patients = len(scheduled)
    total_wait = sum(s["wait_time_min"] for s in scheduled)
    total_idle = sum(s["doctor_idle_min"] for s in scheduled)
    avg_wait = total_wait / total_patients
    avg_idle = total_idle / total_patients

    session_start = scheduled[0]["appointment_time"]
    last = scheduled[-1]
    session_end = last["appointment_time"] + timedelta(minutes=last["consultation_time_min"])
    session_duration_min = (session_end - session_start).total_seconds() / 60

    critical_count = sum(1 for s in scheduled if s.get("urgency_label") == "critical")
    high_count = sum(1 for s in scheduled if s.get("urgency_label") == "high")

    return {
        "total_patients":       total_patients,
        "session_start_str":    session_start.strftime("%H:%M"),
        "session_end_str":      session_end.strftime("%H:%M"),
        "session_duration_min": round(session_duration_min, 1),
        "total_doctor_idle_min": round(total_idle, 1),
        "avg_patient_wait_min": round(avg_wait, 1),
        "critical_patients":    critical_count,
        "high_urgency_patients": high_count,
    }


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _build_scheduling_note(
    patient: dict,
    appt_start: datetime,
    doctor_idle: float,
    wait_at_clinic: float,
) -> str:
    """
    Build a plain-English explanation of why this patient was scheduled at
    this position — important for healthcare auditability.
    """
    parts = []

    label = patient["predictions"].get("urgency", {}).get("urgency_label", "")
    score = patient["urgency_score"]
    parts.append(f"Urgency: {label} ({score:.2f})")

    tt = patient["travel_time_min"]
    ct = patient["consultation_time_min"]
    parts.append(f"Travel: {tt:.0f} min, Consult: {ct} min")

    denom = tt + ct
    priority = score / denom if denom > 0 else score
    parts.append(f"Priority score: {priority:.4f}")

    if doctor_idle > 0.5:
        parts.append(f"Doctor waits {doctor_idle:.0f} min for patient to arrive")
    if wait_at_clinic > 0.5:
        parts.append(f"Patient waits {wait_at_clinic:.0f} min at clinic")

    return " | ".join(parts)
