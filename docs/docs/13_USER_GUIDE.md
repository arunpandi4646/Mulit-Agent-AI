# USER GUIDE

Welcome to Multi Agentic AI Automation. This guide will help you navigate the features of your high-performance multi-agent AI coding environment.

## 13.1 GETTING STARTED

1.  **Launch the App**: Run the `.exe` file (Windows) or open the application via `start.ps1`. The Electron shell and local FastAPI server will boot up automatically.
2.  **Open Workspace**: Use the File Explorer panel on the left to open an existing project folder or create a new empty directory for your next project.
3.  **Enter a Prompt**: Type your software requirements into the Agentic Panel text area on the right.

## 13.2 AI AGENT CONTROLS

Once your workspace is ready, use the Agentic Panel to trigger the multi-agent pipeline:

*   **Scaffold an App**: Type `Create a complete React Todo application with Tailwind`. The Planner agent will analyze this, the Architect will design the `src/components` folder structure, and the Generator will create `App.jsx`, `index.js`, and `styles.css`.
*   **Generate a Component**: Highlight an existing directory in the File Explorer and type `Create a LoginForm component`. The AI will read the directory context and generate the component matching your existing project style.
*   **Step-by-Step Execution**: 
    *   Watch the Agentic Panel as it transitions through **Planning**, **Architecting**, and **Generating**.
    *   Review the generated File Tree blueprint before accepting the code.
*   **Review Code Diff**: 
    *   Click on any newly generated file in the Agentic Panel to open it in the Monaco Diff Editor.
    *   Compare the generated code against any existing code and press **Accept** to write it to disk.

## 13.3 ADVANCED IDE FEATURES

The Monaco Editor center pane acts as a fully featured IDE with several built-in tools.

### 13.3.1 Editor Customization
*   **Theme Integration**: The editor uses the industry-standard VS Code Dark Theme (`vs-dark`).
*   **Syntax Highlighting**: Over 30 languages are supported automatically based on file extensions.
*   **Minimap & Folding**: Toggle the minimap view and use code folding for large generated files to maintain readability.

### 13.3.2 Workspace File Explorer
*   **Local Editing**: Click any file in the left sidebar to open it. Edits made in the center pane are saved to your local OS drive.
*   **Context Injection**: The AI automatically knows what files you have selected in the File Explorer, allowing you to say "Refactor this file to use Async/Await" without copy-pasting code manually.

### 13.3.3 Debugging Workflows
*   **Code Review**: If your script isn't running, select the file in the File Explorer and type "Find the bug". The Orchestrator will route your request directly to the Debug Agent for validation and syntax correction.
*   **Dependency Installation**: The Architect agent lists all required packages (e.g., `npm install axios`). Check the Agentic Panel's "Architecture" tab for the list of dependencies to install in your external terminal.

## 13.4 TROUBLESHOOTING

*   **API Key Not Set**: If the agent fails to start, ensure you have placed your `OPENROUTER_API_KEY` in the `backend/.env` file.
*   **Backend Server Down**: If the UI shows "Backend offline", ensure port `8000` is not being used by another application on your local machine.
*   **Write Permission Denied**: If the agent cannot save files, ensure the application has write permissions to the folder you selected in the File Explorer (e.g., avoid system directories like `C:\Windows`).

{section break}
