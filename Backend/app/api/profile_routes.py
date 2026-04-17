import os
import json
from datetime import datetime
from flask import Blueprint, request, jsonify
from app.services.auth_service import token_to_uid
from app.services.storage_service import allowed_file, MAX_FILE_SIZE, upload_file_to_storage
from app.crud.doctors_crud import save_doctor
from app.crud.patients_crud import save_patient
from app.db.firebase import get_db

profile_bp = Blueprint('profile', __name__)


@profile_bp.route('/check-profile', methods=['POST'])
def check_profile():
    try:
        data = request.get_json()
        token = data.get('token')
        user_type = data.get('user_type')

        if not token or not user_type:
            return jsonify({"message": "Token and user_type required"}), 400

        uid = token_to_uid(token)
        if not uid:
            return jsonify({"message": "Unauthorized - Invalid token"}), 401

        collection_name = 'doctors' if user_type == 'doctor' else 'patients'

        try:
            doc = get_db().collection(collection_name).document(uid).get()
            if doc.exists:
                doc_data = doc.to_dict()
                profile_completed = doc_data.get('profile_completed', False)
                return jsonify({
                    "profile_completed": profile_completed,
                    "user_type": user_type,
                    "uid": uid
                }), 200
            else:
                return jsonify({
                    "profile_completed": False,
                    "user_type": user_type,
                    "uid": uid
                }), 200
        except Exception as db_error:
            print(f"❌ Firestore Error: {db_error}")
            return jsonify({"message": "Database error"}), 500

    except Exception as e:
        print(f"❌ Error in check_profile: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"message": "An error occurred"}), 500


@profile_bp.route('/patient-form', methods=['POST'])
def patient_form():
    try:
        token = request.form.get('token')
        if not token:
            return jsonify({"message": "Token is required"}), 400

        uid = token_to_uid(token)
        if not uid:
            return jsonify({"message": "Unauthorized - Invalid token"}), 401

        required_fields = ['full_name', 'date_of_birth', 'gender', 'emergency_name', 'emergency_phone', 'emergency_relation']
        missing_fields = [field for field in required_fields if not request.form.get(field)]
        if missing_fields:
            return jsonify({"message": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        profile_file = request.files.get('profile_image')
        profile_url = "default_avatar"
        blob = None

        if profile_file and profile_file.filename != '':
            print(f"File received: {profile_file.filename}")
            if not allowed_file(profile_file.filename):
                return jsonify({"message": "Invalid file type. Allowed: PNG, JPG, JPEG"}), 400

            profile_file.seek(0, os.SEEK_END)
            file_size = profile_file.tell()
            profile_file.seek(0)

            if file_size > MAX_FILE_SIZE:
                return jsonify({"message": "Profile image size exceeds 5MB limit"}), 400

            try:
                profile_url, blob = upload_file_to_storage(profile_file, 'patient_profiles', uid)
                print(f"✅ Profile image uploaded")
            except Exception as upload_error:
                print(f"❌ Firebase Storage Error: {upload_error}")
                return jsonify({"message": "Failed to upload profile image"}), 500

        full_name = request.form.get('full_name', '').strip()
        date_of_birth = request.form.get('date_of_birth', '').strip()
        gender = request.form.get('gender', '').strip()
        blood_group = request.form.get('blood_group', '').strip()
        height = request.form.get('height', '').strip()
        weight = request.form.get('weight', '').strip()
        emergency_name = request.form.get('emergency_name', '').strip()
        emergency_phone = request.form.get('emergency_phone', '').strip()
        emergency_relation = request.form.get('emergency_relation', '').strip()

        allergies_input = request.form.get('allergies_input', '').strip()
        chronic_conditions_input = request.form.get('chronic_conditions_input', '').strip()
        allergies = [a.strip() for a in allergies_input.split(',') if a.strip()] if allergies_input else []
        chronic_conditions = [c.strip() for c in chronic_conditions_input.split(',') if c.strip()] if chronic_conditions_input else []

        print(f"Allergies parsed: {allergies}")
        print(f"Chronic conditions parsed: {chronic_conditions}")

        height_int = None
        weight_int = None

        if height:
            try:
                height_int = int(height)
                if height_int <= 0 or height_int > 300:
                    return jsonify({"message": "Invalid height value"}), 400
            except ValueError:
                return jsonify({"message": "Height must be a number"}), 400

        if weight:
            try:
                weight_int = int(weight)
                if weight_int <= 0 or weight_int > 500:
                    return jsonify({"message": "Invalid weight value"}), 400
            except ValueError:
                return jsonify({"message": "Weight must be a number"}), 400

        email = request.form.get('email', '')

        patient_data = {
            "full_name": full_name,
            "email": email if email else None,
            "profile_completed": True,
            "profile_image": profile_url,
            "created_at": datetime.now().isoformat(),
            "personal_details": {
                "dob": date_of_birth,
                "gender": gender,
                "blood_group": blood_group if blood_group else None,
                "height": height_int,
                "weight": weight_int
            },
            "medical_profile": {
                "allergies": allergies,
                "chronic_conditions": chronic_conditions
            },
            "emergency_contact": {
                "name": emergency_name,
                "phone": emergency_phone,
                "relation": emergency_relation
            }
        }

        try:
            save_patient(uid, patient_data, merge=True)
            print(f"✅ Patient profile saved for UID: {uid}")
            return jsonify({
                "message": "Patient profile saved successfully",
                "uid": uid,
                "profile_completed": True
            }), 200

        except Exception as db_error:
            print(f"❌ Firestore Error: {db_error}")
            if blob and profile_url != "default_avatar":
                try:
                    blob.delete()
                    print("🗑️ Cleaned up uploaded file after database error")
                except Exception:
                    pass
            return jsonify({"message": "Failed to save profile to database"}), 500

    except Exception as e:
        print(f"❌ Unexpected Error in patient_form: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"message": "An unexpected error occurred"}), 500


@profile_bp.route('/doctor-form', methods=['POST'])
def doctor_form():
    try:
        token = request.form.get('token')
        if not token:
            return jsonify({"message": "Token is required"}), 400

        uid = token_to_uid(token)
        if not uid:
            return jsonify({"message": "Unauthorized - Invalid token"}), 401

        required_fields = [
            'full_name', 'specialization', 'reg_number', 'medical_council',
            'reg_year', 'experience_years', 'clinic_name', 'address_line',
            'city', 'zip_code', 'consultation_fee', 'morning_start',
            'morning_end', 'evening_start', 'evening_end', 'days_open'
        ]
        missing_fields = [field for field in required_fields if not request.form.get(field)]
        if missing_fields:
            return jsonify({"message": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        degree_file = request.files.get('degree_proof')
        blob = None

        if not degree_file:
            return jsonify({"message": "Degree proof file is required"}), 400

        if degree_file.filename == '':
            return jsonify({"message": "No file selected"}), 400

        if not allowed_file(degree_file.filename):
            return jsonify({"message": "Invalid file type. Allowed: PDF, PNG, JPG, JPEG"}), 400

        degree_file.seek(0, os.SEEK_END)
        file_size = degree_file.tell()
        degree_file.seek(0)

        if file_size > MAX_FILE_SIZE:
            return jsonify({"message": "File size exceeds 5MB limit"}), 400

        try:
            degree_url, blob = upload_file_to_storage(degree_file, 'doctor_degrees', uid)
            print(f"✅ File uploaded successfully")
        except Exception as upload_error:
            print(f"❌ Firebase Storage Error: {upload_error}")
            return jsonify({"message": "Failed to upload degree proof"}), 500

        full_name = request.form.get('full_name').strip()
        specialization = request.form.get('specialization').strip()
        reg_number = request.form.get('reg_number').strip()
        medical_council = request.form.get('medical_council').strip()
        reg_year = request.form.get('reg_year').strip()
        experience_years = request.form.get('experience_years').strip()
        clinic_name = request.form.get('clinic_name').strip()
        address_line = request.form.get('address_line').strip()
        city = request.form.get('city', '').lower().strip()
        zip_code = request.form.get('zip_code').strip()
        google_maps_link = request.form.get('google_maps_link', '').strip()
        consultation_fee = request.form.get('consultation_fee').strip()
        morning_start = request.form.get('morning_start')
        morning_end = request.form.get('morning_end')
        evening_start = request.form.get('evening_start')
        evening_end = request.form.get('evening_end')

        days_open_str = request.form.get('days_open')
        try:
            days_open = json.loads(days_open_str) if days_open_str else {}
        except json.JSONDecodeError:
            return jsonify({"message": "Invalid days_open format"}), 400

        if not any(days_open.values()):
            return jsonify({"message": "Please select at least one working day"}), 400

        try:
            reg_year_int = int(reg_year)
            experience_years_int = int(experience_years)
            consultation_fee_int = int(consultation_fee)

            if reg_year_int < 1950 or reg_year_int > 2026:
                return jsonify({"message": "Invalid registration year"}), 400
            if experience_years_int < 0 or experience_years_int > 70:
                return jsonify({"message": "Invalid experience years"}), 400
            if consultation_fee_int < 0:
                return jsonify({"message": "Invalid consultation fee"}), 400
        except ValueError:
            return jsonify({"message": "Invalid numeric values provided"}), 400

        doctor_data = {
            "full_name": full_name,
            "specialization": specialization,
            "city": city,
            "consultation_fee": consultation_fee_int,
            "is_verified": False,
            "profile_completed": True,
            "created_at": datetime.now().isoformat(),
            "personal_details": {
                "reg_number": reg_number,
                "medical_council": medical_council,
                "reg_year": reg_year_int,
                "degree_proof_url": degree_url,
                "experience_years": experience_years_int
            },
            "clinic_details": {
                "name": clinic_name,
                "address": address_line,
                "zip_code": zip_code,
                "google_maps_link": google_maps_link if google_maps_link else None
            },
            "availability": {
                "days_open": days_open,
                "morning_shift": {"start": morning_start, "end": morning_end},
                "evening_shift": {"start": evening_start, "end": evening_end}
            }
        }

        try:
            save_doctor(uid, doctor_data)
            print(f"✅ Doctor profile saved for UID: {uid}")
            return jsonify({
                "message": "Doctor profile saved successfully",
                "uid": uid,
                "profile_completed": True
            }), 200

        except Exception as db_error:
            print(f"❌ Firestore Error: {db_error}")
            if blob:
                try:
                    blob.delete()
                    print("🗑️ Cleaned up uploaded file after database error")
                except Exception:
                    pass
            return jsonify({"message": "Failed to save profile to database"}), 500

    except Exception as e:
        print(f"❌ Unexpected Error in doctor_form: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"message": "An unexpected error occurred"}), 500
