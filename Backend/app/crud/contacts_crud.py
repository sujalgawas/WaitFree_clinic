from firebase_admin import firestore
from app.db.firebase import get_db


def save_contact(data):
    db = get_db()
    ref = db.collection('contact_submissions').document()
    ref.set(data)
    return ref.id


def get_contacts(status='all', limit=50):
    db = get_db()
    query = db.collection('contact_submissions')

    if status == 'unread':
        query = query.where('read', '==', False)
    elif status == 'replied':
        query = query.where('replied', '==', True)

    query = query.order_by('created_at', direction=firestore.Query.DESCENDING).limit(limit)
    return query.stream()


def get_contact_by_id(contact_id):
    db = get_db()
    doc = db.collection('contact_submissions').document(contact_id).get()
    return doc if doc.exists else None


def update_contact(contact_id, data):
    db = get_db()
    db.collection('contact_submissions').document(contact_id).update(data)
