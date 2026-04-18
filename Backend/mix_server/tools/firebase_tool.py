"""
mix_server/tools/firebase_tool.py

MCP Tools: get_doctor_record, update_verification_status
----------------------------------------------------------
These tools let the AI agent READ from and WRITE TO Firestore.

WHY DOES THE AI AGENT NEED THESE?
  The AI agent runs INSIDE the MCP server, separate from Flask.
  It can't directly import Flask's `get_db()` from app.db.firebase because
  the MCP server initialises Firebase independently.

  These tools give the agent a clean interface:
    - get_doctor_record(uid) → returns everything about a doctor
    - update_verification_status(uid, ...) → writes the AI's verdict back

WHAT GETS WRITTEN TO FIRESTORE:
  After verification, the doctor's record gets these new fields:
    is_verified            : True / False
    verification_status    : "verified" | "rejected" | "needs_review"
    verification_reason    : Short explanation from the AI
    verification_details   : Full breakdown of each check
    verified_at            : ISO timestamp
"""

import os
import sys
from datetime import datetime, timezone
from server import mcp

# ---------------------------------------------------------------------------
# Firebase initialisation for the MCP server
# We can't reuse Flask's init_firebase() — that binds to the Flask app.
# Instead we initialize Firebase directly here, guarded so it only runs once.
# ---------------------------------------------------------------------------
import firebase_admin
from firebase_admin import credentials, firestore


def _get_db():
    """
    Return the Firestore client, initialising Firebase if needed.

    We use a named app ('mix_server') so this doesn't conflict with the
    Flask app's default Firebase instance.
    """
    app_name = "mix_server"
    try:
        app = firebase_admin.get_app(app_name)
    except ValueError:
        # App not initialised yet
        # Walk up from this file to find serviceAccountKey.json
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        key_path = os.path.join(base_dir, "serviceAccountKey.json")
        cred = credentials.Certificate(key_path)
        app = firebase_admin.initialize_app(cred, name=app_name)

    return firestore.client(app=app)


# ---------------------------------------------------------------------------
# MCP Tool 1: get_doctor_record
# ---------------------------------------------------------------------------
@mcp.tool()
def get_doctor_record(uid: str) -> dict:
    """
    Retrieve a doctor's full Firestore record by their Firebase UID.

    The agent uses this to:
      - Check if the doctor already submitted their profile
      - Get stored reg_number and medical_council to compare against OCR results
      - Read any previous verification attempts

    Args:
        uid: The Firebase UID of the doctor (returned after login).

    Returns:
        dict with:
            - found          : bool — whether the document exists
            - data           : The full doctor document dict (or null)
            - error          : Error message on failure
    """
    try:
        db = _get_db()
        doc_ref = db.collection("doctors").document(uid)
        doc = doc_ref.get()

        if doc.exists:
            data = doc.to_dict()
            # Remove any sensitive fields we don't want the AI to see
            data.pop("stripe_customer_id", None)
            return {"found": True, "data": data, "error": None}
        else:
            return {"found": False, "data": None, "error": None}

    except Exception as e:
        return {"found": False, "data": None, "error": str(e)}


# ---------------------------------------------------------------------------
# MCP Tool 2: update_verification_status
# ---------------------------------------------------------------------------
@mcp.tool()
def update_verification_status(
    uid: str,
    status: str,
    reason: str,
    details: dict = None,
) -> dict:
    """
    Write the AI agent's verification verdict back to the doctor's Firestore document.

    This is the FINAL step in the verification pipeline. After the AI has:
      1. Extracted text from both documents (OCR)
      2. Validated Aadhaar/PAN format
      3. Checked with Surepass NMC + PAN APIs
      4. Made a decision

    It calls THIS tool to record the outcome.

    Fields written to doctors/{uid}:
      - is_verified           : True if status == "verified"
      - verification_status   : "verified" | "rejected" | "needs_review"
      - verification_reason   : Short human-readable explanation
      - verification_details  : Full dict of all individual check results
      - verified_at           : ISO 8601 timestamp (UTC)

    Args:
        uid    : Firebase UID of the doctor.
        status : One of "verified", "rejected", "needs_review".
        reason : Short explanation of the decision (1–3 sentences).
        details: Optional dict with full per-check breakdown.

    Returns:
        dict with:
            - success : bool
            - error   : Error message on failure
    """
    if status not in ("verified", "rejected", "needs_review"):
        return {
            "success": False,
            "error": f"Invalid status '{status}'. Must be 'verified', 'rejected', or 'needs_review'.",
        }

    try:
        db = _get_db()
        update_data = {
            "is_verified": status == "verified",
            "verification_status": status,
            "verification_reason": reason,
            "verification_details": details or {},
            "verified_at": datetime.now(timezone.utc).isoformat(),
        }

        db.collection("doctors").document(uid).update(update_data)

        return {"success": True, "error": None}

    except Exception as e:
        return {"success": False, "error": str(e)}
