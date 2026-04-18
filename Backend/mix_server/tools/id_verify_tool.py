"""
mix_server/tools/id_verify_tool.py

MCP Tool: validate_id_document
---------------------------------
Takes the raw extracted fields from ocr_tool.py and performs local validation
rules (format checks, cross-matching) WITHOUT calling any external API.

WHY A SEPARATE TOOL?
  Separation of concerns. The OCR tool extracts. This tool validates.
  Each MCP tool should do exactly ONE thing — this makes the AI agent's
  reasoning transparent: it can see "OCR said X, validator said Y".

WHAT IT CHECKS:
  Aadhaar:
    - 12 numeric digits
    - Verhoeff checksum algorithm (the official UIDAI check digit algorithm)
    - Basic name consistency

  PAN:
    - Exactly 10 characters: AAAAA9999A (5 letters, 4 digits, 1 letter)
    - The 4th character encodes the PAN holder type (P = individual)

  Name matching:
    - Fuzzy match between the name on the ID card and the name on the license
    - Uses Python's difflib (no extra library needed)
"""

import re
import difflib
from server import mcp


# ---------------------------------------------------------------------------
# Verhoeff algorithm tables (UIDAI checksum for Aadhaar)
# ---------------------------------------------------------------------------
# These are constant lookup tables defined by the algorithm — no need to
# memorize them, just know they implement Verhoeff's dihedral group D5.

_VERHOEFF_D = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
]

_VERHOEFF_P = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
]

_VERHOEFF_INV = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9]


def _verhoeff_check(number: str) -> bool:
    """
    Returns True if the given number string passes the Verhoeff checksum.
    Aadhaar numbers must pass this check to be considered valid.

    HOW IT WORKS:
      The check digit (last digit) is computed from all other digits using
      a mathematical group operation. If the final 'c' is 0, the number is valid.
    """
    c = 0
    for i, digit in enumerate(reversed(number)):
        c = _VERHOEFF_D[c][_VERHOEFF_P[i % 8][int(digit)]]
    return c == 0


# ---------------------------------------------------------------------------
# MCP Tool: validate_aadhaar_number
# ---------------------------------------------------------------------------
@mcp.tool()
def validate_aadhaar_number(aadhaar_number: str) -> dict:
    """
    Validate an Aadhaar number's format and checksum.

    This does NOT call any external government API (UIDAI access is restricted).
    It performs LOCAL validation:
      1. Must be exactly 12 numeric digits
      2. Must not start with 0 or 1 (UIDAI rule)
      3. Must pass the Verhoeff checksum algorithm

    Args:
        aadhaar_number: The Aadhaar number string (spaces will be stripped).

    Returns:
        dict with:
            - is_valid_format  : bool — passes all format checks
            - is_valid_checksum: bool — passes Verhoeff algorithm
            - cleaned_number   : The number with spaces/dashes removed
            - reason           : Explanation string
    """
    # Clean: remove spaces, dashes
    cleaned = re.sub(r"[\s\-]", "", aadhaar_number or "")

    if not cleaned.isdigit():
        return {
            "is_valid_format": False,
            "is_valid_checksum": False,
            "cleaned_number": cleaned,
            "reason": "Aadhaar number must contain only digits (got non-numeric characters)",
        }

    if len(cleaned) != 12:
        return {
            "is_valid_format": False,
            "is_valid_checksum": False,
            "cleaned_number": cleaned,
            "reason": f"Aadhaar number must be exactly 12 digits (got {len(cleaned)})",
        }

    if cleaned[0] in ("0", "1"):
        return {
            "is_valid_format": False,
            "is_valid_checksum": False,
            "cleaned_number": cleaned,
            "reason": "Aadhaar numbers cannot start with 0 or 1 (UIDAI rule)",
        }

    checksum_ok = _verhoeff_check(cleaned)
    return {
        "is_valid_format": True,
        "is_valid_checksum": checksum_ok,
        "cleaned_number": cleaned,
        "reason": (
            "All checks passed — valid Aadhaar number format"
            if checksum_ok
            else "Format is valid but Verhoeff checksum FAILED — number may be incorrect or fabricated"
        ),
    }


# ---------------------------------------------------------------------------
# MCP Tool: validate_pan_number
# ---------------------------------------------------------------------------
@mcp.tool()
def validate_pan_number(pan_number: str) -> dict:
    """
    Validate the format of an Indian PAN card number.

    A valid PAN has the pattern: AAAAA9999A
      - First 5 characters: letters (A-Z)
      - Next 4 characters : digits (0-9)
      - Last character    : letter (A-Z)

    Special rule:
      - The 4th letter encodes the PAN holder type.
        'P' = individual person (which is what we expect for a doctor).

    This does NOT call any external API. Use the `verify_pan_with_surepass`
    tool (in license_tool.py) for actual name lookup.

    Args:
        pan_number: The PAN string (spaces will be stripped, lowercased converted).

    Returns:
        dict with:
            - is_valid_format    : bool
            - cleaned_number     : Uppercased PAN
            - holder_type        : What the 4th letter means (e.g. "Individual")
            - reason             : Explanation string
    """
    cleaned = (pan_number or "").strip().upper()
    pan_regex = re.compile(r"^[A-Z]{5}[0-9]{4}[A-Z]$")

    if not pan_regex.match(cleaned):
        return {
            "is_valid_format": False,
            "cleaned_number": cleaned,
            "holder_type": None,
            "reason": (
                f"'{cleaned}' does not match the PAN format AAAAA9999A "
                "(5 letters + 4 digits + 1 letter)"
            ),
        }

    # The 4th character of PAN encodes the entity type
    holder_type_map = {
        "P": "Individual Person",
        "C": "Company",
        "H": "Hindu Undivided Family",
        "F": "Firm / LLP",
        "A": "Association of Persons",
        "T": "Trust",
        "B": "Body of Individuals",
        "L": "Local Authority",
        "J": "Artificial Juridical Person",
        "G": "Government",
    }
    fourth_char = cleaned[3]
    holder_type = holder_type_map.get(fourth_char, f"Unknown type '{fourth_char}'")

    return {
        "is_valid_format": True,
        "cleaned_number": cleaned,
        "holder_type": holder_type,
        "reason": f"Valid PAN format. Holder type: {holder_type}",
    }


# ---------------------------------------------------------------------------
# MCP Tool: compare_names
# ---------------------------------------------------------------------------
@mcp.tool()
def compare_names(name_a: str, name_b: str, threshold: float = 0.80) -> dict:
    """
    Fuzzy-compare two name strings and decide if they refer to the same person.

    WHY FUZZY MATCHING?
      Government document names often differ slightly from what doctors type:
        "DR. RAMESH KUMAR" vs "Ramesh Kumar"
        "PRIYA NAIR" vs "Priya S. Nair"
      An exact string comparison would falsely reject these. We use Python's
      built-in difflib.SequenceMatcher for similarity scoring.

    Args:
        name_a   : First name string (e.g. from the license)
        name_b   : Second name string (e.g. from the ID card)
        threshold: Minimum similarity ratio to count as a match (default 0.80)

    Returns:
        dict with:
            - similarity_score: float 0.0–1.0
            - is_match        : bool (score >= threshold)
            - cleaned_a       : Normalised version of name_a
            - cleaned_b       : Normalised version of name_b
            - reason          : Human-readable explanation
    """
    def _clean(name: str) -> str:
        """Lowercase, strip titles and extra whitespace."""
        name = (name or "").upper()
        # Remove common prefixes
        for prefix in ["DR.", "DR ", "MR.", "MR ", "MRS.", "MRS ", "MS.", "MS ", "PROF.", "PROF "]:
            if name.startswith(prefix):
                name = name[len(prefix):]
        return " ".join(name.split())  # normalise whitespace

    a = _clean(name_a)
    b = _clean(name_b)

    score = difflib.SequenceMatcher(None, a, b).ratio()
    is_match = score >= threshold

    return {
        "similarity_score": round(score, 4),
        "is_match": is_match,
        "cleaned_a": a,
        "cleaned_b": b,
        "reason": (
            f"Names match (similarity {score:.0%} ≥ threshold {threshold:.0%})"
            if is_match
            else f"Names do NOT match (similarity {score:.0%} < threshold {threshold:.0%})"
        ),
    }
