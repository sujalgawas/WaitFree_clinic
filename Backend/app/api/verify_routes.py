"""
app/api/verify_routes.py

Flask Route: POST /verify-doctor-license
-----------------------------------------
This Blueprint connects the existing Flask backend to the MCP verification
server. When a doctor uploads their documents, this route:

  1. Authenticates the request using their Firebase token
  2. Reads the uploaded images
  3. Calls the AI agent (in mix_server/utils/ai_agent.py)
  4. Returns the verification result

NOTE: The agent runs synchronously (blocking). For production you'd use
a background task queue (like Celery or Google Cloud Tasks). For a capstone,
synchronous is fine — just expect the response to take 5–15 seconds.
"""

import os
import sys
from flask import Blueprint, request, jsonify
from app.services.auth_service import token_to_uid

# Add mix_server to the Python path so we can import from it
# (mix_server/ is a sibling of app/ inside Backend/)
_BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_MIX_SERVER = os.path.join(_BASE, "mix_server")
if _MIX_SERVER not in sys.path:
    sys.path.insert(0, _MIX_SERVER)

from utils.ai_agent import run_verification_agent  # noqa: E402

verify_bp = Blueprint("verify", __name__)


@verify_bp.route("/verify-doctor-license", methods=["POST"])
def verify_doctor_license():
    """
    Trigger the AI-powered doctor license verification pipeline.

    Expected multipart form-data:
        token          : Firebase ID token of the logged-in doctor
        license_image  : The medical license file (JPG/PNG/PDF)
        id_card_image  : Aadhaar card or PAN card image (JPG/PNG)

    Returns:
        200: { "status": "verified"|"rejected"|"needs_review",
               "reason": "...", "verified_at": "..." }
        400: { "message": "error description" }
        401: { "message": "Unauthorized" }
        500: { "message": "Verification process failed" }
    """

    # ── Authentication ────────────────────────────────────────────────────────
    token = request.form.get("token")
    if not token:
        return jsonify({"message": "Token is required"}), 400

    uid = token_to_uid(token)
    if not uid:
        return jsonify({"message": "Unauthorized — invalid token"}), 401

    # ── File validation ───────────────────────────────────────────────────────
    license_file = request.files.get("license_image")
    id_card_file = request.files.get("id_card_image")

    if not license_file or license_file.filename == "":
        return jsonify({"message": "license_image file is required"}), 400

    if not id_card_file or id_card_file.filename == "":
        return jsonify({"message": "id_card_image file is required"}), 400

    allowed_types = {"image/jpeg", "image/png", "image/jpg", "application/pdf"}
    if license_file.mimetype not in allowed_types:
        return jsonify({"message": "license_image must be JPG, PNG, or PDF"}), 400

    if id_card_file.mimetype not in allowed_types:
        return jsonify({"message": "id_card_image must be JPG or PNG"}), 400

    # 10 MB limit per file
    MAX_SIZE = 10 * 1024 * 1024
    license_file.seek(0, 2)
    if license_file.tell() > MAX_SIZE:
        return jsonify({"message": "license_image exceeds 10 MB limit"}), 400
    license_file.seek(0)

    id_card_file.seek(0, 2)
    if id_card_file.tell() > MAX_SIZE:
        return jsonify({"message": "id_card_image exceeds 10 MB limit"}), 400
    id_card_file.seek(0)

    # ── Run the verification agent ────────────────────────────────────────────
    try:
        license_bytes = license_file.read()
        id_card_bytes = id_card_file.read()

        result = run_verification_agent(
            uid=uid,
            license_image_bytes=license_bytes,
            id_card_image_bytes=id_card_bytes,
        )

        return jsonify({
            "status": result.get("status"),
            "reason": result.get("reason"),
            "confidence": result.get("confidence"),
            "checks_passed": result.get("checks_passed", []),
            "checks_failed": result.get("checks_failed", []),
        }), 200

    except ValueError as e:
        # Config errors (missing API keys, etc.)
        return jsonify({"message": str(e)}), 400

    except Exception as e:
        print(f"❌ Verification agent error for UID {uid}: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"message": "Verification process failed. Please try again."}), 500
