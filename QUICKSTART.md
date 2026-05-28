# Quick Start Guide
## Neuro Code Editor

### ⚡ 5-Minute Setup

#### Step 1: Install Dependencies (One-time)

```powershell
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..
```

#### Step 2: Run the Application

**Option A: Automatic (Recommended)**
```powershell
.\start.ps1
```

**Option B: Manual (Two Terminals)**

Terminal 1 - Backend:
```powershell
cd backend
python main.py
```

Terminal 2 - Frontend:
```powershell
npm start
```

### 🎯 First Steps

1. **Open the application** - Wait for Electron window to appear
2. **Check backend status** - Look for green "online" indicator in AI panel
3. **Open a folder** - Click folder icon in File Explorer
4. **Try AI generation** - Enter a prompt and click "Run Agentic AI"

### 📝 Example Prompts

**Beginner:**
```
Create a simple counter component in React
```

**Intermediate:**
```
Build a React todo app with add, delete, and complete features
```

**Advanced:**
```
Create a FastAPI REST API with CRUD operations for a blog system
```

### 🔧 Common Issues

**Backend shows "offline"**
- Ensure Python server is running on port 8000
- Check terminal for error messages
- Restart backend: `cd backend && python main.py`

**Electron window is blank**
- Wait 10 seconds for React to compile
- Check if port 3000 is available
- Open DevTools (F12) to see errors

**Monaco editor not loading**
- Clear npm cache: `npm cache clean --force`
- Reinstall frontend: `cd frontend && npm install`

### 🚀 Building Executable

```powershell
# Build frontend
cd frontend
npm run build
cd ..

# Build Windows .exe
npm run build:exe
```

Find the `.exe` in `dist/` folder.

### 📚 Learn More

- Full documentation: `README.md`
- Architecture details: `ARCHITECTURE.md`
- API reference: `http://localhost:8000/docs` (when backend is running)

### 💡 Tips

- Use **Ctrl+S** to save files in editor
- Use **Ctrl+Enter** in AI prompt to run
- Click agent sections to expand/collapse
- Generated code appears automatically in editor

---

**Need Help?** Check the README.md or open an issue on GitHub.
