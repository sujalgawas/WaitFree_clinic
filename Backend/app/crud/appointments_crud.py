from firebase_admin import firestore
from app.db.firebase import get_db


def create_appointment(data):
    db = get_db()
    ref = db.collection('appointments').document()
    ref.set(data)
    return ref.id


def get_appointment_by_id(appt_id):
    db = get_db()
    doc = db.collection('appointments').document(appt_id).get()
    return doc if doc.exists else None


def get_appointments_by_patient(patient_uid):
    db = get_db()
    query = (
        db.collection('appointments')
        .where('patient_uid', '==', patient_uid)
        .order_by('created_at', direction=firestore.Query.DESCENDING)
    )
    return query.stream()


def get_appointments_by_doctor(doctor_uid):
    db = get_db()
    query = (
        db.collection('appointments')
        .where('doctor_uid', '==', doctor_uid)
        .order_by('date')
        .order_by('slot')
    )
    return query.stream()
