"""
mix_server/utils/ai_agent.py

The AI Orchestrator — The "Brain" of the Verification System
--------------------------------------------------------------
This is NOT an MCP tool. This is the function that CALLS MCP tools in sequence
and uses Gemini to make the final verification decision.

IMPORTANT DISTINCTION:
  MCP Tools  = individual skills the AI can use (OCR, validate, API call, write DB)
  AI Agent   = the coordinator that decides WHICH tools to call, in WHAT order,
               and HOW to interpret the combined results

VERIFICATION PIPELINE:
  Step 1  → Call extract_license_fields     (ocr_tool.py)
  Step 2  → Call extract_id_card_fields     (ocr_tool.py)
  Step 3  → Call validate_aadhaar_number OR validate_pan_number  (id_verify_tool.py)
  Step 4  → Call compare_names (license name vs ID card name)    (id_verify_tool.py)
  Step 5  → Call verify_license_with_surepass                    (license_tool.py)
  Step 6  → Call verify_pan_with_surepass (if PAN was provided)  (license_tool.py)
  Step 7  → Gemini reasons over ALL results → final verdict
  Step 8  → Call update_verification_status                      (firebase_tool.py)

HOW THE AGENT IS CALLED:
  The Flask route `POST /verify-doctor-license` (in app/api/profile_routes.py or
  a new verify_routes.py) will import and call `run_verification_agent(uid, ...)`.
  The agent runs synchronously (blocking) since Flask is synchronous.

  For a production system you'd run this as a background task (Celery / Cloud Tasks),
  but for a capstone project, synchronous is fine.
"""

import os
import json
import base64
import re
from datetime import datetime, timezone

from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# Import the tool functions directly — we call them as normal Python functions here.
# This is the KEY insight: tools are just Python functions.
# The @mcp.tool() decorator makes them available to external AI clients too,
# but internally we can call them just like any function.
from tools.ocr_tool import extract_license_fields, extract_id_card_fields
from tools.id_verify_tool import (
    validate_aadhaar_number,
    validate_pan_number,
    compare_names,
)
from tools.license_tool import verify_license_with_surepass, verify_pan_with_surepass
from tools.firebase_tool import get_doctor_record, update_verification_status


# ---------------------------------------------------------------------------
# Gemini client (reused from ocr_tool pattern)
# ---------------------------------------------------------------------------
def _get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set in .env")
    return genai.Client(api_key=api_key)


# ---------------------------------------------------------------------------
# Helper: encode file bytes to base64 string
# ---------------------------------------------------------------------------
def _to_base64(file_bytes: bytes) -> str:
    return base64.b64encode(file_bytes).decode("utf-8")


# ---------------------------------------------------------------------------
# Main Agent Function
# ---------------------------------------------------------------------------
def run_verification_agent(
    uid: str,
    license_image_bytes: bytes,
    id_card_image_bytes: bytes,
) -> dict:
    """
    Run the full doctor verification pipeline for a given doctor UID.

    This function is called by the Flask route that handles document uploads.
    It coordinates all MCP tools and produces a final verdict written to Firestore.

    Args:
        uid                : Firebase UID of the doctor being verified.
        license_image_bytes: Raw bytes of the uploaded medical license image.
        id_card_image_bytes: Raw bytes of the uploaded Aadhaar or PAN card image.

    Returns:
        dict with:
            - status  : "verified" | "rejected" | "needs_review"
            - reason  : Human-readable explanation
            - details : Full per-step results
    """

    print(f"\n{'='*60}")
    print(f"[Agent] Starting verification for UID: {uid}")
    print(f"{'='*60}\n")

    details = {}

    # ── Step 1: OCR the medical license ──────────────────────────────────────
    print("[Step 1] Extracting fields from license image...")
    license_b64 = _to_base64(license_image_bytes)
    license_fields = extract_license_fields(license_b64)
    details["license_ocr"] = license_fields
    print(f"  ↳ Name: {license_fields.get('full_name')}")
    print(f"  ↳ Reg#: {license_fields.get('registration_number')}")
    print(f"  ↳ Council: {license_fields.get('medical_council')}")

    # ── Step 2: OCR the ID card ───────────────────────────────────────────────
    print("\n[Step 2] Extracting fields from ID card image...")
    id_b64 = _to_base64(id_card_image_bytes)
    id_fields = extract_id_card_fields(id_b64)
    details["id_card_ocr"] = id_fields
    print(f"  ↳ ID type: {id_fields.get('id_type')}")
    print(f"  ↳ ID number: {id_fields.get('id_number')}")
    print(f"  ↳ Name on ID: {id_fields.get('full_name')}")

    # Early exit: if documents don't look real, reject immediately
    if not license_fields.get("is_valid_document"):
        reason = "The uploaded license does not appear to be a valid medical document."
        _write_result(uid, "rejected", reason, details)
        return {"status": "rejected", "reason": reason, "details": details}

    if not id_fields.get("is_valid_document"):
        reason = "The uploaded ID card does not appear to be a valid government ID."
        _write_result(uid, "rejected", reason, details)
        return {"status": "rejected", "reason": reason, "details": details}

    # ── Step 3: Validate ID number format ────────────────────────────────────
    id_type = id_fields.get("id_type", "unknown")
    id_number = id_fields.get("id_number", "")
    print(f"\n[Step 3] Validating {id_type} number format...")

    if id_type == "aadhaar":
        id_validation = validate_aadhaar_number(id_number)
    elif id_type == "pan":
        id_validation = validate_pan_number(id_number)
    else:
        id_validation = {"is_valid_format": False, "reason": "Could not detect Aadhaar or PAN"}

    details["id_format_validation"] = id_validation
    print(f"  ↳ Format valid: {id_validation.get('is_valid_format')}")
    print(f"  ↳ Reason: {id_validation.get('reason')}")

    # ── Step 4: Cross-match names ─────────────────────────────────────────────
    license_name = license_fields.get("full_name", "")
    id_card_name = id_fields.get("full_name", "")
    print(f"\n[Step 4] Comparing names...")
    print(f"  ↳ License name: '{license_name}'")
    print(f"  ↳ ID card name: '{id_card_name}'")

    name_comparison = compare_names(license_name, id_card_name)
    details["name_comparison"] = name_comparison
    print(f"  ↳ Match score: {name_comparison.get('similarity_score')}")
    print(f"  ↳ Match result: {name_comparison.get('reason')}")

    # ── Step 5: Verify NMC registration via Surepass ─────────────────────────
    reg_number = license_fields.get("registration_number", "")
    council = license_fields.get("medical_council", "")
    year = license_fields.get("year_of_registration", "")
    print(f"\n[Step 5] Checking NMC registry via Surepass...")

    nmc_result = verify_license_with_surepass(
        member_id=str(reg_number),
        state_council=str(council),
        year_of_admission=str(year),
    )
    details["nmc_verification"] = nmc_result
    print(f"  ↳ Registered: {nmc_result.get('is_registered')}")
    if nmc_result.get("registered_name"):
        print(f"  ↳ NMC registered name: {nmc_result['registered_name']}")
    if nmc_result.get("error"):
        print(f"  ↳ Error: {nmc_result['error']}")

    # ── Step 6: Verify PAN (if ID is PAN card) ───────────────────────────────
    pan_result = None
    if id_type == "pan" and id_number:
        print(f"\n[Step 6] Verifying PAN number via Surepass...")
        pan_result = verify_pan_with_surepass(
            pan_number=id_number,
            name_to_match=license_name,
        )
        details["pan_verification"] = pan_result
        print(f"  ↳ PAN valid: {pan_result.get('is_valid_pan')}")
        print(f"  ↳ Registered name: {pan_result.get('registered_name')}")
        print(f"  ↳ Name match score: {pan_result.get('name_match_score')}")
    else:
        print(f"\n[Step 6] Skipping PAN check (ID type is '{id_type}')")

    # ── Step 7: Gemini makes the final decision ───────────────────────────────
    print(f"\n[Step 7] Asking Gemini to reason over all results...")

    verdict = _gemini_final_verdict(details)
    details["ai_verdict"] = verdict
    print(f"  ↳ Final status: {verdict['status']}")
    print(f"  ↳ Reason: {verdict['reason']}")

    # ── Step 8: Write to Firestore ────────────────────────────────────────────
    print(f"\n[Step 8] Writing verdict to Firestore...")
    _write_result(uid, verdict["status"], verdict["reason"], details)
    print(f"  ↳ Written. UID={uid} → {verdict['status']}")
    print(f"\n{'='*60}\n")

    return verdict


# ---------------------------------------------------------------------------
# Gemini Final Reasoning (Step 7)
# ---------------------------------------------------------------------------
def _gemini_final_verdict(details: dict) -> dict:
    """
    Send all verification check results to Gemini and ask it to make
    the final VERIFIED / REJECTED / NEEDS_REVIEW decision.

    WHY GEMINI FOR THE FINAL STEP?
      Each individual tool returns a binary result (pass/fail). But real
      verification has nuance — e.g. a name that is 78% similar (below 80%
      threshold) might still be the same person if all other signals are strong.
      Gemini can reason about the COMBINATION of evidence holistically,
      just like a human reviewer would.
    """
    client = _get_gemini_client()

    prompt = f"""
You are a senior verification officer for WaitFree Clinic, an Indian healthcare platform.

A doctor has submitted their medical license and government ID for verification.
Below is the complete output of all automated checks. Review each check carefully
and make a final decision.

=== VERIFICATION CHECK RESULTS ===
{json.dumps(details, indent=2, default=str)}
===================================

Based on the above results, make a decision:

Decision criteria:
- VERIFIED: License appears genuine, name matches on all documents, NMC
  registration is confirmed, ID format is valid. Minor name discrepancies (>75%)
  are acceptable if all other checks pass.
- REJECTED: Clear signs of fraud, completely different names, NMC registration
  not found AND PAN verification also failed, document does not appear genuine.
- NEEDS_REVIEW: Ambiguous — some checks failed but not conclusive (e.g. NMC
  check failed due to API error, or name similarity is borderline 70-80%).

Return ONLY a JSON object, no explanation outside JSON:
{{
  "status": "<verified|rejected|needs_review>",
  "reason": "<2-3 sentences explaining the decision in plain English>",
  "confidence": <float 0.0 to 1.0>,
  "checks_passed": ["list", "of", "checks", "that", "passed"],
  "checks_failed": ["list", "of", "checks", "that", "failed"]
}}
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[types.Part.from_text(text=prompt)],
        )
        raw = response.text.strip()
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        return json.loads(raw)
    except Exception as e:
        # If Gemini fails, fall back to a conservative needs_review
        return {
            "status": "needs_review",
            "reason": f"Automated AI review failed ({e}). Manual review required.",
            "confidence": 0.0,
            "checks_passed": [],
            "checks_failed": ["ai_reasoning"],
        }


# ---------------------------------------------------------------------------
# Helper: Write result to Firestore
# ---------------------------------------------------------------------------
def _write_result(uid: str, status: str, reason: str, details: dict):
    """Wrapper to call the firebase_tool and log any errors."""
    result = update_verification_status(
        uid=uid,
        status=status,
        reason=reason,
        details=details,
    )
    if not result.get("success"):
        print(f"[Agent WARNING] Failed to write to Firestore: {result.get('error')}")
