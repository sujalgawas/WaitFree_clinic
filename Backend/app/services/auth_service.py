from firebase_admin import auth


def get_username_from_email(email):
    return email.split('@')[0] if email else "User"


def token_to_uid(token):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token['uid']
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None
