import os
import sys
import json
import base64
import glob
import firebase_admin
from firebase_admin import credentials, firestore, storage as fb_storage

_db = None
_bucket = None


def _parse_credential_dict(raw_data):
    if not raw_data or not str(raw_data).strip():
        return None

    cleaned = str(raw_data).strip()

    # Strip outer single or double quotes if present
    if (cleaned.startswith('"') and cleaned.endswith('"')) or (cleaned.startswith("'") and cleaned.endswith("'")):
        cleaned = cleaned[1:-1].strip()

    # 1. Direct JSON parse with strict=False (handles raw newlines in private key)
    try:
        parsed = json.loads(cleaned, strict=False)
        if isinstance(parsed, dict) and "private_key" in parsed:
            return parsed
        elif isinstance(parsed, str):
            parsed2 = json.loads(parsed, strict=False)
            if isinstance(parsed2, dict) and "private_key" in parsed2:
                return parsed2
    except Exception as e:
        sys.stderr.write(f"[Firebase] Standard JSON parse failed: {e}\n")

    # 2. Base64 decode (safe one-line format)
    try:
        decoded = base64.b64decode(cleaned).decode("utf-8")
        parsed = json.loads(decoded, strict=False)
        if isinstance(parsed, dict) and "private_key" in parsed:
            return parsed
    except Exception as e:
        sys.stderr.write(f"[Firebase] Base64 decode failed: {e}\n")

    # 3. Clean up escaped newlines
    try:
        fixed = cleaned.replace('\\n', '\n')
        parsed = json.loads(fixed, strict=False)
        if isinstance(parsed, dict) and "private_key" in parsed:
            return parsed
    except Exception as e:
        sys.stderr.write(f"[Firebase] Escaped newlines JSON parse failed: {e}\n")

    return None


def init_firebase():
    global _db, _bucket
    if firebase_admin._apps:
        _db = firestore.client()
        _bucket = fb_storage.bucket()
        return

    cred = None

    # 1. Check environment variables
    env_keys = [
        'FIREBASE_CREDENTIALS_JSON',
        'FIREBASE_CREDENTIALS_BASE64',
        'FIREBASE_CREDENTIALS',
        'FIREBASE_SERVICE_ACCOUNT',
        'GOOGLE_APPLICATION_CREDENTIALS_JSON'
    ]

    for key in env_keys:
        val = os.environ.get(key)
        if val:
            parsed = _parse_credential_dict(val)
            if parsed:
                try:
                    cred = credentials.Certificate(parsed)
                    sys.stderr.write(f"[Firebase] Successfully loaded credentials from env var: {key}\n")
                    break
                except Exception as e:
                    sys.stderr.write(f"[Firebase] Certificate initialization failed for {key}: {e}\n")

    # 2. Check secret files & paths
    if not cred:
        candidate_paths = [
            os.environ.get('FIREBASE_CREDENTIALS_PATH'),
            os.environ.get('GOOGLE_APPLICATION_CREDENTIALS'),
            '/etc/secrets/FIREBASE_CREDENTIALS_JSON',
            '/etc/secrets/serviceAccountKey.json',
            '/etc/secrets/serviceAccountKey',
            './serviceAccountKey.json',
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'serviceAccountKey.json'),
            os.path.join(os.getcwd(), 'serviceAccountKey.json'),
            os.path.join(os.getcwd(), 'Backend', 'serviceAccountKey.json')
        ]

        # Search for ANY file mounted in Render's /etc/secrets directory
        if os.path.exists('/etc/secrets'):
            for secret_file in glob.glob('/etc/secrets/*'):
                if os.path.isfile(secret_file) and secret_file not in candidate_paths:
                    candidate_paths.append(secret_file)

        for path in candidate_paths:
            if path and os.path.exists(path) and os.path.isfile(path):
                # Try 1: Load certificate directly from file path
                try:
                    cred = credentials.Certificate(path)
                    sys.stderr.write(f"[Firebase] Successfully loaded credentials from file path: {path}\n")
                    break
                except Exception as e1:
                    sys.stderr.write(f"[Firebase] Path load failed for {path}: {e1}, attempting content parsing...\n")

                # Try 2: Read file content and parse with lenient parser (handles JSON, unescaped newlines, base64)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        file_content = f.read()
                    parsed = _parse_credential_dict(file_content)
                    if parsed:
                        cred = credentials.Certificate(parsed)
                        sys.stderr.write(f"[Firebase] Successfully parsed credentials from file content: {path}\n")
                        break
                except Exception as e2:
                    sys.stderr.write(f"[Firebase] Content parse failed for {path}: {e2}\n")

    if not cred:
        # Diagnostic message for debugging in Render logs
        env_summary = {k: f"length={len(os.environ[k])}" for k in env_keys if k in os.environ}
        secret_files = glob.glob('/etc/secrets/*') if os.path.exists('/etc/secrets') else "directory /etc/secrets does not exist"
        err_msg = (
            f"Firebase credentials not found!\n"
            f"Environment variables checked: {env_summary}\n"
            f"Files in /etc/secrets: {secret_files}\n"
            f"Please ensure FIREBASE_CREDENTIALS_JSON (or FIREBASE_CREDENTIALS_BASE64) is set in your Render Environment Variables, "
            f"or upload serviceAccountKey.json under Render Secret Files."
        )
        sys.stderr.write(f"[Firebase ERROR] {err_msg}\n")
        raise FileNotFoundError(err_msg)

    firebase_admin.initialize_app(cred, {
        'storageBucket': 'waitfreeclinic.firebasestorage.app'
    })
    _db = firestore.client()
    _bucket = fb_storage.bucket()


def get_db():
    return _db


def get_bucket():
    return _bucket
