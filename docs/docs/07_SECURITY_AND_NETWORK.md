# SECURITY AND NETWORK ARCHITECTURE

An AI-powered local coding platform requires a robust security model to ensure the confidentiality of the developer's proprietary codebase while safely communicating with external LLM inference providers. Multi Agentic AI Automation implements a multi-layered security architecture designed specifically for local execution environments.

## 7.1 LOCAL FILE SYSTEM ISOLATION

Multi Agentic AI Automation uses **Electron Context Bridges** and **Sandboxed IPC** for all file read/write operations.

### 7.1.1 IPC Handshake and Execution
1.  **Renderer Sandboxing**: The React frontend runs in a completely sandboxed renderer process with Node.js integration disabled.
2.  **Context Bridge Exposure**: The `preload.js` script exposes only specifically whitelisted filesystem functions (e.g., `readFile`, `writeFile`, `readDir`).
3.  **Path Traversal Protection**: The Node.js main process validates all requested file paths, ensuring they fall within the user's explicitly selected active workspace directory, preventing arbitrary reads from system directories.
4.  **Zero-Execution Policy**: The desktop app writes code files but never automatically executes them via a shell environment, requiring the developer to manually test their code.

### 7.1.2 The Electron Security Advantage
We chose Electron's strict IPC model because it provides **Process-Level Authorization**.

*   **XSS Mitigation**: If a malicious actor tries to inject a script into the React UI (e.g., via a hallucinated, unescaped AI code block), the script cannot execute Node.js commands because the renderer lacks the `require` context.
*   **Performance**: IPC calls are evaluated natively over internal memory channels, allowing us to read thousands of files for context injection in under a second without network latency.

## 7.2 NETWORK RESILIENCE STRATEGIES

The OpenRouter API (and underlying LLMs like Qwen) are rate-limited by design. Multi Agentic AI Automation adds a custom context management layer.

### 7.2.1 Negative Acknowledgments (Context Truncation)
Instead of sending the full workspace history for every request (which easily exceeds 32k token limits), the system only sends the relevant active file and the project directory structure as context.

*   *Example*: The user has a 50-file React project. The system sends only the `src/` directory tree and the specific `App.jsx` file being edited for context.
*   *Result*: This minimizes token usage while ensuring that the architectural context is always preserved.

### 7.2.2 Adaptive Token Limit Control (ATC)
The FastAPI backend continuously monitors the **token count per API request** via heuristic byte-counting.
*   If payload > 120,000 bytes, the system activates a truncation protocol that sends only function signatures of secondary files rather than their full implementations.
*   If the generation plan > 10 files, the system splits generation across multiple sequential Agent invocations to prevent the LLM from truncating the JSON response mid-stream.

## 7.3 LOCALHOST AUTHORIZATION (CORS)

The FastAPI server implements a robust **Local-Only Access Control** model.

### 7.3.1 Loopback Binding
The Python server process binds strictly to `127.0.0.1` (localhost) on port `8000`. It does not listen on `0.0.0.0`, meaning devices on the same local network (Wi-Fi) cannot access the API or send commands to generate files.

### 7.3.2 CORS Policies
The backend uses FastAPI's `CORSMiddleware` configured to strictly allow origins matching `http://localhost:3000` (development) and `file://*` (production Electron). Any requests originating from external domains are immediately rejected by the browser and the server.

## 7.4 EXTERNAL API TRAVERSAL

Multi Agentic AI Automation's AI reasoning must safely cross the local network boundary to reach OpenRouter.

### 7.4.1 Outbound-Only Connections
*   **HTTPS Protocol**: All requests to the OpenRouter API are made over encrypted HTTPS (TLS 1.2+). The application never opens inbound listening ports other than the local API, ensuring firewalls do not block the app.
*   **API Key Isolation**: The `OPENROUTER_API_KEY` is loaded directly into the FastAPI backend via a `.env` file and is never transmitted to the React frontend, preventing accidental exposure via UI inspection tools.

{section break}
