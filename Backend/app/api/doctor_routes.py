from flask import Blueprint, request, jsonify
from datetime import datetime
from app.services.auth_service import token_to_uid
from app.db.firebase import get_db
from app.crud.appointments_crud import get_appointments_by_doctor
from app.scheduling import queue_manager

doctor_bp = Blueprint('doctor', __name__, url_prefix='/doctor')

def _get_token():
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        return auth_header.split(' ')[1]
    
    # Check JSON body or form
    if request.is_json:
        return request.json.get('token')
    return request.form.get('token')

@doctor_bp.route('/dashboard', methods=['GET'])
def doctor_dashboard():
    token = _get_token()
    uid = token_to_uid(token)
    
    if not uid:
        return jsonify({"message": "Unauthorized"}), 401

    try:
        db = get_db()
        today_str = datetime.now().strftime("%Y-%m-%d")
        
        # We need stats: todayAppointments, totalPatients, pendingConsults, revenue
        appointments_ref = db.collection('appointments').where('doctor_uid', '==', uid).stream()
        
        today_appointments = 0
        total_patients = set()
        pending_consults = 0
        revenue = 0
        
        upcoming = []

        doctor_doc = db.collection('doctors').document(uid).get()
        consultation_fee = 0
        if doctor_doc.exists:
            doctor_data = doctor_doc.to_dict()
            consultation_fee = doctor_data.get('consultation_fee', 0)
        
        for doc in appointments_ref:
            appt = doc.to_dict()
            appt_id = doc.id
            
            patient_uid = appt.get('patient_uid')
            if patient_uid:
                total_patients.add(patient_uid)
                
            appt_date = appt.get('date')
            status = appt.get('status', 'confirmed')
            
            if appt_date == today_str:
                today_appointments += 1
                if status in ['confirmed', 'Waiting', 'In Progress']:
                    pending_consults += 1
                    upcoming.append({
                        "id": appt_id,
                        "patientName": appt.get('patient_name') or "Unknown Patient",
                        "problem": appt.get('symptoms') or appt.get('visit_type') or "Checkup",
                        "time": appt.get('slot') or "TBD",
                        "type": appt.get('type') or "in-person",
                        "status": status
                    })
                
                if status == 'Done' or status == 'completed':
                    revenue += consultation_fee
        
        stats = {
            "todayAppointments": today_appointments,
            "totalPatients": len(total_patients),
            "pendingConsults": pending_consults,
            "revenue": revenue
        }
        
        return jsonify({
            "stats": stats,
            "appointments": upcoming
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@doctor_bp.route('/queue', methods=['GET'])
def get_live_queue():
    token = _get_token()
    uid = token_to_uid(token)
    if not uid:
        return jsonify({"message": "Unauthorized"}), 401

    try:
        today_str = datetime.now().strftime("%Y-%m-%d")
        
        # Use queue_manager to get the optimized queue
        try:
            optimised = queue_manager.build_optimized_queue(
                doctor_uid=uid,
                date_str=today_str
            )
            schedule = optimised.get("schedule", [])
        except Exception as e:
            # If no patients, build_optimized_queue might fail or return empty
            schedule = []
            
        queue_data = []
        db = get_db()
        
        # we need status from the appointment to know if it's Waiting, In Progress, Done
        for i, slot in enumerate(schedule):
            appt_doc = db.collection('appointments').document(slot['appointment_id']).get()
            if not appt_doc.exists:
                continue
            appt_data = appt_doc.to_dict()
            status = appt_data.get('status', 'Waiting')
            
            # Map statuses
            if status == 'confirmed':
                status = 'Waiting'
                
            if status == 'Done':
                continue # optionally exclude done
                
            queue_data.append({
                "id": slot['appointment_id'],
                "token": f"A{str(i+1).zfill(3)}",
                "name": appt_data.get('patient_name') or "Unknown",
                "age": appt_data.get('patient_dob', "N/A"), # ideally calculate age
                "symptoms": appt_data.get('symptoms') or "General Checkup",
                "arrivalTime": appt_data.get('slot') or "09:00",
                "status": status,
                "riskLevel": slot.get('urgency_label', 'Low'),
                "waitTime": slot.get('wait_time_min', 0)
            })
            
        # Also return completed count
        completed_count = 0
        appointments_ref = db.collection('appointments').where('doctor_uid', '==', uid).where('date', '==', today_str).stream()
        for doc in appointments_ref:
            if doc.to_dict().get('status') == 'Done':
                completed_count += 1

        return jsonify({"queue": queue_data, "completedCount": completed_count}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@doctor_bp.route('/queue/call-next', methods=['POST'])
def call_next():
    token = _get_token()
    uid = token_to_uid(token)
    if not uid:
        return jsonify({"message": "Unauthorized"}), 401
        
    appt_id = request.json.get('appointment_id')
    if not appt_id:
        return jsonify({"message": "appointment_id required"}), 400
        
    try:
        db = get_db()
        db.collection('appointments').document(appt_id).update({"status": "In Progress"})
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@doctor_bp.route('/queue/mark-done', methods=['POST'])
def mark_done():
    token = _get_token()
    uid = token_to_uid(token)
    if not uid:
        return jsonify({"message": "Unauthorized"}), 401
        
    appt_id = request.json.get('appointment_id')
    if not appt_id:
        return jsonify({"message": "appointment_id required"}), 400
        
    try:
        db = get_db()
        db.collection('appointments').document(appt_id).update({"status": "Done"})
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@doctor_bp.route('/queue/skip', methods=['POST'])
def skip_patient():
    token = _get_token()
    uid = token_to_uid(token)
    if not uid:
        return jsonify({"message": "Unauthorized"}), 401
        
    appt_id = request.json.get('appointment_id')
    if not appt_id:
        return jsonify({"message": "appointment_id required"}), 400
        
    try:
        db = get_db()
        # Skip could mean changing status to 'Skipped' or keeping it 'Waiting' but moving the time.
        # For simplicity, let's mark it as 'Skipped' or update a skipped flag.
        db.collection('appointments').document(appt_id).update({"status": "Skipped"})
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@doctor_bp.route('/queue/add', methods=['POST'])
def add_patient():
    # Emergency Add
    token = _get_token()
    uid = token_to_uid(token)
    if not uid:
        return jsonify({"message": "Unauthorized"}), 401
        
    data = request.get_json()
    try:
        db = get_db()
        doctor_doc = db.collection('doctors').document(uid).get()
        doctor_name = doctor_doc.to_dict().get('full_name') if doctor_doc.exists else "Doctor"
        
        today_str = datetime.now().strftime("%Y-%m-%d")
        
        from app.crud.appointments_crud import create_appointment
        from firebase_admin import firestore
        
        appointment_data = {
            "patient_uid": "emergency_patient",
            "doctor_uid": uid,
            "doctor_name": doctor_name,
            "patient_name": data.get('name'),
            "patient_dob": str(datetime.now().year - int(data.get('age', 30))), # dummy dob calculation
            "slot": datetime.now().strftime("%I:%M %p"), # current time
            "date": today_str,
            "status": "Waiting",
            "symptoms": data.get('symptoms'),
            "is_emergency": True,
            "created_at": firestore.SERVER_TIMESTAMP,
        }
        
        appt_id = create_appointment(appointment_data)
        
        # Trigger reoptimization non-blocking
        import threading
        def _reoptimize():
            try:
                queue_manager.build_optimized_queue(doctor_uid=uid, date_str=today_str)
            except Exception:
                pass
        threading.Thread(target=_reoptimize, daemon=True).start()
        
        return jsonify({"success": True, "appointment_id": appt_id}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
