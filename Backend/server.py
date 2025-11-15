import firebase_admin
from flask import Flask, jsonify, request
from flask_cors import CORS
from firebase_admin import credentials, initialize_app, firestore, auth

cred = credentials.Certificate("./serviceAccountKey.json")
initialize_app(cred)

db = firestore.client()


app = Flask(__name__)
CORS(app)

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    phone_number = data.get('phone_number')
    #these fields are not finalized
    try:
        user = auth.create_user(
            email=email,
            password=password
        )
        
        db.collection("users").document(user.uid).set({
            "email": email,
            "phone_number": phone_number,
            #these fileds are not finalized
        })
        
        return jsonify({
            "message": "user created successfully",
            "uid": user.uid
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400    

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    token = data.get('token')
    
    decode_token = auth.verify_id_token(token)
    uid = decode_token['uid']
    
    user_doc = db.collection("users").document(uid).get()
    if user_doc.exists:
        user_data = user_doc.to_dict()
        return jsonify({
            "message": "login successful",
            "user_data": user_data
        }), 200

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to the WaitFree Clinic Backend!"})

if __name__ == "__main__":
    app.run(debug=True)
