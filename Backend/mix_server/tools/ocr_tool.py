"""
mix_server/tools/ocr_tool.py

MCP Tool: extract_document_fields
----------------------------------
Uses Google Gemini's multimodal (Vision) capability to read a document image
(medical license, Aadhaar card, or PAN card) and extract structured fields.

WHY GEMINI AND NOT pytesseract?
  - pytesseract only returns raw text — YOU have to write regex to find fields.
  - Gemini understands document LAYOUT. It knows "this is an Aadhaar card"
    and returns a clean JSON with exactly the fields you asked for.
  - It handles skewed, low-resolution, and multilingual documents automatically.
  - You already have `google-genai` in requirements.txt, so zero extra setup.

HOW IT WORKS:
  1. Receive a base64-encoded image string from the caller.
  2. Decode it into bytes and send to Gemini with a structured prompt.
  3. Ask Gemini to return a JSON object with specific fields.
  4. Return that JSON dict to the MCP agent.
"""

import os
import base64
import json
import re
from google import genai
from google.genai import types
from server import mcp

# ---------------------------------------------------------------------------
# Helper: Build the Gemini client (lazy singleton pattern)
# ---------------------------------------------------------------------------
_client = None


def _get_client():
    """Return a reusable Gemini client, initialising it once."""
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY is not set in .env file. "
                "Get one free at https://aistudio.google.com/"
            )
        _client = genai.Client(api_key=api_key)
    return _client


# ---------------------------------------------------------------------------
# MCP Tool 1 — extract_license_fields
# ---------------------------------------------------------------------------
@mcp.tool()
def extract_license_fields(image_base64: str) -> dict:
    """
    Extract structured fields from a doctor's medical license image.

    The image should be base64-encoded (e.g. from reading a file and running
    base64.b64encode(file_bytes).decode()).

    Returns a dict with these keys (any unknown field is returned as null):
        - full_name        : Doctor's full name as printed on the license
        - registration_number : The medical registration / enrollment number
        - medical_council  : Name of the issuing medical council
                             (e.g. "Maharashtra Medical Council")
        - year_of_registration : The year the license was issued (int or null)
        - specialization   : Medical specialty if mentioned (e.g. "MBBS", "MD")
        - validity_date    : Expiry/validity date string if present
        - is_valid_document: True if the image looks like a genuine medical
                             license document, False otherwise
        - confidence       : 0.0–1.0 float indicating extraction confidence
        - notes            : Any extra remarks or warnings from the AI

    Args:
        image_base64: Base64-encoded string of the document image (JPG/PNG/PDF‑page).

    Returns:
        dict with the fields listed above.
    """
    client = _get_client()

    # Decode the base64 string back into raw bytes
    try:
        image_bytes = base64.b64decode(image_base64)
    except Exception as e:
        return {
            "error": f"Invalid base64 string: {str(e)}",
            "is_valid_document": False,
            "confidence": 0.0,
        }

    prompt = """
You are an expert document analyser for Indian medical licenses.

Look at this image carefully and extract EXACTLY the following fields.
Return ONLY a valid JSON object — no explanation, no markdown, no code block.

{
  "full_name": "<doctor's full name as on document, or null>",
  "registration_number": "<registration / enrollment number string, or null>",
  "medical_council": "<name of the issuing medical council, or null>",
  "year_of_registration": <year as integer, or null>,
  "specialization": "<degree or specialisation e.g. MBBS / MD, or null>",
  "validity_date": "<validity or expiry date string, or null>",
  "is_valid_document": <true if this looks like a real medical license, false otherwise>,
  "confidence": <float 0.0 to 1.0 reflecting your extraction confidence>,
  "notes": "<any warnings, anomalies, or extra info, or null>"
}
"""

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
            types.Part.from_text(text=prompt),
        ],
    )

    raw = response.text.strip()

    # Strip markdown code fences if Gemini wraps the JSON
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "error": "Gemini returned non-JSON output",
            "raw_output": raw,
            "is_valid_document": False,
            "confidence": 0.0,
        }


# ---------------------------------------------------------------------------
# MCP Tool 2 — extract_id_card_fields
# ---------------------------------------------------------------------------
@mcp.tool()
def extract_id_card_fields(image_base64: str) -> dict:
    """
    Extract structured identity fields from an Aadhaar card or PAN card image.

    Automatically detects whether the document is an Aadhaar card or PAN card
    and returns the appropriate fields.

    Returns a dict with these keys:
        - id_type          : "aadhaar" | "pan" | "unknown"
        - id_number        : The Aadhaar (12-digit) or PAN (ABCDE1234F) number
        - full_name        : Name as printed on the ID card
        - date_of_birth    : DOB string if present (Aadhaar usually has it)
        - gender           : "M" | "F" | "T" | null (Aadhaar)
        - address          : Address string if present (Aadhaar back side)
        - is_valid_document: True if image looks like a real government ID
        - confidence       : 0.0–1.0 float
        - notes            : Any extra remarks

    Args:
        image_base64: Base64-encoded image of the ID card.

    Returns:
        dict with fields listed above.
    """
    client = _get_client()

    try:
        image_bytes = base64.b64decode(image_base64)
    except Exception as e:
        return {
            "error": f"Invalid base64 string: {str(e)}",
            "is_valid_document": False,
            "confidence": 0.0,
        }

    prompt = """
You are an expert document analyser for Indian government ID cards (Aadhaar and PAN).

Look at this image carefully. Determine if it is an Aadhaar card or a PAN card,
then extract the listed fields. Return ONLY a valid JSON object — no explanation,
no markdown, no code block.

{
  "id_type": "<'aadhaar' or 'pan' or 'unknown'>",
  "id_number": "<the 12-digit Aadhaar number OR 10-character PAN number, or null>",
  "full_name": "<name printed on the card, or null>",
  "date_of_birth": "<DOB string as on card, or null>",
  "gender": "<'M', 'F', 'T', or null>",
  "address": "<address if visible on card, or null>",
  "is_valid_document": <true if real government ID, false otherwise>,
  "confidence": <float 0.0 to 1.0>,
  "notes": "<warnings or anomalies, or null>"
}
"""

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
            types.Part.from_text(text=prompt),
        ],
    )

    raw = response.text.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "error": "Gemini returned non-JSON output",
            "raw_output": raw,
            "is_valid_document": False,
            "confidence": 0.0,
        }
