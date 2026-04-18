"""
mix_server/server.py

MCP Server — Entry Point for Tool Registration
-----------------------------------------------
This file does three things:
  1. Creates the FastMCP server instance (the 'mcp' object).
  2. Imports all tool modules so their @mcp.tool() decorators run
     and register those functions with the server.
  3. Exposes 'mcp' for main.py to call mcp.run().

HOW MCP TOOL REGISTRATION WORKS:
  When Python imports a module that contains @mcp.tool() decorators,
  those decorators run immediately and register the function with the
  mcp server instance. That's why we just need to import the modules here.

  Think of it like Flask blueprints:
    Flask:  app.register_blueprint(auth_bp)
    MCP:    import tools.ocr_tool   ← the decorator does the registration

WHY A SEPARATE server.py?
  Each tool file needs to `from server import mcp` to get the same server
  instance. If we created 'mcp' inside a tool file, the other tool files
  couldn't import it without circular imports. Keeping it here breaks that
  dependency cycle cleanly.
"""

from mcp.server.fastmcp import FastMCP
from dotenv import load_dotenv

# Load .env variables before anything else
load_dotenv()

# Create the MCP server — this is the central object all tools register with.
# The string "mix_server" is the server name shown to clients.
mcp = FastMCP("mix_server")

# ---------------------------------------------------------------------------
# Import all tool modules.
# The @mcp.tool() decorators in each module auto-register with 'mcp' above.
# ---------------------------------------------------------------------------
import tools.ocr_tool          # extract_license_fields, extract_id_card_fields
import tools.id_verify_tool    # validate_aadhaar_number, validate_pan_number, compare_names
import tools.license_tool      # verify_license_with_surepass, verify_pan_with_surepass
import tools.firebase_tool     # get_doctor_record, update_verification_status