# APPENDIX

## A. Installation Guide
*   **Desktop App**: Run `npm install` in the `desktop-app/` root, then `npm run start` to boot the React frontend and Electron shell.
*   **AI Server**: Navigate to `desktop-app/backend/`. Run `pip install -r requirements.txt` and start the server using `python main.py`. 
*   **Environment**: Create `.env` in the backend folder containing `OPENROUTER_API_KEY` and optional `LLM_MODEL` strings.

## B. Glossary of Terms
*   **IPC**: Inter-Process Communication (secure message passing between Electron Node.js main process and React renderer).
*   **LLM**: Large Language Model (e.g., Qwen3 Coder) accessed via the OpenRouter API.
*   **Multi-Agent Flow**: A sequence of distinct AI tasks (Planner -> Architect -> Generator -> Debugger) orchestrating complex code creation.
*   **Pydantic Schema**: A Python typing standard used to enforce strict JSON structure on the output of the AI agents.
*   **AST**: Abstract Syntax Tree, optionally used by the Debug Agent to validate syntax correctness.

## C. System Requirements
*   **Client**: Dual-core CPU, 4GB RAM, Windows 10+/macOS/Linux.
*   **Development**: Quad-core CPU, 8GB RAM, Node.js 18+, Python 3.10+.
*   **Network**: Active internet connection required for API calls (unless utilizing a local, offline LLM model via `OFFLINE_MODE`).

{section break}
