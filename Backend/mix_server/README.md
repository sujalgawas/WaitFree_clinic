"""
mix_server/README.md — Doctor License Verification MCP Server
================================================================

Welcome! This README is written for you as a student learning MCP for the first time.
Read it top to bottom — it will explain every concept you need to understand the code.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1: WHAT IS MCP?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MCP stands for **Model Context Protocol**. It's an open standard created by Anthropic
(the company behind Claude) that solves a specific problem:

  "How do we give an AI model access to real-world tools and data in a standardized way?"

Before MCP, every developer had to invent their own system for giving AI "tools":
  - OpenAI has "function calling"
  - LangChain has "agents with tools"
  - Everyone reinvented the wheel

MCP is a universal standard. Just like HTTP is how browsers talk to web servers,
MCP is how AI models talk to tool servers.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2: THE ANALOGY — RESTAURANT KITCHEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Think of MCP like a restaurant:

  | Concept         | Restaurant Analogy           |
  |-----------------|------------------------------|
  | AI Model        | Customer ordering food        |
  | MCP Server      | The kitchen                  |
  | MCP Tool        | A specific dish the kitchen can make |
  | Tool call       | The customer placing an order |
  | Tool response   | The kitchen sending food back |
  | AI Agent        | The head chef coordinating everything |

The AI (customer) doesn't know HOW to verify a license.
It knows it can ask the kitchen (MCP server) to call specific tools.
The tools do the actual work.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3: HOW fastmcp WORKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`fastmcp` is a Python library that makes writing MCP servers simple — similar to
how Flask makes writing HTTP servers simple.

Here's the simplest possible MCP tool:

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("my_server")      # Create the server

@mcp.tool()                      # Register this function as an MCP tool
def add_numbers(a: int, b: int) -> int:
    """Add two numbers together."""
    return a + b
```

That's it! When an AI client connects and calls "add_numbers", your Python
function runs and returns the result.

The difference from a normal function:
  - Normal function: only YOUR code can call it
  - MCP tool:        ANY AI client (Claude, Gemini, etc.) can call it

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 4: OUR PROJECT STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
mix_server/
│
├── server.py          ← Creates the MCP server + imports all tools
├── main.py            ← Runs the server (entry point)
│
├── tools/             ← Each file = one category of MCP tools
│   ├── ocr_tool.py        OCR tools: read license + ID card images
│   ├── id_verify_tool.py  Validation tools: Aadhaar/PAN format + name match
│   ├── license_tool.py    API tools: Surepass NMC + PAN verification
│   └── firebase_tool.py   Database tools: read/write Firestore
│
└── utils/             ← NOT MCP tools — internal helpers
    └── ai_agent.py        The orchestrator that calls all tools in sequence
```

RULE OF THUMB:
  - `tools/` = things the AI can call externally
  - `utils/` = internal business logic

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 5: THE FULL VERIFICATION FLOW (STEP BY STEP)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When a doctor uploads their documents, here's exactly what happens:

```
Doctor uploads:
  ├── Medical License (image/PDF)
  └── Aadhaar OR PAN card (image)
          │
          ▼
  Flask route: POST /verify-doctor-license
          │
          ▼
  ai_agent.run_verification_agent(uid, license_bytes, id_bytes)
          │
          ├─ Step 1: extract_license_fields(license_image)
          │   Uses Gemini Vision to read the license
          │   Returns: name, reg_number, council, year, specialization
          │
          ├─ Step 2: extract_id_card_fields(id_card_image)
          │   Uses Gemini Vision to read the ID card
          │   Returns: id_type (aadhaar/pan), id_number, name
          │
          ├─ Step 3: validate_aadhaar_number OR validate_pan_number
          │   Pure Python validation — no API call
          │   Checks format + Verhoeff checksum (Aadhaar)
          │
          ├─ Step 4: compare_names(license_name, id_card_name)
          │   Fuzzy string matching using difflib
          │   Returns similarity score 0.0–1.0
          │
          ├─ Step 5: verify_license_with_surepass(reg_number, council, year)
          │   Real API call to Surepass → NMC database
          │   Returns: is_registered, registered_name, status
          │
          ├─ Step 6 (if PAN): verify_pan_with_surepass(pan_number, name)
          │   Real API call to Surepass → Income Tax DB
          │   Returns: is_valid_pan, registered_name, name_match_score
          │
          ├─ Step 7: Gemini AI reasoning over ALL results
          │   Holistic decision: VERIFIED | REJECTED | NEEDS_REVIEW
          │   Returns: status, reason, confidence
          │
          └─ Step 8: update_verification_status(uid, status, reason, details)
              Writes verdict to Firestore: doctors/{uid}
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 6: THE EXTERNAL APIs WE USE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. GEMINI API (Google AI Studio)
   - URL: https://aistudio.google.com/
   - Used for: OCR (reading documents) + Final AI reasoning
   - Cost: FREE (15 requests/min free tier)
   - Key: Set GEMINI_API_KEY in .env

2. SUREPASS API
   - URL: https://surepass.io
   - Used for: NMC (doctor registry) + PAN (identity) verification
   - Cost: FREE sandbox
   - Key: Set SUREPASS_API_TOKEN in .env
   - Real NMC endpoint: POST /api/v1/professional-membership/nmc
   - Real PAN endpoint: POST /api/v1/pan/pan

3. FIREBASE / FIRESTORE (you already have this set up)
   - Used for: Reading doctor's stored profile + writing verification verdict
   - Key: serviceAccountKey.json in Backend/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 7: HOW TO RUN AND TEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OPTION A: Test the tools directly in Python (recommended first)
```bash
cd Backend/
python -c "
from mix_server.tools.id_verify_tool import validate_aadhaar_number
print(validate_aadhaar_number('234123412346'))
"
```

OPTION B: Run the MCP server and inspect it visually
```bash
cd Backend/mix_server/
fastmcp dev main.py
# Opens a browser at http://localhost:5173 showing all your tools
```

OPTION C: Trigger via Flask (the main integration path)
```bash
# Start Flask as normal
cd Backend/
python run.py

# Then POST to the new verification route
curl -X POST http://localhost:5000/verify-doctor-license \
  -F "token=YOUR_FIREBASE_TOKEN" \
  -F "license_image=@/path/to/license.jpg" \
  -F "id_card_image=@/path/to/aadhaar.jpg"
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 8: COMMON QUESTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q: Does the MCP server need to be running separately from Flask?
A: NO. In our setup, Flask calls the agent directly as a Python function.
   The MCP server in main.py is only needed if you want an AI client to
   connect externally (e.g. Claude Desktop using this as a plugin).

Q: Why Gemini for OCR instead of pytesseract?
A: pytesseract converts pixels to raw text. You still need to write regex
   to extract "Reg. No: MH12345". Gemini reads the document like a human —
   it understands "this is the registration number" without you writing any regex.

Q: Why is Aadhaar OTP verification not available?
A: UIDAI (the government body) restricts their real-time Aadhaar OTP API to
   approved institutions (banks, telecom companies). Students cannot access it.
   Our approach (format + checksum + name cross-check) is how legitimate
   startups handle it while waiting for UIDAI approval.

Q: What does "needs_review" mean?
A: It means the AI couldn't make a confident decision. A human admin should
   manually check the documents. This is common when the NMC API returns an
   error (network issue) or when names are too different to auto-decide.

Q: Can I add more tools?
A: Yes! Just create a new file in tools/, add your @mcp.tool() function,
   and import the file in server.py. The tool is immediately available.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 9: WHAT GETS STORED IN FIRESTORE AFTER VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After a successful run, a doctor's record in `doctors/{uid}` gains:

```json
{
  "is_verified": true,
  "verification_status": "verified",
  "verification_reason": "Doctor's NMC registration confirmed. Names match across all documents. PAN identity verified.",
  "verification_details": {
    "license_ocr": { ... },
    "id_card_ocr": { ... },
    "id_format_validation": { ... },
    "name_comparison": { ... },
    "nmc_verification": { ... },
    "pan_verification": { ... },
    "ai_verdict": { ... }
  },
  "verified_at": "2026-04-18T00:15:00+00:00"
}
```

Your frontend can then check `doctor.is_verified` to decide whether to
show the doctor's profile to patients or display a "Pending Verification" badge.
"""
