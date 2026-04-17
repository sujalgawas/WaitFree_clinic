import firebase_admin
from firebase_admin import credentials, firestore, storage as fb_storage

_db = None
_bucket = None


def init_firebase():
    global _db, _bucket
    cred = credentials.Certificate("./serviceAccountKey.json")
    firebase_admin.initialize_app(cred, {
        'storageBucket': 'waitfreeclinic.firebasestorage.app'
    })
    _db = firestore.client()
    _bucket = fb_storage.bucket()


def get_db():
    return _db


def get_bucket():
    return _bucket
