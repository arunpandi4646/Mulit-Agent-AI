"""
NeuroCode backend entry point.
Starts the FastAPI server on http://localhost:8000
"""

import os
import sys
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent
os.chdir(BACKEND_DIR)
load_dotenv(BACKEND_DIR / ".env")

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


def _is_offline() -> bool:
    return os.environ.get("OFFLINE_MODE", "").strip().lower() in ("1", "true", "yes")


def _log(message: str) -> None:
    print(message, flush=True)


def print_startup_status() -> None:
    _log("[✓] Backend running")
    if _is_offline():
        _log("[✓] Offline mode enabled")
        _log("[✓] AI Ready")
        return

    if os.environ.get("OPENROUTER_API_KEY", "").strip():
        _log("[✓] OpenRouter connected")
        model = os.getenv("LLM_MODEL", "qwen/qwen3-coder:free")
        print("Using model:", model, flush=True)
        _log("[✓] AI model loaded")
        _log("[✓] AI Ready")
    else:
        _log("[!] OPENROUTER_API_KEY missing — set backend/.env for AI features")


def run_api_server() -> None:
    import uvicorn

    port = int(os.environ.get("PORT", "8000"))
    host = os.environ.get("HOST", "127.0.0.1")

    print_startup_status()
    _log(f"API listening at http://localhost:{port}")

    uvicorn.run(
        "api:app",
        host=host,
        port=port,
        reload=True,
        reload_dirs=[str(BACKEND_DIR)],
        log_level="info",
    )


def run_cli() -> None:
    from agents.orchestrator import OrchestratorAgent

    if not _is_offline() and not os.environ.get("OPENROUTER_API_KEY", "").strip():
        print("ERROR: OPENROUTER_API_KEY is not set in backend/.env")
        sys.exit(1)

    prompt = " ".join(sys.argv[2:]).strip() if len(sys.argv) > 2 else input(
        "Prompt: "
    ).strip()
    if not prompt:
        print("No prompt provided.")
        sys.exit(1)

    result = OrchestratorAgent().execute(prompt)
    print(result.get("plan", ""))


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "cli":
        run_cli()
    else:
        run_api_server()
