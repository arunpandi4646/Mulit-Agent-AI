"""
FastAPI server for the Agentic Code Generator
Wraps the orchestrator to expose it as a REST API
"""

from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import traceback
import subprocess
import sys
from agents.orchestrator import OrchestratorAgent

app = FastAPI(
    title="Agentic Code Generator API",
    description="Multi-agent AI system for automated code generation",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _is_offline() -> bool:
    return os.environ.get("OFFLINE_MODE", "").strip().lower() in ("1", "true", "yes")


def _llm_provider() -> str:
    provider = (os.environ.get("LLM_PROVIDER") or "openrouter").strip().lower()
    if _is_offline():
        return "offline"
    return provider


class CodeGenerationRequest(BaseModel):
    prompt: str


class CodeGenerationResponse(BaseModel):
    status: str
    plan: str
    architecture: str
    files: dict
    debug: str


class CodeExecutionRequest(BaseModel):
    code: str


class CodeExecutionResponse(BaseModel):
    success: bool
    output: str = None
    error: str = None


class JavaExecutionRequest(BaseModel):
    code: str
    fileName: str


@app.get("/")
def home():
    return {"status": "online"}


@app.post("/generate", response_model=CodeGenerationResponse)
def generate_code(request: CodeGenerationRequest):
    if not request.prompt or not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    if not _is_offline() and not os.environ.get("OPENROUTER_API_KEY", "").strip():
        raise HTTPException(
            status_code=500,
            detail="OPENROUTER_API_KEY environment variable not set",
        )

    try:
        orchestrator = OrchestratorAgent()
        result = orchestrator.execute(request.prompt)

        return CodeGenerationResponse(
            status="success",
            plan=result["plan"],
            architecture=result["architecture"],
            files=result["files"],
            debug=result["debug"],
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Code generation failed: {str(e)}",
        )


@app.get("/health")
def health_check():
    offline = _is_offline()
    openrouter_key = bool(os.environ.get("OPENROUTER_API_KEY", "").strip())
    return {
        "status": "online",
        "offline_mode": offline,
        "llm_provider": _llm_provider(),
        "openrouter_connected": openrouter_key and not offline,
        "service": "Agentic Code Generator API",
    }


@app.post("/api/execute-python", response_model=CodeExecutionResponse)
def execute_python(request: CodeExecutionRequest):
    try:
        result = subprocess.run(
            [sys.executable, "-c", request.code],
            capture_output=True,
            text=True,
            timeout=30,
        )

        if result.returncode != 0:
            return CodeExecutionResponse(
                success=False,
                error=result.stderr or "Execution failed with no error message",
            )

        return CodeExecutionResponse(success=True, output=result.stdout)
    except subprocess.TimeoutExpired:
        return CodeExecutionResponse(
            success=False,
            error="Code execution timed out (30 second limit)",
        )
    except Exception as e:
        return CodeExecutionResponse(success=False, error=str(e))


@app.post("/api/execute-java", response_model=CodeExecutionResponse)
def execute_java(request: JavaExecutionRequest):
    try:
        import tempfile

        class_name = request.fileName.replace(".java", "")

        with tempfile.TemporaryDirectory() as temp_dir:
            java_file = os.path.join(temp_dir, f"{class_name}.java")
            with open(java_file, "w") as f:
                f.write(request.code)

            compile_result = subprocess.run(
                ["javac", java_file],
                capture_output=True,
                text=True,
                timeout=30,
            )

            if compile_result.returncode != 0:
                return CodeExecutionResponse(
                    success=False,
                    error=compile_result.stderr or "Compilation failed",
                )

            exec_result = subprocess.run(
                ["java", "-cp", temp_dir, class_name],
                capture_output=True,
                text=True,
                timeout=30,
            )

            if exec_result.returncode != 0:
                return CodeExecutionResponse(
                    success=False,
                    error=exec_result.stderr or "Execution failed",
                )

            return CodeExecutionResponse(success=True, output=exec_result.stdout)
    except subprocess.TimeoutExpired:
        return CodeExecutionResponse(
            success=False,
            error="Code execution timed out (30 second limit)",
        )
    except Exception as e:
        return CodeExecutionResponse(success=False, error=str(e))
