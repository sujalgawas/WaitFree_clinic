"""
mix_server/main.py

Run the MCP Server
-------------------
This is the entry point. Run it with:
    python main.py

Or, for interactive development with the MCP Inspector (browser UI):
    fastmcp dev main.py

WHAT HAPPENS WHEN YOU RUN THIS:
  1. server.py is imported → mcp server object is created + all tools registered
  2. mcp.run() starts a stdio-based MCP server
  3. An AI client (Claude, Gemini, any MCP-compatible client) can now connect
     and call our tools by name

TRANSPORT MODES:
  - "stdio"  (default): Communicates over stdin/stdout. Used by CLI clients.
  - "sse"   : Server-Sent Events over HTTP. Used by browser/web clients.

  For a capstone where Flask calls the agent internally, you don't need to
  run this as a separate process — you can import and call the tools directly.
  But running it as an MCP server lets you test with the MCP Inspector.
"""

from server import mcp

if __name__ == "__main__":
    # Note: The original file had a typo here — 'mpc.run()' instead of 'mcp.run()'
    # That's been fixed. Always double-check variable names!
    mcp.run()