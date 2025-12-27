import firebase_admin
from flask import Flask, jsonify, request
from flask_cors import CORS
from firebase_admin import credentials, initialize_app, firestore, auth
import json

cred = credentials.Certificate("./serviceAccountKey.json")
initialize_app(cred)

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

import json

@app.route('/patient-form', methods=['POST'])
def patient_form():
    token = request.form.get('token')
    
    uid = token_to_uid(token)
    if not uid:
        return jsonify({"message": "Unauthorized"}), 401

    profile_file = request.files.get('profile_image')
    
    profile_url = "default_avatar" 
    if profile_file:
        print(f"File received: {profile_file.filename}")
        profile_url = "pending_upload_url"

    full_name = request.form.get('full_name')
    date_of_birth = request.form.get('date_of_birth')
    gender = request.form.get('gender')
    blood_group = request.form.get('blood_group')
    height = request.form.get('height') # in cm
    weight = request.form.get('weight') # in kg

    emergency_name = request.form.get('emergency_name')
    emergency_phone = request.form.get('emergency_phone')
    emergency_relation = request.form.get('emergency_relation')

    allergies_str = request.form.get('allergies')
    chronic_conditions_str = request.form.get('chronic_conditions')
    
    allergies = json.loads(allergies_str) if allergies_str else []
    chronic_conditions = json.loads(chronic_conditions_str) if chronic_conditions_str else []

    patient_data = {
        "full_name": full_name,
        "email": request.form.get('email'),
        "profile_completed": True,
        "profile_image": profile_url,

        "personal_details": {
            "dob": date_of_birth,
            "gender": gender,
            "blood_group": blood_group,
            "height": height,
            "weight": weight
        },

        "medical_profile": {
            "allergies": allergies,
            "chronic_conditions": chronic_conditions,
        },

        "emergency_contact": {
            "name": emergency_name,
            "phone": emergency_phone,
            "relation": emergency_relation
        }
    }

    try:
        db.collection('patients').document(uid).set(patient_data, merge=True)
        
        return jsonify({
            "message": "Patient profile saved successfully",
            "uid": uid
        }), 200

    except Exception as e:
        print(f"Database Error: {e}")
        return jsonify({"error": "Failed to save profile"}), 500
    
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
    
@app.route('/doctor-form', methods=['POST'])
def doctor_form():
    token = request.form.get('token')
    
    uid = token_to_uid(token)
    if not uid:
        return jsonify({"message": "Unauthorized"}), 401

    degree_file = request.files.get('degree_proof')
    
    degree_url = "pending_upload" 
    if degree_file:
        print(f"File received: {degree_file.filename}")

    full_name = request.form.get('full_name')
    specialization = request.form.get('specialization')
    reg_number = request.form.get('reg_number')
    medical_council = request.form.get('medical_council')
    reg_year = request.form.get('reg_year')
    experience_years = request.form.get('experience_years')
    
    clinic_name = request.form.get('clinic_name')
    address_line = request.form.get('address_line')
    
    city = request.form.get('city', '').lower().strip() 
    zip_code = request.form.get('zip_code')
    google_maps_link = request.form.get('google_maps_link')
    
    consultation_fee = request.form.get('consultation_fee')
    morning_start = request.form.get('morning_start')
    morning_end = request.form.get('morning_end')
    evening_start = request.form.get('evening_start')
    evening_end = request.form.get('evening_end')

    days_open_str = request.form.get('days_open')
    days_open = json.loads(days_open_str) if days_open_str else {}

    doctor_data = {
        "full_name": full_name,
        "specialization": specialization,
        "city": city,
        "consultation_fee": consultation_fee,
        "is_verified": False,
        "profile_completed": True,

        "personal_details": {
            "reg_number": reg_number,
            "medical_council": medical_council,
            "reg_year": reg_year,
            "degree_proof_url": degree_url, 
            "experience_years": experience_years
        },
        
        "clinic_details": {
            "name": clinic_name,
            "address": address_line,
            "zip_code": zip_code,
            "google_maps_link": google_maps_link
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

    try:
        db.collection('doctors').document(uid).set(doctor_data)
        
        return jsonify({
            "message": "Doctor profile saved successfully",
            "uid": uid
        }), 200

    except Exception as e:
        print(f"Database Error: {e}")
        return jsonify({"error": "Failed to save profile"}), 500

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