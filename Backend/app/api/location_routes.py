from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from app.services.auth_service import token_to_uid
from app.services.location_service import extract_coordinates_from_maps_link
from app.crud.patients_crud import get_patient_by_uid, update_patient_location
from app.crud.doctors_crud import save_doctor, get_doctor_by_uid
from app.db.firebase import get_db

location_bp = Blueprint('location', __name__)


@location_bp.route('/update-location', methods=['POST'])
def update_location():
    data = request.get_json()
    token = data.get('token')

    uid = None
    if token:
        uid = token_to_uid(token)

    lat = data.get('lat')
    lng = data.get('lng')
    city = data.get('city', '').lower().strip()
    zip_code = data.get('zip_code')
    address = data.get('formatted_address')

    location_data = {
        "last_known_location": {
            "lat": lat,
            "lng": lng,
            "city": city,
            "zip_code": zip_code,
            "address": address,
            "updated_at": firestore.SERVER_TIMESTAMP
        }
    }

    try:
        if uid:
            update_patient_location(uid, location_data)
            return jsonify({"message": "Location updated for user"}), 200
        else:
            return jsonify({"message": "Location received (Guest)"}), 200

    except Exception as e:
        print(f"Location Update Error: {e}")
        return jsonify({"error": "Failed to update location"}), 500


@location_bp.route('/latest-location', methods=['POST'])
def latest_location():
    data = request.get_json()
    token = data.get('token')

    uid = token_to_uid(token)
    if not uid:
        return jsonify({"message": "UnAuthorized"}), 401

    try:
        user_doc = get_db().collection("users").document(uid).get()
        if user_doc.exists:
            location = user_doc.to_dict().get("last_known_location")
            return jsonify({"message": "location found", "location": location}), 200
        return jsonify({"message": "User not found"}), 404
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"message": "no latest location found"}), 500


@location_bp.route('/save-clinic-coordinates', methods=['POST'])
def save_clinic_coordinates():
    data = request.get_json()
    token = data.get('token')
    lat = data.get('lat')
    lng = data.get('lng')

    doctor_uid = token_to_uid(token)
    if not doctor_uid:
        return jsonify({"message": "Unauthorized"}), 401

    try:
        save_doctor(doctor_uid, {
            'clinic_details': {
                'location': {'lat': lat, 'lng': lng}
            }
        }, merge=True)
        return jsonify({"message": "Clinic coordinates saved successfully"}), 200

    except Exception as e:
        print(f"Error saving coordinates: {e}")
        return jsonify({"error": str(e)}), 500


@location_bp.route('/get-appointment-locations', methods=['POST'])
def get_appointment_locations():
    data = request.get_json()
    token = data.get('token')
    doctor_uid = data.get('doctor_uid')

    patient_uid = token_to_uid(token)
    if not patient_uid:
        return jsonify({"message": "Unauthorized"}), 401

    try:
        patient_doc = get_patient_by_uid(patient_uid)
        patient_location = None

        if patient_doc and patient_doc.exists:
            patient_data = patient_doc.to_dict()
            last_location = patient_data.get('last_known_location', {})
            if last_location and 'lat' in last_location and 'lng' in last_location:
                patient_location = {
                    'lat': last_location['lat'],
                    'lng': last_location['lng'],
                    'address': last_location.get('address', ''),
                    'city': last_location.get('city', '')
                }
                print(f"Patient location found: {patient_location}")

        doctor_doc = get_doctor_by_uid(doctor_uid)
        clinic_location = None
        clinic_info = {}
        clinic_details = {}

        if doctor_doc and doctor_doc.exists:
            doctor_data = doctor_doc.to_dict()
            clinic_details = doctor_data.get('clinic_details', {})
            print(f"Doctor clinic details: {clinic_details}")

            maps_link = clinic_details.get('google_maps_link', '')

            if maps_link:
                print(f"Attempting to extract from maps link: {maps_link}")
                clinic_location = extract_coordinates_from_maps_link(maps_link)
                if clinic_location:
                    print(f"Successfully extracted clinic location: {clinic_location}")
                else:
                    print("Failed to extract coordinates from maps link")
            else:
                print("No Google Maps link found in clinic details")

            clinic_info = {
                'name': clinic_details.get('name', 'Unknown Clinic'),
                'address': clinic_details.get('address', ''),
                'zip_code': clinic_details.get('zip_code', ''),
                'google_maps_link': maps_link
            }
        else:
            print(f"Doctor document not found for UID: {doctor_uid}")

        return jsonify({
            'success': True,
            'patient_location': patient_location,
            'clinic_location': clinic_location,
            'clinic_info': clinic_info,
            'debug': {
                'doctor_uid': doctor_uid,
                'maps_link': clinic_details.get('google_maps_link', '') if doctor_doc and doctor_doc.exists else None
            }
        }), 200

    except Exception as e:
        print(f"Error fetching locations: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@location_bp.route('/test-maps-extraction', methods=['POST'])
def test_maps_extraction():
    data = request.get_json()
    maps_link = data.get('maps_link')

    if not maps_link:
        return jsonify({"error": "No maps_link provided"}), 400

    coords = extract_coordinates_from_maps_link(maps_link)

    return jsonify({
        'input': maps_link,
        'extracted_coordinates': coords,
        'success': coords is not None
    }), 200
