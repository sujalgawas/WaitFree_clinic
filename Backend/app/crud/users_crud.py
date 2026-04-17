from app.db.firebase import get_db


def get_user_by_uid(uid):
    db = get_db()
    doc = db.collection('users').document(uid).get()
    return doc if doc.exists else None


def save_user(uid, data):
    db = get_db()
    db.collection('users').document(uid).set(data)
