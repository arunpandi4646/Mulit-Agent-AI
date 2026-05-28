# 🚀 Neuro Code Editor

An AI-powered desktop code editor with integrated multi-agent system for "vibe coding" - transforming natural language into production-ready code.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Building Executable](#building-executable)
- [Demo Examples](#demo-examples)
- [System Requirements](#system-requirements)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Contributing](#contributing)

## 🎯 Overview

This is a complete desktop-based AI-powered code editor similar to VS Code, featuring:

- **Monaco Editor** - The same editor engine that powers VS Code
- **Multi-Agent AI System** - 5 specialized agents working together
- **Vibe Coding** - Natural language → Production code
- **Cross-Platform** - Built with Electron for Windows, macOS, and Linux

### Novelty & Innovation

1. **Agentic Architecture**: Multi-agent pipeline with specialized roles (Planner, Architect, Coder, Debugger)
2. **Vibe Coding Interface**: Natural language programming with explainable AI reasoning
3. **IDE Integration**: Full-featured code editor with AI assistance built-in
4. **Transparent AI**: Step-by-step visualization of agent decision-making

## ✨ Features

### Code Editor
- ✅ Monaco Editor with syntax highlighting for 30+ languages
- ✅ File explorer with folder navigation
- ✅ Multi-file editing with tabs
- ✅ Auto-save functionality
- ✅ Line numbers, minimap, and code folding
- ✅ Dark theme (VS Code style)

### Agentic AI Panel
- ✅ Natural language prompt input
- ✅ Real-time backend status monitoring
- ✅ Step-by-step agent execution visualization
- ✅ Generated code preview
- ✅ One-click code insertion into editor

### Multi-Agent System
1. **Orchestrator Agent** - Coordinates execution flow
2. **Planner Agent** - Analyzes intent and creates execution plan
3. **Architect Agent** - Designs system architecture and folder structure
4. **Code Generator Agent** - Produces production-ready code
5. **Debug Agent** - Reviews code quality and suggests improvements

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Electron Shell                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │              React Frontend (UI)                   │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │  │
│  │  │   File   │  │  Monaco  │  │   Agentic    │   │  │
│  │  │ Explorer │  │  Editor  │  │   AI Panel   │   │  │
│  │  └──────────┘  └──────────┘  └──────────────┘   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕ IPC Bridge
┌─────────────────────────────────────────────────────────┐
│              FastAPI Backend (Python)                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │            Orchestrator Agent                      │  │
│  │  ┌─────────┐  ┌──────────┐  ┌────────┐  ┌──────┐ │  │
│  │  │ Planner │→ │Architect │→ │ Coder  │→ │Debug │ │  │
│  │  └─────────┘  └──────────┘  └────────┘  └──────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Agent Pipeline Flow

```
User Prompt
    ↓
Planner Agent (Analyzes intent, creates plan)
    ↓
Architect Agent (Designs structure, selects tech)
    ↓
Code Generator Agent (Writes production code)
    ↓
Debug Agent (Reviews quality, suggests fixes)
    ↓
Generated Code → Monaco Editor
```

## 📦 Installation

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **Git**

### Step 1: Clone Repository

```bash
cd "C:\Users\Arun\Desktop\Desktop Application\desktop-app"
```

### Step 2: Install Root Dependencies

```bash
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### Step 4: Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
cd ..
```

## 🚀 Usage

### Running Locally (Development Mode)

You need **two terminals**:

#### Terminal 1: Start Backend

```bash
cd backend
python main.py
```

The API will start at `http://localhost:8000`

#### Terminal 2: Start Electron App

```bash
npm start
```

This will:
1. Start the React dev server at `http://localhost:3000`
2. Launch the Electron window

### Using the Application

1. **Open a Folder**: Click the folder icon in the File Explorer
2. **Edit Code**: Select files to edit in Monaco Editor
3. **Use AI**: Enter a prompt in the Agentic AI panel
4. **Generate Code**: Click "Run Agentic AI" to generate code
5. **View Results**: See step-by-step agent reasoning and generated files

## 📦 Building Executable

### Build Windows .exe

```bash
# Build frontend for production
cd frontend
npm run build
cd ..

# Build Electron executable
npm run build:exe
```

The `.exe` file will be in `dist/` folder.

### Build Configuration

Edit `package.json` → `build` section to customize:
- App name
- Icon
- Installer options
- Target platforms

## 🎬 Demo Examples

### Example 1: React Todo App

**Prompt:**
```
Create a React todo app with add, delete, and mark complete features
```

**Expected Output:**
- `TodoApp.jsx` - Full React component with state management
- `TodoApp.css` - Modern styling with animations
- Step-by-step plan and architecture explanation

### Example 2: FastAPI REST API

**Prompt:**
```
Build a FastAPI REST API for managing items with CRUD operations
```

**Expected Output:**
- `main.py` - Complete FastAPI application
- Endpoints: GET, POST, DELETE
- Pydantic models for validation

### Example 3: Vanilla JS Todo

**Prompt:**
```
Create a simple todo list app with localStorage
```

**Expected Output:**
- `index.html` - Semantic HTML structure
- `script.js` - Vanilla JavaScript with localStorage
- `style.css` - Modern gradient design

## 💻 System Requirements

### Minimum Requirements
- **OS**: Windows 10/11, macOS 10.13+, Linux (Ubuntu 18.04+)
- **CPU**: Intel i3 or equivalent
- **RAM**: 4GB (8GB recommended)
- **Storage**: 500MB free space

### Recommended for Best Performance
- **CPU**: Intel i5 or better
- **RAM**: 8GB+
- **Storage**: SSD with 1GB+ free space

### Low-Resource Optimization
- Uses rule-based agents (no heavy ML models)
- Minimal memory footprint
- Fast startup time (<5 seconds)

## 📁 Project Structure

```
desktop-app/
│
├── electron/
│   ├── main.js              # Electron main process
│   └── preload.js           # IPC bridge
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileExplorer.jsx
│   │   │   ├── FileExplorer.css
│   │   │   ├── CodeEditor.jsx
│   │   │   ├── CodeEditor.css
│   │   │   ├── AgenticPanel.jsx
│   │   │   ├── AgenticPanel.css
│   │   │   ├── AgentStepsView.jsx
│   │   │   └── AgentStepsView.css
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── styles/
│   │   │   └── theme.css
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.js
│   │
│   └── package.json
│
├── backend/
│   ├── agents/
│   │   ├── orchestrator.py
│   │   ├── planner_agent.py
│   │   ├── architect_agent.py
│   │   ├── code_agent.py
│   │   └── debug_agent.py
│   │
│   ├── schemas/
│   │   └── request_response.py
│   │
│   ├── main.py
│   └── requirements.txt
│
├── package.json
└── README.md
```

## 🛠️ Technology Stack

### Desktop Shell
- **Electron** 28.1.0 - Cross-platform desktop framework
- **electron-builder** - Executable packaging

### Frontend
- **React** 18.2.0 - UI framework
- **Monaco Editor** 4.6.0 - Code editor (VS Code engine)
- **Axios** - HTTP client
- **React Icons** - Icon library

### Backend
- **FastAPI** 0.109.0 - Modern Python web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation

### Styling
- **CSS Variables** - Theming system
- **Flexbox** - Layout
- **VS Code Color Palette** - Consistent dark theme

## 🧪 Testing the System

### Test Backend Health

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "online",
  "message": "All systems operational"
}
```

### Test Code Generation

```bash
curl -X POST http://localhost:8000/agentic/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a React counter component"}'
```

## 🔧 Troubleshooting

### Backend Won't Start
- Ensure Python 3.9+ is installed
- Check if port 8000 is available
- Verify all dependencies are installed

### Frontend Won't Load
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall
- Check if port 3000 is available

### Electron Window Blank
- Check browser console (F12)
- Ensure backend is running
- Verify CORS is enabled

## 🎓 Academic Significance

This project demonstrates:

1. **Multi-Agent Systems**: Practical implementation of coordinated AI agents
2. **Human-AI Interaction**: Natural language programming interface
3. **Explainable AI**: Transparent, step-by-step reasoning
4. **Software Engineering**: Production-quality code generation
5. **Desktop AI Applications**: Integration of AI into traditional software

### Potential Research Applications
- Code generation benchmarking
- Agent coordination strategies
- Natural language to code translation
- IDE-integrated AI assistance

## 📄 License

MIT License - See LICENSE file for details

## 👥 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 🙏 Acknowledgments

- **Monaco Editor** - Microsoft
- **Electron** - OpenJS Foundation
- **FastAPI** - Sebastián Ramírez
- **React** - Meta

---

**Built with ❤️ by Antigravity AI**

*Transforming natural language into production code, one vibe at a time.*
#   M u l i t - A g e n t - A I  
 