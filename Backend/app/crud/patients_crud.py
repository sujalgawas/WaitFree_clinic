from app.db.firebase import get_db


def get_patient_by_uid(uid):
    db = get_db()
    doc = db.collection('patients').document(uid).get()
    return doc if doc.exists else None


def save_patient(uid, data, merge=False):
    db = get_db()
    db.collection('patients').document(uid).set(data, merge=merge)


def update_patient_location(uid, location_data):
    db = get_db()
    db.collection('patients').document(uid).set(location_data, merge=True)
