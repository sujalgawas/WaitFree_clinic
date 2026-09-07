import os
import json
import firebase_admin
from firebase_admin import credentials, firestore, storage as fb_storage

_db = None
_bucket = None


def init_firebase():
    global _db, _bucket
    if firebase_admin._apps:
        _db = firestore.client()
        _bucket = fb_storage.bucket()
        return

    cred = None

    # 1. Environment variable with raw JSON string (e.g., Render Dashboard Secret)
    env_json = os.environ.get('FIREBASE_CREDENTIALS_JSON')
    if env_json:
        try:
            cred_dict = json.loads(env_json)
            cred = credentials.Certificate(cred_dict)
        except Exception as e:
            print(f"Warning: Failed to parse FIREBASE_CREDENTIALS_JSON: {e}")

    # 2. Check explicit path or common locations (e.g. Render Secret File, local dir)
    if not cred:
        candidate_paths = [
            os.environ.get('FIREBASE_CREDENTIALS_PATH'),
            '/etc/secrets/serviceAccountKey.json',
            './serviceAccountKey.json',
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'serviceAccountKey.json'),
            os.path.join(os.getcwd(), 'serviceAccountKey.json'),
            os.path.join(os.getcwd(), 'Backend', 'serviceAccountKey.json')
        ]
        for path in candidate_paths:
            if path and os.path.exists(path):
                try:
                    cred = credentials.Certificate(path)
                    break
                except Exception as e:
                    print(f"Warning: Failed loading credentials from {path}: {e}")

    if not cred:
        raise FileNotFoundError(
            "Firebase credentials not found! Set FIREBASE_CREDENTIALS_JSON env var, "
            "or mount serviceAccountKey.json at /etc/secrets/serviceAccountKey.json or ./serviceAccountKey.json."
        )

    firebase_admin.initialize_app(cred, {
        'storageBucket': 'waitfreeclinic.firebasestorage.app'
    })
    _db = firestore.client()
    _bucket = fb_storage.bucket()


def get_db():
    return _db


def get_bucket():
    return _bucket
