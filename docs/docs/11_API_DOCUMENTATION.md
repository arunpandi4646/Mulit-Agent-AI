# API DOCUMENTATION

This document details the RESTful APIs used for AI agent generation and file management in Multi Agentic AI Automation.

## 11.1 BACKEND ORCHESTRATION APIS

### POST `/agentic/generate`
Processes a user prompt through the Planner, Architect, and Generator agent sequence.
- **Request**: `{ "prompt": "Create a React Todo app with Tailwind CSS" }`
- **Response**: `{ "plan": "...", "architecture": { "directories": ["src", "src/components"], "files": [...] }, "files": [ { "filename": "App.jsx", "content": "..." } ] }`

### GET `/health`
Checks the local FastAPI server status and OpenRouter API key validity.
- **Request**: `{}` (No payload)
- **Response**: `{ "status": "ok", "llm_status": "ready" }`

### POST `/agentic/debug`
Validates a specific code snippet or file through the Debug agent.
- **Request**: `{ "code": "def add(a, b): return a - b", "context": "This should be an addition function" }`
- **Response**: `{ "issues": ["Incorrect operator used in return statement"], "fixed_code": "def add(a, b): return a + b" }`


## 11.2 ELECTRON IPC MESSAGES (NATIVE INTEGRATION)

File system synchronization occurs over Electron's secure IPC channels, triggered from the React frontend.

### `read-file`
Reads the contents of a local file in the active workspace.

### `write-file`
Writes generated code to the local disk safely, creating parent directories if they don't exist.

### `read-dir`
Scans a directory to generate the File Explorer tree view.


## 11.3 AI MODEL SCHEMAS (PYDANTIC)

### Architecture Plan Schema
```python
class ArchitecturePlan(BaseModel):
    project_name: str
    directories: List[str]
    files: List[dict] # { filename: str, description: str, language: str }
    dependencies: List[str]
```

### Generated Code Schema
```python
class GeneratedFile(BaseModel):
    filename: str
    content: str
    language: str

class GenerationResult(BaseModel):
    plan: str
    architecture: ArchitecturePlan
    files: List[GeneratedFile]
```

{section break}
