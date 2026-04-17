from flask import Blueprint, request, jsonify
from app.services.auth_service import token_to_uid
from app.db.firebase import get_db

search_bp = Blueprint('search', __name__)


@search_bp.route('/get-doctor-profile', methods=['POST'])
def get_doctor_profile():
    data = request.get_json()
    doctor_name = data.get('doctor_name')

    if not doctor_name:
        return jsonify({"message": "Doctor name required"}), 400

    try:
        db = get_db()
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


@search_bp.route('/search', methods=['POST'])
def search():
    data = request.get_json()
    location_filter = data.get('location')
    search_query = data.get('query', '').lower()

    city = location_filter.get("city").lower() if location_filter else None

    try:
        db = get_db()
        query_ref = db.collection('doctors')

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
                    "distance": "2.5",
                    "rating": 4.8,
                    "verified": d.get('is_verified', False),
                    "photo": "👨‍⚕️",
                    "online": True,
                    "nextSlot": "10:00 AM",
                    "slots": [
                        d.get("availability", {}).get("morning_shift", {}).get("start", "10:00"),
                        d.get("availability", {}).get("evening_shift", {}).get("start", "17:00")
                    ]
                })

        return jsonify({"results": doctors_list}), 200

    except Exception as e:
        print(f"Search Error: {e}")
        return jsonify({"error": "Search failed"}), 500
