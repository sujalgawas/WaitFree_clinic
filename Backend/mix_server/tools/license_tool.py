"""
mix_server/tools/license_tool.py

MCP Tool: verify_license_with_surepass, verify_pan_with_surepass
-----------------------------------------------------------------
Calls the Surepass KYC API to perform REAL verification against:
  1. NMC (National Medical Commission) registry — doctor registration check
  2. Income Tax PAN database — identity name lookup

WHY SUREPASS?
  - The NMC does not have a public REST API.
  - Surepass legally aggregates NMC data and exposes it as an API.
  - They offer a FREE sandbox environment (sign up at surepass.io).
  - The same API is used by hospitals and healthcare startups in India.

HOW TO GET ACCESS:
  1. Go to https://surepass.io and create a free account.
  2. From the dashboard, copy your API Token.
  3. Paste it into your .env file as SUREPASS_API_TOKEN=your_token_here

SANDBOX VS PRODUCTION:
  Sandbox (SUREPASS_BASE_URL=https://kyc-api.surepass.io/api/v1):
    - Free, no payment
    - Returns realistic test data for known test registration numbers
    - Use this during development

  Production: Requires payment plan. Plug in production URL when going live.
"""

import os
import requests
from server import mcp


# ---------------------------------------------------------------------------
# Helper: Build Surepass request headers
# ---------------------------------------------------------------------------
def _surepass_headers() -> dict:
    """Build the Authorization header needed for every Surepass API call."""
    token = os.getenv("SUREPASS_API_TOKEN", "")
    if not token:
        raise ValueError(
            "SUREPASS_API_TOKEN is not set in .env. "
            "Sign up at https://surepass.io to get a free sandbox token."
        )
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }


def _surepass_base_url() -> str:
    return os.getenv("SUREPASS_BASE_URL", "https://kyc-api.surepass.io/api/v1")


# ---------------------------------------------------------------------------
# MCP Tool 1: verify_license_with_surepass
# ---------------------------------------------------------------------------
@mcp.tool()
def verify_license_with_surepass(
    member_id: str,
    state_council: str,
    year_of_admission: str,
) -> dict:
    """
    Verify a doctor's NMC registration by calling the Surepass NMC API.

    HOW IT WORKS:
      - Sends the doctor's registration details to Surepass.
      - Surepass checks against NMC (National Medical Commission) records.
      - Returns the registered doctor's name, council, status, and qualifications.

    This uses REAL NMC data (or sandbox test data in dev mode), NOT a mock.

    Args:
        member_id        : The doctor's NMC / SMC registration number
                           (same as `reg_number` stored in your Firestore).
        state_council    : The name of the issuing state medical council
                           e.g. "Maharashtra Medical Council".
        year_of_admission: Year the registration was granted e.g. "2015".

    Returns:
        dict with:
            - is_registered      : bool — found in NMC registry
            - registered_name    : Name as in NMC records (for name matching)
            - council            : Council name from NMC
            - qualifications     : List of qualifications if returned
            - registration_status: "active" | "suspended" | "cancelled" | "unknown"
            - raw_response       : Full Surepass response for debugging
            - error              : Error message if the call failed
    """
    try:
        payload = {
            "member_id": member_id,
            "state_council": state_council,
            "year_of_admission": str(year_of_admission),
            "consent": "Y",
            "purpose": "Doctor license verification for WaitFree Clinic platform",
        }

        response = requests.post(
            f"{_surepass_base_url()}/professional-membership/nmc",
            headers=_surepass_headers(),
            json=payload,
            timeout=15,
        )

        data = response.json()

        # Surepass wraps results in data.data for success responses
        if response.status_code == 200 and data.get("success"):
            result_data = data.get("data", {})
            return {
                "is_registered": True,
                "registered_name": result_data.get("name") or result_data.get("full_name"),
                "council": result_data.get("council") or result_data.get("state_council"),
                "qualifications": result_data.get("qualifications", []),
                "registration_status": result_data.get("status", "active"),
                "raw_response": result_data,
                "error": None,
            }
        else:
            # Doctor not found or API error
            return {
                "is_registered": False,
                "registered_name": None,
                "council": None,
                "qualifications": [],
                "registration_status": "unknown",
                "raw_response": data,
                "error": data.get("message") or f"HTTP {response.status_code}",
            }

    except requests.exceptions.Timeout:
        return {
            "is_registered": False,
            "registered_name": None,
            "council": None,
            "qualifications": [],
            "registration_status": "unknown",
            "raw_response": None,
            "error": "Surepass API timed out after 15 seconds",
        }
    except Exception as e:
        return {
            "is_registered": False,
            "registered_name": None,
            "council": None,
            "qualifications": [],
            "registration_status": "unknown",
            "raw_response": None,
            "error": str(e),
        }


# ---------------------------------------------------------------------------
# MCP Tool 2: verify_pan_with_surepass
# ---------------------------------------------------------------------------
@mcp.tool()
def verify_pan_with_surepass(pan_number: str, name_to_match: str = None) -> dict:
    """
    Verify a PAN card number against the Income Tax Department database via Surepass.

    HOW IT WORKS:
      - Sends the PAN number to Surepass.
      - Surepass queries the Income Tax DB to confirm the PAN exists and returns
        the legally registered name of the PAN holder.
      - Optionally checks if `name_to_match` is consistent with the registered name.

    This is how we verify the IDENTITY of the doctor separately from their license.
    A doctor who gives a PAN number must match the name on the license.

    Args:
        pan_number    : The 10-character PAN number (e.g. "ABCDE1234F").
        name_to_match : Optional — the name from the license/Aadhaar to cross-check.

    Returns:
        dict with:
            - is_valid_pan     : bool — PAN exists in IT records
            - registered_name  : Name registered with Income Tax for this PAN
            - pan_status       : "active" | "inactive" | "unknown"
            - name_match_score : 0.0–1.0 fuzzy match of name_to_match vs registered_name
                                 (only set if name_to_match was provided)
            - raw_response     : Full Surepass response
            - error            : Error message if the call failed
    """
    import difflib

    try:
        payload = {
            "id_number": pan_number.strip().upper(),
            "consent": "Y",
            "purpose": "Doctor identity verification for WaitFree Clinic platform",
        }

        response = requests.post(
            f"{_surepass_base_url()}/pan/pan",
            headers=_surepass_headers(),
            json=payload,
            timeout=15,
        )

        data = response.json()

        if response.status_code == 200 and data.get("success"):
            result_data = data.get("data", {})
            registered_name = (
                result_data.get("full_name")
                or result_data.get("name")
                or result_data.get("first_name", "") + " " + result_data.get("last_name", "")
            ).strip()

            # Fuzzy name matching if a reference name was provided
            name_match_score = None
            if name_to_match and registered_name:
                name_match_score = round(
                    difflib.SequenceMatcher(
                        None,
                        name_to_match.upper().strip(),
                        registered_name.upper().strip(),
                    ).ratio(),
                    4,
                )

            return {
                "is_valid_pan": True,
                "registered_name": registered_name,
                "pan_status": result_data.get("pan_status", "active"),
                "name_match_score": name_match_score,
                "raw_response": result_data,
                "error": None,
            }
        else:
            return {
                "is_valid_pan": False,
                "registered_name": None,
                "pan_status": "unknown",
                "name_match_score": None,
                "raw_response": data,
                "error": data.get("message") or f"HTTP {response.status_code}",
            }

    except requests.exceptions.Timeout:
        return {
            "is_valid_pan": False,
            "registered_name": None,
            "pan_status": "unknown",
            "name_match_score": None,
            "raw_response": None,
            "error": "Surepass API timed out after 15 seconds",
        }
    except Exception as e:
        return {
            "is_valid_pan": False,
            "registered_name": None,
            "pan_status": "unknown",
            "name_match_score": None,
            "raw_response": None,
            "error": str(e),
        }
