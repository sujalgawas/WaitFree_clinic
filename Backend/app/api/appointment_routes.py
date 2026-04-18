from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from app.services.auth_service import token_to_uid
from app.services.location_service import extract_coordinates_from_maps_link
from app.crud.appointments_crud import (
    create_appointment, get_appointment_by_id,
    get_appointments_by_patient, get_appointments_by_doctor
)
from app.crud.doctors_crud import get_doctor_by_uid, get_doctor_by_name
import threading
import logging

log = logging.getLogger(__name__)

appointment_bp = Blueprint('appointment', __name__)


@appointment_bp.route('/booking', methods=['POST'])
def booking():
    data = request.get_json()
    token = data.get('token')

    patient_uid = token_to_uid(token)
    if not patient_uid:
        return jsonify({"message": "Unauthorized"}), 401

    doctor_name = data.get('doctorName')
    timing = data.get('slot')
    date = data.get('date')

    try:
        doctor_data = get_doctor_by_name(doctor_name)
        if not doctor_data:
            return jsonify({"message": "Doctor not found"}), 404

        doctor_uid = doctor_data['uid']

        appointment_data = {
            "patient_uid": patient_uid,
            "doctor_uid": doctor_uid,
            "doctor_name": doctor_name,
            "clinic_name": doctor_data.get('clinic_details', {}).get('name'),
            "clinic_address": doctor_data.get('clinic_details', {}).get('address'),
            "slot": timing,
            "date": date,
            "status": "confirmed",
            "created_at": firestore.SERVER_TIMESTAMP
        }

        appt_id = create_appointment(appointment_data)

        # ── Non-blocking queue re-optimisation ──────────────────────────
        # Triggers in a background thread so the booking response is instant.
        # The updated schedule is persisted to Firestore by queue_manager.
        def _reoptimize():
            try:
                from app.scheduling import queue_manager
                queue_manager.build_optimized_queue(
                    doctor_uid=doctor_uid,
                    date_str=date,
                )
                log.info(f"Queue re-optimised for doctor={doctor_uid} date={date}")
            except Exception as ex:
                log.error(f"Background queue optimisation failed: {ex}")

        threading.Thread(target=_reoptimize, daemon=True).start()

        return jsonify({"message": "Booking successful", "appointment_id": appt_id}), 200

    except Exception as e:
        print(f"Booking Error: {e}")
        return jsonify({"message": "Booking failed", "error": str(e)}), 500


@appointment_bp.route('/get-doctor-schedule', methods=['POST'])
def get_doctor_schedule():
    data = request.get_json()
    token = data.get('token')

    doctor_uid = token_to_uid(token)
    if not doctor_uid:
        return jsonify({"message": "Unauthorized"}), 401

    try:
        results = get_appointments_by_doctor(doctor_uid)
        schedule = []
        for doc in results:
            appt = doc.to_dict()
            appt['id'] = doc.id
            schedule.append(appt)

        return jsonify({"schedule": schedule}), 200

    except Exception as e:
        print(f"Schedule Error: {e}")
        return jsonify({"error": str(e)}), 500


@appointment_bp.route('/get-user-appointments', methods=['POST'])
def get_user_appointments():
    data = request.get_json()
    token = data.get('token')

    patient_uid = token_to_uid(token)
    if not patient_uid:
        return jsonify({"message": "Unauthorized"}), 401

    try:
        results = get_appointments_by_patient(patient_uid)
        appointments = []
        for doc in results:
            appt = doc.to_dict()
            appt['id'] = doc.id
            if 'created_at' in appt and appt['created_at']:
                appt['created_at'] = appt['created_at'].strftime('%Y-%m-%d %H:%M')
            appointments.append(appt)

        return jsonify({"appointments": appointments}), 200

    except Exception as e:
        print(f"Error fetching appointments: {e}")
        return jsonify({"error": str(e)}), 500


@appointment_bp.route('/get-appointment-details', methods=['POST'])
def get_appointment_details():
    data = request.get_json()
    token = data.get('token')
    appointment_id = data.get('appointment_id')

    patient_uid = token_to_uid(token)
    if not patient_uid:
        return jsonify({"message": "Unauthorized"}), 401

    try:
        appt_doc = get_appointment_by_id(appointment_id)
        if not appt_doc:
            return jsonify({"message": "Appointment not found"}), 404

        appt_data = appt_doc.to_dict()

        if appt_data.get('patient_uid') != patient_uid:
            return jsonify({"message": "Unauthorized access"}), 403

        doctor_uid = appt_data.get('doctor_uid')
        doctor_doc = get_doctor_by_uid(doctor_uid)

        if doctor_doc:
            doctor_data = doctor_doc.to_dict()
            maps_link = doctor_data.get('clinic_details', {}).get('google_maps_link', '')
            clinic_location = extract_coordinates_from_maps_link(maps_link)

            appt_data['clinic_location'] = clinic_location
            appt_data['doctor_phone'] = doctor_data.get('clinic_details', {}).get('phone')
            appt_data['doctor_specialization'] = doctor_data.get('specialization')

        appt_data['id'] = appt_doc.id

        if 'created_at' in appt_data and appt_data['created_at']:
            appt_data['created_at'] = appt_data['created_at'].strftime('%Y-%m-%d %H:%M')

        return jsonify({"appointment": appt_data}), 200

    except Exception as e:
        print(f"Error fetching appointment details: {e}")
        return jsonify({"error": str(e)}), 500
