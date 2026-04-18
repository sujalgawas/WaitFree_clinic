"""
Scheduler API Routes
====================
Exposes three endpoints for the Hybrid Scheduling System.

All endpoints require a valid Firebase ID token.

Endpoints
---------
POST /scheduler/optimized-queue
    Doctor-facing: returns the full optimised queue for a date.

POST /scheduler/patient-schedule
    Patient-facing: returns the patient's own scheduled slot.

POST /scheduler/add-to-queue
    Patient-facing: books an appointment then immediately re-optimises the
    queue, returning real-time updated scheduling info.
"""

import logging
import threading
from datetime import datetime
from flask import Blueprint, request, jsonify

from app.services.auth_service import token_to_uid
from app.crud.doctors_crud import get_doctor_by_name, get_doctor_by_uid
from app.crud.appointments_crud import create_appointment
from app.scheduling import queue_manager
from app.db.firebase import get_db
from firebase_admin import firestore

log = logging.getLogger(__name__)

scheduler_bp = Blueprint("scheduler", __name__, url_prefix="/scheduler")


# ---------------------------------------------------------------------------
# Helper: flexible doctor lookup
# ---------------------------------------------------------------------------

def _lookup_doctor(doctor_uid: str | None, doctor_name: str | None) -> dict | None:
    """
    Resolve doctor data using either uid or full_name.
    When only a name is supplied, also tries a case-insensitive prefix scan
    across full_name, display_name, and email fields so the caller doesn't need
    to know the exact Firestore field value.

    Returns the doctor data dict (with 'uid' key added) or None.
    """
    # Fast path: uid given directly
    if doctor_uid:
        doc = get_doctor_by_uid(doctor_uid)
        if doc and doc.exists:
            data = doc.to_dict()
            data["uid"] = doctor_uid
            return data
        return None

    if not doctor_name:
        return None

    # Try exact full_name match first (existing helper)
    result = get_doctor_by_name(doctor_name)
    if result:
        return result

    # Fallback: scan doctors collection for partial / email-prefix match
    db = get_db()
    name_lower = doctor_name.lower().strip()
    for doc in db.collection("doctors").stream():
        d = doc.to_dict()
        candidates = [
            str(d.get("full_name", "")).lower(),
            str(d.get("display_name", "")).lower(),
            str(d.get("email", "")).lower().split("@")[0],
            str(d.get("username", "")).lower(),
        ]
        if any(name_lower in c or c in name_lower for c in candidates if c):
            d["uid"] = doc.id
            return d

    return None


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _require_token(data: dict):
    """Extract and validate token; return uid or None."""
    return token_to_uid(data.get("token"))


def _json_error(message: str, status: int = 400):
    return jsonify({"success": False, "message": message}), status


# ---------------------------------------------------------------------------
# Endpoint 1 — Full Optimised Queue (Doctor)
# ---------------------------------------------------------------------------

@scheduler_bp.route("/optimized-queue", methods=["POST"])
def optimized_queue():
    """
    Get the full optimised queue for a doctor on a given date.

    Request body (JSON):
    {
        "token"            : "<firebase_id_token>",
        "doctor_uid"       : "<uid>",      // optional if token belongs to doctor
        "date"             : "YYYY-MM-DD",
        "clinic_open_time" : "HH:MM"       // optional, default 09:00
    }

    Response:
    {
        "success" : true,
        "schedule": [ { appointment_id, patient_name, queue_position,
                        appointment_time_str, departure_time_str,
                        urgency_score, urgency_label,
                        travel_time_min, consultation_time_min,
                        wait_time_min, doctor_idle_min,
                        scheduling_note, predictions: {...} }, ... ],
        "summary" : { total_patients, session_start_str, ... },
        "date"    : "YYYY-MM-DD"
    }
    """
    data = request.get_json(force=True, silent=True) or {}
    uid = _require_token(data)
    if not uid:
        return _json_error("Unauthorized", 401)

    # The caller may pass an explicit doctor_uid (for staff/admin access)
    # otherwise we assume the authenticated user IS the doctor.
    doctor_uid = data.get("doctor_uid") or uid
    date_str = data.get("date")
    if not date_str:
        return _json_error("'date' field is required (YYYY-MM-DD)")

    # Validate date format
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        return _json_error("Invalid date format. Expected YYYY-MM-DD.")

    clinic_open = data.get("clinic_open_time")  # "HH:MM" or None

    try:
        result = queue_manager.build_optimized_queue(
            doctor_uid=doctor_uid,
            date_str=date_str,
            clinic_open_override=clinic_open,
        )
        return jsonify({"success": True, **result}), 200

    except ValueError as e:
        return _json_error(str(e), 404)
    except Exception as e:
        log.exception("optimized_queue error")
        return _json_error(f"Scheduling failed: {str(e)}", 500)


# ---------------------------------------------------------------------------
# Endpoint 2 — Patient's Own Scheduled Slot
# ---------------------------------------------------------------------------

@scheduler_bp.route("/patient-schedule", methods=["POST"])
def patient_schedule():
    """
    Return a patient's own scheduled slot within the optimised queue.

    Request body (JSON):
    {
        "token"       : "<firebase_id_token>",
        "doctor_uid"  : "<doctor_uid>",   // use either this ...
        "doctor_name" : "<doctor name>",  // ... or this (fallback lookup)
        "date"        : "YYYY-MM-DD"
    }
    """
    data = request.get_json(force=True, silent=True) or {}
    patient_uid = _require_token(data)
    if not patient_uid:
        return _json_error("Unauthorized", 401)

    doctor_uid = data.get("doctor_uid")
    doctor_name = data.get("doctor_name")
    date_str = data.get("date")

    if not date_str:
        return _json_error("'date' field is required")
    if not doctor_uid and not doctor_name:
        return _json_error("Either 'doctor_uid' or 'doctor_name' is required")

    # Resolve doctor_uid if only name was given
    if not doctor_uid:
        doctor_data = _lookup_doctor(None, doctor_name)
        if not doctor_data:
            return _json_error(f"Doctor not found by name: {doctor_name}", 404)
        doctor_uid = doctor_data["uid"]

    try:
        slot = queue_manager.get_patient_slot(
            doctor_uid=doctor_uid,
            date_str=date_str,
            patient_uid=patient_uid,
        )
        if slot is None:
            return _json_error("No appointment found for this patient on the given date.", 404)

        return jsonify({"success": True, "slot": slot}), 200

    except Exception as e:
        log.exception("patient_schedule error")
        return _json_error(f"Failed to retrieve schedule: {str(e)}", 500)


# ---------------------------------------------------------------------------
# Endpoint 3 — Real-Time Add to Queue
# ---------------------------------------------------------------------------

@scheduler_bp.route("/add-to-queue", methods=["POST"])
def add_to_queue():
    """
    Book an appointment and immediately re-optimise the queue.

    Request body (JSON):
    {
        "token"         : "<firebase_id_token>",
        "doctor_uid"    : "<uid>",           // preferred — exact Firestore id
        "doctorName"    : "Dr. Jane Smith",  // alternative — looked up by name
        "slot"          : "10:00 AM",
        "date"          : "YYYY-MM-DD",
        "symptoms"      : "fever and headache",  // optional
        "is_emergency"  : false,                 // optional
        "is_new_patient": true                   // optional
    }
    """
    data = request.get_json(force=True, silent=True) or {}
    patient_uid = _require_token(data)
    if not patient_uid:
        return _json_error("Unauthorized", 401)

    doctor_uid_param = data.get("doctor_uid")   # direct uid (preferred)
    doctor_name = data.get("doctorName")         # name-based lookup (fallback)
    slot = data.get("slot")
    date_str = data.get("date")

    if not slot or not date_str:
        return _json_error("'slot' and 'date' are required")
    if not doctor_uid_param and not doctor_name:
        return _json_error("Either 'doctor_uid' or 'doctorName' is required")

    try:
        # ── Look up doctor (by uid first, then by name) ───────────────────
        doctor_data = _lookup_doctor(doctor_uid_param, doctor_name)
        if not doctor_data:
            lookup_hint = f"uid={doctor_uid_param}" if doctor_uid_param else f"name='{doctor_name}'"
            return _json_error(
                f"Doctor not found ({lookup_hint}). "
                f"Pass 'doctor_uid' (exact Firestore id) or 'doctorName' matching the full_name field.",
                404
            )

        doctor_uid = doctor_data["uid"]
        display_name = doctor_data.get("full_name") or doctor_name or doctor_uid

        # ── Create appointment ────────────────────────────────────────────
        appointment_data = {
            "patient_uid":    patient_uid,
            "doctor_uid":     doctor_uid,
            "doctor_name":    display_name,
            "clinic_name":    doctor_data.get("clinic_details", {}).get("name"),
            "clinic_address": doctor_data.get("clinic_details", {}).get("address"),
            "slot":           slot,
            "date":           date_str,
            "status":         "confirmed",
            "symptoms":       data.get("symptoms", ""),
            "is_emergency":   bool(data.get("is_emergency", False)),
            "is_new_patient": bool(data.get("is_new_patient", True)),
            "created_at":     firestore.SERVER_TIMESTAMP,
        }

        appt_id = create_appointment(appointment_data)
        log.info(f"New appointment created: {appt_id} for doctor {doctor_uid}")

        # ── Re-optimise queue ─────────────────────────────────────────────
        optimised = queue_manager.build_optimized_queue(
            doctor_uid=doctor_uid,
            date_str=date_str,
        )

        # Find this patient's slot in the updated schedule
        patient_slot = next(
            (s for s in optimised["schedule"] if s["patient_uid"] == patient_uid),
            None
        )

        return jsonify({
            "success":        True,
            "appointment_id": appt_id,
            "message":        "Booking successful. Queue re-optimised.",
            "your_slot":      patient_slot,
            "full_schedule":  optimised["schedule"],
            "summary":        optimised["summary"],
        }), 200

    except ValueError as e:
        return _json_error(str(e), 404)
    except Exception as e:
        log.exception("add_to_queue error")
        return _json_error(f"Booking/scheduling failed: {str(e)}", 500)
