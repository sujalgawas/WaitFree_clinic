from flask import Blueprint, request, jsonify
from firebase_admin import auth
from app.services.auth_service import token_to_uid, get_username_from_email
from app.crud.users_crud import get_user_by_uid, save_user

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to the WaitFree Clinic Backend!"})


@auth_bp.route('/verify-token', methods=['POST'])
def verify_token():
    data = request.get_json()
    token = data.get('token')

    if not token:
        return jsonify({"message": "No token provided", "verified": False}), 400

    uid = token_to_uid(token)

    if uid:
        return jsonify({"message": "Token is valid", "verified": True}), 200
    else:
        return jsonify({"message": "Token is expired or invalid", "verified": False}), 401


@auth_bp.route('/signup-doctor', methods=['POST'])
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

        user_data = {
            "email": email,
            "phone_number": phone_number,
            'user': user_type,
            'userName': get_username_from_email(email)
        }

        save_user(user.uid, user_data)

        return jsonify({"message": "user created successfully", "uid": user.uid}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@auth_bp.route('/login-doctor', methods=['POST'])
def login_doctor():
    data = request.get_json()
    token = data.get('token')

    try:
        decode_token = auth.verify_id_token(token)
        uid = decode_token['uid']

        user_doc = get_user_by_uid(uid)

        if not user_doc:
            return jsonify({"message": "User not found"}), 404

        user_data = user_doc.to_dict()
        user_type = user_data.get("user")
        user_name = user_data.get("userName", get_username_from_email(user_data.get("email")))

        if user_type != "doctor":
            return jsonify({"message": "Login in on Patient login page"}), 403

        return jsonify({
            "message": "login successful",
            "token": token,
            "user": user_type,
            "userName": user_name,
            "user_data": user_data
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@auth_bp.route('/signup-patient', methods=['POST'])
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

        save_user(user.uid, user_data)

        return jsonify({"message": "user created successfully", "uid": user.uid}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@auth_bp.route('/login-patient', methods=['POST'])
def login_patient():
    data = request.get_json()
    token = data.get('token')

    try:
        decode_token = auth.verify_id_token(token)
        uid = decode_token['uid']

        user_doc = get_user_by_uid(uid)

        if not user_doc:
            return jsonify({"message": "User not found"}), 404

        user_data = user_doc.to_dict()
        user_type = user_data.get("user")
        user_name = user_data.get("userName", get_username_from_email(user_data.get("email")))

        if user_type != "patient":
            return jsonify({"message": "Login in on Doctor login page"}), 403

        return jsonify({
            "message": "login successful",
            "token": token,
            "user": user_type,
            "userName": user_name,
            "user_data": user_data
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400
