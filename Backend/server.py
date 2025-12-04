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

@app.route('/doctor-form', methods=['POST'])
def doctor_form():
    token = request.form.get('token')
    
    # Verify token
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
        
@app.route('/search', methods=['POST'])
def search():
    pass

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
                "message": "Login in on Doctors login page",
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

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to the WaitFree Clinic Backend!"})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)