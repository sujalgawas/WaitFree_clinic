from app.db.firebase import get_db


def get_doctor_by_uid(uid):
    db = get_db()
    doc = db.collection('doctors').document(uid).get()
    return doc if doc.exists else None


def get_doctor_by_name(name):
    db = get_db()
    query = db.collection('doctors').where('full_name', '==', name).limit(1)
    results = query.stream()
    for doc in results:
        data = doc.to_dict()
        data['uid'] = doc.id
        return data
    return None


def save_doctor(uid, data, merge=False):
    db = get_db()
    db.collection('doctors').document(uid).set(data, merge=merge)


def update_doctor(uid, data):
    db = get_db()
    db.collection('doctors').document(uid).update(data)


def find_doctor_by_stripe_customer(customer_id):
    db = get_db()
    query = db.collection('doctors').where('stripe_customer_id', '==', customer_id).limit(1)
    results = query.stream()
    for doc in results:
        return doc.id, doc.to_dict()
    return None, None
