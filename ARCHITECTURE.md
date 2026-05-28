# System Architecture Document
## Neuro Code Editor

### 1. Executive Summary

The Neuro Code Editor is a desktop application that combines traditional code editing capabilities with an advanced multi-agent AI system for natural language programming ("vibe coding"). The system transforms user intent expressed in natural language into production-ready code through a coordinated pipeline of specialized AI agents.

### 2. System Overview

#### 2.1 Core Components

1. **Desktop Shell (Electron)**
   - Native window management
   - File system access
   - IPC communication bridge
   - Cross-platform compatibility

2. **Frontend (React + Monaco)**
   - User interface components
   - Code editor integration
   - AI interaction panel
   - File explorer

3. **Backend (FastAPI + Multi-Agent System)**
   - RESTful API endpoints
   - Agent orchestration
   - Code generation pipeline
   - Quality assurance

#### 2.2 Technology Decisions

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Desktop Framework | Electron | Cross-platform, web tech integration |
| Code Editor | Monaco | Industry-standard, VS Code engine |
| Frontend Framework | React | Component-based, efficient rendering |
| Backend Framework | FastAPI | Modern, fast, async support |
| Agent System | Python | Flexibility, rapid development |

### 3. Multi-Agent Architecture

#### 3.1 Agent Roles and Responsibilities

**Orchestrator Agent**
- Role: System coordinator
- Input: User prompt
- Output: Complete generation result
- Responsibilities:
  - Manage agent execution order
  - Pass data between agents
  - Handle errors and retries
  - Aggregate final results

**Planner Agent**
- Role: Intent analyzer and strategist
- Input: Raw user prompt
- Output: Structured execution plan
- Responsibilities:
  - Parse natural language intent
  - Identify project requirements
  - Create step-by-step plan
  - Determine complexity level

**Architect Agent**
- Role: System designer
- Input: User prompt + Plan
- Output: Architecture specification
- Responsibilities:
  - Select appropriate technologies
  - Design folder structure
  - Define module boundaries
  - Establish design patterns

**Code Generator Agent**
- Role: Implementation specialist
- Input: Prompt + Plan + Architecture
- Output: Code files (Dict[filename, content])
- Responsibilities:
  - Generate production-ready code
  - Follow best practices
  - Implement specified features
  - Create multiple files as needed

**Debug Agent**
- Role: Quality assurance
- Input: Generated code files
- Output: Review report
- Responsibilities:
  - Identify code issues
  - Suggest improvements
  - Validate best practices
  - Provide quality metrics

#### 3.2 Agent Communication Flow

```
┌─────────────────────────────────────────────────────────┐
│                  User Input (Prompt)                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Orchestrator Agent (Coordinator)            │
└─────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────┴─────────────────┐
        ↓                                     ↓
┌──────────────────┐              ┌──────────────────┐
│  Planner Agent   │              │  Context: Prompt │
│  - Analyze       │              └──────────────────┘
│  - Plan          │
└──────────────────┘
        ↓
┌──────────────────────────────────────────────────────┐
│  Context: Prompt + Plan                               │
└──────────────────────────────────────────────────────┘
        ↓
┌──────────────────┐
│ Architect Agent  │
│  - Design        │
│  - Structure     │
└──────────────────┘
        ↓
┌──────────────────────────────────────────────────────┐
│  Context: Prompt + Plan + Architecture                │
└──────────────────────────────────────────────────────┘
        ↓
┌──────────────────┐
│ Code Generator   │
│  - Implement     │
│  - Generate      │
└──────────────────┘
        ↓
┌──────────────────────────────────────────────────────┐
│  Context: Generated Files                             │
└──────────────────────────────────────────────────────┘
        ↓
┌──────────────────┐
│  Debug Agent     │
│  - Review        │
│  - Validate      │
└──────────────────┘
        ↓
┌─────────────────────────────────────────────────────────┐
│  Final Output: Plan + Architecture + Files + Review     │
└─────────────────────────────────────────────────────────┘
```

### 4. Data Flow Architecture

#### 4.1 Frontend → Backend Communication

```
React Component (AgenticPanel)
    ↓
API Service Layer (api.js)
    ↓
HTTP POST /agentic/generate
    ↓
FastAPI Endpoint
    ↓
Orchestrator.execute()
    ↓
Agent Pipeline
    ↓
JSON Response
    ↓
React State Update
    ↓
UI Rendering (AgentStepsView)
```

#### 4.2 File System Operations

```
User Action (Open File)
    ↓
React Component (FileExplorer)
    ↓
window.electronAPI.readFile()
    ↓
IPC Renderer → Main Process
    ↓
Node.js fs.readFile()
    ↓
File Content
    ↓
IPC Main → Renderer
    ↓
Monaco Editor Display
```

### 5. Security Architecture

#### 5.1 Context Isolation
- Electron preload script with contextBridge
- No direct Node.js access from renderer
- Whitelisted IPC channels only

#### 5.2 API Security
- CORS configuration for allowed origins
- Input validation with Pydantic
- Error handling without exposing internals

#### 5.3 File System Access
- User-initiated folder selection only
- No automatic file system traversal
- Sandboxed file operations

### 6. Performance Optimization

#### 6.1 Frontend
- React.memo for component optimization
- Lazy loading for large files
- Virtual scrolling for file trees
- Debounced editor changes

#### 6.2 Backend
- Async/await for non-blocking operations
- Lightweight rule-based agents (no ML models)
- Fast response times (<2s typical)
- Minimal memory footprint

#### 6.3 Electron
- Preload script for faster IPC
- Efficient window management
- Resource cleanup on close

### 7. Scalability Considerations

#### 7.1 Current Implementation
- Single-user desktop application
- Local file system only
- In-memory agent state
- No persistence layer

#### 7.2 Future Enhancements
- Cloud-based agent execution
- LLM integration (GPT-4, Claude)
- Multi-project workspace
- Collaborative editing
- Plugin system for custom agents

### 8. Error Handling Strategy

#### 8.1 Frontend
- Try-catch blocks for API calls
- User-friendly error messages
- Graceful degradation
- Retry mechanisms

#### 8.2 Backend
- HTTPException for API errors
- Detailed logging
- Validation errors with context
- Fallback responses

#### 8.3 Electron
- IPC error propagation
- File system error handling
- Window crash recovery

### 9. Testing Strategy

#### 9.1 Unit Testing
- Agent logic testing
- Component rendering tests
- API endpoint tests

#### 9.2 Integration Testing
- Full pipeline execution
- Frontend-backend communication
- File system operations

#### 9.3 E2E Testing
- User workflow simulation
- Code generation scenarios
- Error recovery paths

### 10. Deployment Architecture

#### 10.1 Development
```
Developer Machine
├── Backend (localhost:8000)
├── React Dev Server (localhost:3000)
└── Electron (loads localhost:3000)
```

#### 10.2 Production
```
User Machine
├── Electron App
│   ├── Bundled React (build/)
│   └── Embedded Backend (optional)
└── External Backend (optional cloud service)
```

### 11. Code Quality Standards

#### 11.1 Frontend
- ESLint configuration
- Prettier formatting
- Component documentation
- PropTypes validation

#### 11.2 Backend
- PEP 8 compliance
- Type hints
- Docstrings
- Pydantic validation

#### 11.3 General
- DRY principle
- SOLID principles
- Clean code practices
- Meaningful naming

### 12. Monitoring and Logging

#### 12.1 Frontend
- Console logging (development)
- Error boundary components
- Performance metrics

#### 12.2 Backend
- Uvicorn access logs
- Agent execution logs
- Error tracking
- Performance profiling

### 13. Future Architecture Enhancements

#### 13.1 LLM Integration
- OpenAI GPT-4 API
- Anthropic Claude API
- Local LLM support (Ollama)
- Model selection UI

#### 13.2 Advanced Features
- Git integration
- Terminal emulator
- Debugger integration
- Extension marketplace

#### 13.3 Cloud Services
- Remote agent execution
- Code storage and sync
- Collaborative features
- Analytics dashboard

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-01  
**Author:** Antigravity AI
