from pydantic import BaseModel
from typing import Dict

class GenerateRequest(BaseModel):
    prompt: str

class GenerateResponse(BaseModel):
    plan: str
    architecture: str
    files: Dict[str, str]
    debug: str

class HealthResponse(BaseModel):
    status: str
    message: str
