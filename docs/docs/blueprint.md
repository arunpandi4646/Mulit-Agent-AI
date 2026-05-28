# **App Name**: Multi Agentic AI Automation

## Core Features:

- Agentic Input: A specialized text input field for developers to describe software engineering requirements.
- Multi-Agent Orchestration: Integration with OpenRouter API to route prompts through Planner, Architect, Code Generator, and Debugger agents.
- Interactive File Tree: A visual directory tree representing the generated project architecture, securely linked to the local filesystem via IPC.
- Monaco Editor: Full VS Code engine integration for syntax highlighting, code folding, and side-by-side code diffing.
- Local File Sync: Agent-generated code is verified and safely written directly to the user's active disk workspace.
- Step-by-Step Visualization: Real-time UI updates showing which agent is currently active and the structured logic they are producing.

## Style Guidelines:

- Primary theme: VS Code Dark Theme (`#1e1e1e`) to create a familiar and professional developer atmosphere.
- Secondary color: Slate gray (`#2d2d2d`) for sidebars and inactive tabs to provide subtle spatial depth.
- Accent color: Vibrant blue (`#007acc`) matching classic IDE highlights for interaction cues and focus states.
- System font: 'Inter', a clean sans-serif for UI elements, ensuring high readability for complex technical terms.
- Code font: 'Fira Code' or 'Consolas' for the Monaco Editor and terminal output segments.
- Iconography: Minimalist developer icons (folders, files, play buttons) aligned with standard IDE aesthetics.
- Animations: Subtle transitions for agent loading states (spinners) and smooth panel resizing.
