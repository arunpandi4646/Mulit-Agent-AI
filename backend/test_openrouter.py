#!/usr/bin/env python3
"""Smoke-test OpenRouter with LLM_MODEL from backend/.env"""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

from agents.llm_client import LLMClient

if __name__ == "__main__":
    print("Using model:", os.getenv("LLM_MODEL"))
    client = LLMClient()
    reply = client.query(
        "You are a helpful assistant.",
        "Reply with exactly: OpenRouter OK",
        max_tokens=64,
    )
    print("Response:", reply[:200])
