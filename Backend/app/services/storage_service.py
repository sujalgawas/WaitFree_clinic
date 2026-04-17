import os
from datetime import datetime
from werkzeug.utils import secure_filename
from app.db.firebase import get_bucket

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def allowed_file(filename):
    """Check if file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def upload_file_to_storage(file, folder, uid):
    """
    Upload a file to Firebase Storage under folder/uid/timestamp_filename.
    Returns (public_url, blob) tuple.
    """
    filename = secure_filename(file.filename)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    blob_name = f"{folder}/{uid}/{timestamp}_{filename}"

    bucket = get_bucket()
    blob = bucket.blob(blob_name)
    blob.upload_from_file(file, content_type=file.content_type)
    blob.make_public()

    return blob.public_url, blob
