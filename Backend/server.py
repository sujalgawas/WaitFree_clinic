import firebase_admin
from flask import Flask, jsonify, request
from flask_cors import CORS
from firebase_admin import credentials, initialize_app, firestore, auth
import json
import re
from urllib.parse import unquote
from firebase_admin import storage
from werkzeug.utils import secure_filename
import os
from datetime import datetime
import json

cred = credentials.Certificate("./serviceAccountKey.json")
#initialize_app(cred)

firebase_admin.initialize_app(cred, {
    'storageBucket': 'waitfreeclinic.firebasestorage.app'  # Replace with your bucket URL
})

bucket = storage.bucket()

db = firestore.client()

app = Flask(__name__)
# Allow CORS for all domains
CORS(app, resources={r"/*": {"origins": "*"}})

# --- Helper Function for Name ---
def get_username_from_email(email):
    return email.split('@')[0] if email else "User"

# Helper function 
def token_to_uid(token):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token['uid']
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None

@app.route('/check-profile', methods=['POST'])
def check_profile():
    """Check if user has completed their profile form"""
    try:
        data = request.get_json()
        token = data.get('token')
        user_type = data.get('user_type')
        
        if not token or not user_type:
            return jsonify({"message": "Token and user_type required"}), 400
        
        uid = token_to_uid(token)
        if not uid:
            return jsonify({"message": "Unauthorized - Invalid token"}), 401
        
        # Check the appropriate collection based on user type
        collection_name = 'doctors' if user_type == 'doctor' else 'patients'
        
        try:
            doc = db.collection(collection_name).document(uid).get()
            
            if doc.exists:
                data = doc.to_dict()
                profile_completed = data.get('profile_completed', False)
                
                return jsonify({
                    "profile_completed": profile_completed,
                    "user_type": user_type,
                    "uid": uid
                }), 200
            else:
                # User document doesn't exist - profile not completed
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

@app.route('/patient-form', methods=['POST'])
def patient_form():
    try:
        # 1. TOKEN VALIDATION
        token = request.form.get('token')
        if not token:
            return jsonify({"message": "Token is required"}), 400
        
        uid = token_to_uid(token)
        if not uid:
            return jsonify({"message": "Unauthorized - Invalid token"}), 401

        # 2. REQUIRED FIELD VALIDATION
        required_fields = ['full_name', 'date_of_birth', 'gender', 'emergency_name', 'emergency_phone', 'emergency_relation']
        
        missing_fields = [field for field in required_fields if not request.form.get(field)]
        if missing_fields:
            return jsonify({
                "message": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400

        # 3. PROFILE IMAGE UPLOAD (Optional)
        profile_file = request.files.get('profile_image')
        profile_url = "default_avatar"  # Default if no image uploaded
        
        if profile_file and profile_file.filename != '':
            print(f"File received: {profile_file.filename}")
            
            # Validate file type
            if not allowed_file(profile_file.filename):
                return jsonify({
                    "message": "Invalid file type. Allowed: PNG, JPG, JPEG"
                }), 400
            
            # Validate file size
            profile_file.seek(0, os.SEEK_END)
            file_size = profile_file.tell()
            profile_file.seek(0)
            
            if file_size > MAX_FILE_SIZE:
                return jsonify({"message": "Profile image size exceeds 5MB limit"}), 400
            
            # Upload to Firebase Storage
            try:
                filename = secure_filename(profile_file.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                blob_name = f"patient_profiles/{uid}/{timestamp}_{filename}"
                
                bucket = storage.bucket()
                blob = bucket.blob(blob_name)
                blob.upload_from_file(profile_file, content_type=profile_file.content_type)
                blob.make_public()
                profile_url = blob.public_url
                
                print(f"✅ Profile image uploaded: {blob_name}")
                
            except Exception as upload_error:
                print(f"❌ Firebase Storage Error: {upload_error}")
                return jsonify({"message": "Failed to upload profile image"}), 500

        # 4. EXTRACT AND VALIDATE FORM DATA
        full_name = request.form.get('full_name', '').strip()
        date_of_birth = request.form.get('date_of_birth', '').strip()
        gender = request.form.get('gender', '').strip()
        blood_group = request.form.get('blood_group', '').strip()
        height = request.form.get('height', '').strip()
        weight = request.form.get('weight', '').strip()
        
        # Emergency contact
        emergency_name = request.form.get('emergency_name', '').strip()
        emergency_phone = request.form.get('emergency_phone', '').strip()
        emergency_relation = request.form.get('emergency_relation', '').strip()

        # CRITICAL FIX: Handle allergies and chronic conditions
        # Frontend sends as comma-separated strings, NOT JSON
        allergies_input = request.form.get('allergies_input', '').strip()
        chronic_conditions_input = request.form.get('chronic_conditions_input', '').strip()
        
        # Split by comma and clean up whitespace
        allergies = [a.strip() for a in allergies_input.split(',') if a.strip()] if allergies_input else []
        chronic_conditions = [c.strip() for c in chronic_conditions_input.split(',') if c.strip()] if chronic_conditions_input else []
        
        print(f"Allergies parsed: {allergies}")
        print(f"Chronic conditions parsed: {chronic_conditions}")

        # Validate numeric fields
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

        # Get email from existing user data (if available) or from form
        email = request.form.get('email', '')

        # 5. PREPARE PATIENT DATA
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

        # 6. SAVE TO FIRESTORE
        try:
            # Use merge=True to preserve existing data (like email from registration)
            db.collection('patients').document(uid).set(patient_data, merge=True)
            
            print(f"✅ Patient profile saved for UID: {uid}")
            
            return jsonify({
                "message": "Patient profile saved successfully",
                "uid": uid,
                "profile_completed": True
            }), 200

        except Exception as db_error:
            print(f"❌ Firestore Error: {db_error}")
            # Cleanup uploaded image if database save fails
            if profile_url != "default_avatar":
                try:
                    blob.delete()
                    print("🗑️ Cleaned up uploaded file after database error")
                except:
                    pass
            return jsonify({"message": "Failed to save profile to database"}), 500

    except Exception as e:
        print(f"❌ Unexpected Error in patient_form: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"message": "An unexpected error occurred"}), 500

# Helper function to extract coordinates from Google Maps link
def extract_coordinates_from_maps_link(maps_link):
    """
    Extract lat/lng from Google Maps link
    Supports multiple URL formats
    """
    import re
    
    if not maps_link:
        return None
    
    # Try different Google Maps URL patterns
    patterns = [
        r'@(-?\d+\.\d+),(-?\d+\.\d+)',  # @lat,lng format
        r'q=(-?\d+\.\d+),(-?\d+\.\d+)',  # q=lat,lng format
        r'll=(-?\d+\.\d+),(-?\d+\.\d+)', # ll=lat,lng format
        r'/place/[^/]+/@(-?\d+\.\d+),(-?\d+\.\d+)', # /place format
    ]
    
    for pattern in patterns:
        match = re.search(pattern, maps_link)
        if match:
            return {
                'lat': float(match.group(1)),
                'lng': float(match.group(2))
            }
    
    return None


@app.route('/save-clinic-coordinates', methods=['POST'])
def save_clinic_coordinates():
    """
    Save clinic coordinates directly to the doctor's profile
    This is useful when setting up the doctor profile
    """
    data = request.get_json()
    token = data.get('token')
    lat = data.get('lat')
    lng = data.get('lng')
    
    # Verify doctor
    doctor_uid = token_to_uid(token)
    if not doctor_uid:
        return jsonify({"message": "Unauthorized"}), 401
    
    try:
        # Update doctor's clinic location
        db.collection('doctors').document(doctor_uid).set({
            'clinic_details': {
                'location': {
                    'lat': lat,
                    'lng': lng
                }
            }
        }, merge=True)
        
        return jsonify({"message": "Clinic coordinates saved successfully"}), 200
        
    except Exception as e:
        print(f"Error saving coordinates: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/get-appointment-details', methods=['POST'])
def get_appointment_details():
    data = request.get_json()
    token = data.get('token')
    appointment_id = data.get('appointment_id')
    
    # Verify user
    patient_uid = token_to_uid(token)
    if not patient_uid:
        return jsonify({"message": "Unauthorized"}), 401
    
    try:
        # Fetch specific appointment
        appt_doc = db.collection('appointments').document(appointment_id).get()
        
        if not appt_doc.exists:
            return jsonify({"message": "Appointment not found"}), 404
        
        appt_data = appt_doc.to_dict()
        
        # Verify this appointment belongs to the user
        if appt_data.get('patient_uid') != patient_uid:
            return jsonify({"message": "Unauthorized access"}), 403
        
        # Get doctor details for more info
        doctor_uid = appt_data.get('doctor_uid')
        doctor_doc = db.collection('doctors').document(doctor_uid).get()
        
        if doctor_doc.exists:
            doctor_data = doctor_doc.to_dict()
            
            # Extract clinic location from Google Maps link if available
            maps_link = doctor_data.get('clinic_details', {}).get('google_maps_link', '')
            clinic_location = extract_coordinates_from_maps_link(maps_link)
            
            # Enrich appointment data
            appt_data['clinic_location'] = clinic_location
            appt_data['doctor_phone'] = doctor_data.get('clinic_details', {}).get('phone')
            appt_data['doctor_specialization'] = doctor_data.get('specialization')
        
        appt_data['id'] = appt_doc.id
        
        # Convert timestamp if needed
        if 'created_at' in appt_data and appt_data['created_at']:
            appt_data['created_at'] = appt_data['created_at'].strftime('%Y-%m-%d %H:%M')
        
        return jsonify({"appointment": appt_data}), 200
        
    except Exception as e:
        print(f"Error fetching appointment details: {e}")
        return jsonify({"error": str(e)}), 500



def extract_coordinates_from_maps_link(maps_link):
    """
    Extract lat/lng from Google Maps link - Improved version
    Supports multiple URL formats including share links
    """
    if not maps_link:
        return None
    
    # Decode URL-encoded characters
    decoded_link = unquote(maps_link)
    
    # Try different Google Maps URL patterns
    patterns = [
        # Standard format: @lat,lng,zoom
        r'@(-?\d+\.\d+),(-?\d+\.\d+)',
        # Query format: q=lat,lng
        r'q=(-?\d+\.\d+),(-?\d+\.\d+)',
        # LatLng format: ll=lat,lng
        r'll=(-?\d+\.\d+),(-?\d+\.\d+)',
        # Place format with coordinates
        r'/place/[^/]+/@(-?\d+\.\d+),(-?\d+\.\d+)',
        # Direct coordinate format
        r'maps\?.*?(-?\d+\.\d+),(-?\d+\.\d+)',
        # Short URL format after redirect
        r'destination=(-?\d+\.\d+),(-?\d+\.\d+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, decoded_link)
        if match:
            lat = float(match.group(1))
            lng = float(match.group(2))
            
            # Validate coordinates are within valid ranges
            if -90 <= lat <= 90 and -180 <= lng <= 180:
                print(f"Extracted coordinates: {lat}, {lng} from {maps_link}")
                return {
                    'lat': lat,
                    'lng': lng
                }
    
    print(f"Could not extract coordinates from: {maps_link}")
    return None


@app.route('/get-appointment-locations', methods=['POST'])
def get_appointment_locations():
    """
    Get accurate locations for both patient and clinic
    """
    data = request.get_json()
    token = data.get('token')
    doctor_uid = data.get('doctor_uid')
    
    # Verify patient
    patient_uid = token_to_uid(token)
    if not patient_uid:
        return jsonify({"message": "Unauthorized"}), 401
    
    try:
        # Get patient location from patients collection
        patient_doc = db.collection('patients').document(patient_uid).get()
        patient_location = None
        
        if patient_doc.exists:
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
        
        # Get doctor/clinic location from doctors collection
        doctor_doc = db.collection('doctors').document(doctor_uid).get()
        clinic_location = None
        clinic_info = {}
        
        if doctor_doc.exists:
            doctor_data = doctor_doc.to_dict()
            clinic_details = doctor_data.get('clinic_details', {})
            
            print(f"Doctor clinic details: {clinic_details}")
            
            # Get Google Maps link from clinic details
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
            
            # Prepare clinic info
            clinic_info = {
                'name': clinic_details.get('name', 'Unknown Clinic'),
                'address': clinic_details.get('address', ''),
                'zip_code': clinic_details.get('zip_code', ''),
                'google_maps_link': maps_link
            }
        else:
            print(f"Doctor document not found for UID: {doctor_uid}")
        
        # Return both locations
        return jsonify({
            'success': True,
            'patient_location': patient_location,
            'clinic_location': clinic_location,
            'clinic_info': clinic_info,
            'debug': {
                'doctor_uid': doctor_uid,
                'maps_link': clinic_details.get('google_maps_link', '') if doctor_doc.exists else None
            }
        }), 200
        
    except Exception as e:
        print(f"Error fetching locations: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route('/test-maps-extraction', methods=['POST'])
def test_maps_extraction():
    """
    Test endpoint to verify coordinate extraction from Google Maps links
    Useful for debugging
    """
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

    
@app.route('/get-doctor-schedule', methods=['POST'])
def get_doctor_schedule():
    data = request.get_json()
    token = data.get('token')
    
    # Verify the doctor's UID using your existing token function
    doctor_uid = token_to_uid(token)
    if not doctor_uid:
        return jsonify({"message": "Unauthorized"}), 401

    try:
        appointments_ref = db.collection('appointments')
        
        # Query where doctor_uid matches. 
        # Note: If this fails, check terminal for the Index link!
        query = appointments_ref.where('doctor_uid', '==', doctor_uid).order_by('date').order_by('slot')
        results = query.stream()

        schedule = []
        for doc in results:
            appt = doc.to_dict()
            appt['id'] = doc.id
            schedule.append(appt)

        return jsonify({"schedule": schedule}), 200
    except Exception as e:
        print(f"Schedule Error: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/get-user-appointments', methods=['POST'])
def get_user_appointments():
    data = request.get_json()
    token = data.get('token')
    
    # 1. Verify User
    # Assuming your token_to_uid function is already defined
    patient_uid = token_to_uid(token) 
    if not patient_uid:
        return jsonify({"message": "Unauthorized"}), 401

    try:
        appointments_ref = db.collection('appointments')
        
        # 2. Query Firestore
        # NOTE: If this fails, check your terminal for a link to create a Firestore Index
        query = appointments_ref.where('patient_uid', '==', patient_uid).order_by('created_at', direction=firestore.Query.DESCENDING)
        results = query.stream()

        appointments = []
        for doc in results:
            appt = doc.to_dict()
            appt['id'] = doc.id
            
            # Convert Firestore Timestamp to string for JSON compatibility
            if 'created_at' in appt and appt['created_at']:
                appt['created_at'] = appt['created_at'].strftime('%Y-%m-%d %H:%M')
                
            appointments.append(appt)

        return jsonify({"appointments": appointments}), 200

    except Exception as e:
        print(f"Error fetching appointments: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/latest-location', methods=['POST'])
def latest_location():
    data = request.get_json()
    token = data.get('token')
    
    uid = token_to_uid(token)
    if not uid:
        return jsonify({"message": "UnAuthorized"}), 401
    
    try:
        user_doc = db.collection("users").document(uid).get()
        if user_doc.exists:
            location = user_doc.to_dict().get("last_known_location")
            return jsonify({
                "message": "location found",
                "location": location
            }), 200
        return jsonify({"message": "User not found"}), 404
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"message": "no latest location found"}), 500

@app.route('/get-doctor-profile', methods=['POST'])
def get_doctor_profile():
    data = request.get_json()
    doctor_name = data.get('doctor_name')
    
    if not doctor_name:
        return jsonify({"message": "Doctor name required"}), 400
        
    try:
        # Query by name (make sure you have an index if this gets slow)
        query = db.collection('doctors').where('full_name', '==', doctor_name).limit(1)
        results = query.stream()
        
        doctor_data = None
        for doc in results:
            doctor_data = doc.to_dict()
            doctor_data['uid'] = doc.id
            break
            
        if doctor_data:
            return jsonify({"message": "Found", "doctor": doctor_data}), 200
        else:
            return jsonify({"message": "Not found"}), 404
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/booking', methods=['POST'])
def booking():
    data = request.get_json()
    
    # 1. Verify Patient (User)
    token = data.get('token')
    patient_uid = token_to_uid(token)
    if not patient_uid:
        return jsonify({"message": "Unauthorized"}), 401

    # 2. Get Data
    doctor_name = data.get('doctorName') # Matches frontend 'doctorName'
    timing = data.get('slot')            # Matches frontend 'slot'
    date = data.get('date')              # Matches frontend 'date'
    
    try:
        # 3. Find Doctor UID from Name
        # In a real app, you should send doctor_uid from frontend directly.
        # But since we are using name, we search for it.
        doctors_ref = db.collection('doctors')
        query = doctors_ref.where('full_name', '==', doctor_name).limit(1)
        results = query.stream()
        
        doctor_uid = None
        doctor_data = {}
        
        for doc in results:
            doctor_uid = doc.id
            doctor_data = doc.to_dict()
            break
            
        if not doctor_uid:
            return jsonify({"message": "Doctor not found"}), 404

        # 4. Create Appointment Object
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
        
        # 5. Save to a dedicated 'appointments' collection
        # This is better than saving inside user docs because it's easier to query
        # "Find all appointments for doctor X" or "for patient Y"
        new_appt_ref = db.collection('appointments').document()
        new_appt_ref.set(appointment_data)
        
        return jsonify({
            "message": "Booking successful",
            "appointment_id": new_appt_ref.id
        }), 200

    except Exception as e:
        print(f"Booking Error: {e}")
        return jsonify({"message": "Booking failed", "error": str(e)}), 500

@app.route('/search', methods=['POST'])
def search():
    data = request.get_json()
    
    location_filter = data.get('location') 
    search_query = data.get('query', '').lower()
    
    city = location_filter.get("city").lower() if location_filter else None
    
    try:
        doctors_ref = db.collection('doctors')
        query_ref = doctors_ref
        
        if city:
            query_ref = query_ref.where('city', '==', city)
            
        results = query_ref.stream()
        
        doctors_list = []
        for doc in results:
            d = doc.to_dict()
            
            name = d.get('full_name', '').lower()
            specialty = d.get('specialization', '').lower()
            
            if search_query in name or search_query in specialty:
                doctors_list.append({
                    "id": doc.id,
                    "name": d.get('full_name'),
                    "specialty": d.get('specialization'),
                    "experience": d.get('personal_details', {}).get('experience_years', 0),
                    "clinic": d.get('clinic_details', {}).get('name'),
                    "fees": d.get('consultation_fee'),
                    "distance": "2.5", # Placeholder or calculate if you have lat/lng
                    "rating": 4.8, # Placeholder or fetch from 'reviews' collection
                    "verified": d.get('is_verified', False),
                    "photo": "👨‍⚕️", # Placeholder emoji or image URL
                    "online": True, # Logic for online status
                    "nextSlot": "10:00 AM", # Logic for next slot
                    "slots": [d.get("availability",{}).get("morning_shift",{}).get("start", "10:00"), d.get("availability",{}).get("evening_shift",{}).get("start", "17:00")]
                })
                
        return jsonify({"results": doctors_list}), 200

    except Exception as e:
        print(f"Search Error: {e}")
        return jsonify({"error": "Search failed"}), 500
    
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def allowed_file(filename):
    """Check if file has allowed extension"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/doctor-form', methods=['POST'])
def doctor_form():
    try:
        # 1. TOKEN VALIDATION
        token = request.form.get('token')
        if not token:
            return jsonify({"message": "Token is required"}), 400
        
        uid = token_to_uid(token)
        if not uid:
            return jsonify({"message": "Unauthorized - Invalid token"}), 401

        # 2. REQUIRED FIELD VALIDATION
        required_fields = [
            'full_name', 'specialization', 'reg_number', 'medical_council',
            'reg_year', 'experience_years', 'clinic_name', 'address_line',
            'city', 'zip_code', 'consultation_fee', 'morning_start',
            'morning_end', 'evening_start', 'evening_end', 'days_open'
        ]
        
        missing_fields = [field for field in required_fields if not request.form.get(field)]
        if missing_fields:
            return jsonify({
                "message": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400

        # 3. FILE VALIDATION AND UPLOAD
        degree_file = request.files.get('degree_proof')
        degree_url = "pending_upload"
        
        if not degree_file:
            return jsonify({"message": "Degree proof file is required"}), 400
        
        if degree_file.filename == '':
            return jsonify({"message": "No file selected"}), 400
        
        if not allowed_file(degree_file.filename):
            return jsonify({
                "message": "Invalid file type. Allowed: PDF, PNG, JPG, JPEG"
            }), 400
        
        # Check file size
        degree_file.seek(0, os.SEEK_END)
        file_size = degree_file.tell()
        degree_file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({"message": "File size exceeds 5MB limit"}), 400
        
        # Upload to Firebase Storage
        try:
            filename = secure_filename(degree_file.filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            blob_name = f"doctor_degrees/{uid}/{timestamp}_{filename}"
            
            bucket = storage.bucket()
            blob = bucket.blob(blob_name)
            
            # Upload file
            blob.upload_from_file(
                degree_file,
                content_type=degree_file.content_type
            )
            
            # Make it publicly accessible (optional - adjust based on your security needs)
            blob.make_public()
            degree_url = blob.public_url
            
            print(f"✅ File uploaded successfully: {blob_name}")
            
        except Exception as upload_error:
            print(f"❌ Firebase Storage Error: {upload_error}")
            return jsonify({"message": "Failed to upload degree proof"}), 500

        # 4. EXTRACT AND VALIDATE FORM DATA
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

        # Parse days_open JSON
        days_open_str = request.form.get('days_open')
        try:
            days_open = json.loads(days_open_str) if days_open_str else {}
        except json.JSONDecodeError:
            return jsonify({"message": "Invalid days_open format"}), 400
        
        # Validate at least one day is selected
        if not any(days_open.values()):
            return jsonify({"message": "Please select at least one working day"}), 400

        # Validate numeric fields
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

        # 5. PREPARE DOCTOR DATA
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
                "morning_shift": {
                    "start": morning_start,
                    "end": morning_end
                },
                "evening_shift": {
                    "start": evening_start,
                    "end": evening_end
                }
            }
        }

        # 6. SAVE TO FIRESTORE
        try:
            db.collection('doctors').document(uid).set(doctor_data)
            
            print(f"✅ Doctor profile saved for UID: {uid}")
            
            return jsonify({
                "message": "Doctor profile saved successfully",
                "uid": uid,
                "profile_completed": True
            }), 200

        except Exception as db_error:
            print(f"❌ Firestore Error: {db_error}")
            # If database save fails, try to delete the uploaded file
            try:
                blob.delete()
                print("🗑️ Cleaned up uploaded file after database error")
            except:
                pass
            return jsonify({"message": "Failed to save profile to database"}), 500

    except Exception as e:
        print(f"❌ Unexpected Error in doctor_form: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"message": "An unexpected error occurred"}), 500

@app.route('/verify-token', methods=['POST'])
def verify_token():
    data = request.get_json()
    token = data.get('token')
    
    if not token:
        return jsonify({"message": "No token provided", "verified": False}), 400

    uid = token_to_uid(token)
    
    if uid:
        return jsonify({
            "message": "Token is valid",
            "verified": True
        }), 200
    else:
        return jsonify({
            "message": "Token is expired or invalid", 
            "verified": False
        }), 401

@app.route('/update-location', methods=['POST'])
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
            db.collection('patients').document(uid).set(location_data, merge=True)
            return jsonify({"message": "Location updated for user"}), 200
        else:
            return jsonify({"message": "Location received (Guest)"}), 200

    except Exception as e:
        print(f"Location Update Error: {e}")
        return jsonify({"error": "Failed to update location"}), 500

# --- DOCTOR ROUTES ---
@app.route('/signup-doctor', methods=['POST'])
def signup_doctor():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    phone_number = data.get('phone_number')
    user_type = "doctor"
    
    try:
        user = auth.create_user(
            email=email,
            password=password,
            phone_number=phone_number,
            disabled=False,
        )
        
        # Create user document
        user_data = {
            "email": email,
            "phone_number": phone_number,
            'user': user_type,
            'userName': get_username_from_email(email) # Saving default name
        }
        
        db.collection("users").document(user.uid).set(user_data)
        
        return jsonify({
            "message": "user created successfully",
            "uid": user.uid
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400    

@app.route('/login-doctor', methods=['POST'])
def login_doctor():
    data = request.get_json()
    token = data.get('token')
    
    try:
        decode_token = auth.verify_id_token(token)
        uid = decode_token['uid']
        
        user_doc = db.collection("users").document(uid).get()
        
        if not user_doc.exists:
             return jsonify({"message": "User not found"}), 404

        user_data = user_doc.to_dict()
        user_type = user_data.get("user")
        
        # Extract or generate a userName
        user_name = user_data.get("userName", get_username_from_email(user_data.get("email")))

        if user_type != "doctor":
            return jsonify({
                "message": "Login in on Patient login page",
            }), 403
            
        return jsonify({
            "message": "login successful",
            "token": token,
            "user": user_type,
            "userName": user_name,
            "user_data": user_data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# --- PATIENT ROUTES ---
@app.route('/signup-patient', methods=['POST'])
def signup_patient():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    phone_number = data.get('phone_number')
    user_type = "patient"
    
    try:
        user = auth.create_user(
            email=email,
            password=password,
            phone_number=phone_number,
            disabled=False,
        )
        
        user_data = {
            "email": email,
            "phone_number": phone_number,
            'user': user_type,
            'userName': get_username_from_email(email)
        }

        db.collection("users").document(user.uid).set(user_data)
        
        return jsonify({
            "message": "user created successfully",
            "uid": user.uid
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400    

@app.route('/login-patient', methods=['POST'])
def login_patient():
    data = request.get_json()
    token = data.get('token')
    
    try:
        decode_token = auth.verify_id_token(token)
        uid = decode_token['uid']
        
        user_doc = db.collection("users").document(uid).get()
        
        if not user_doc.exists:
             return jsonify({"message": "User not found"}), 404

        user_data = user_doc.to_dict()
        user_type = user_data.get("user")
        
        # Extract or generate a userName
        user_name = user_data.get("userName", get_username_from_email(user_data.get("email")))

        if user_type != "patient":
            return jsonify({
                "message": "Login in on Doctor login page",
            }), 403
            
        return jsonify({
            "message": "login successful",
            "token": token,
            "user": user_type,
            "userName": user_name,
            "user_data": user_data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400 

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to the WaitFree Clinic Backend!"})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)