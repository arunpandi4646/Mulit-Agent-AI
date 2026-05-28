import React, { useState, useEffect } from 'react';
import FileExplorer from './components/FileExplorer';
import CodeEditor from './components/CodeEditor';
import AgenticPanel from './components/AgenticPanel';
import BottomTerminal from './components/BottomTerminal';
import './styles/theme.css';
import './App.css';

function App() {
  const [currentFile, setCurrentFile] = useState(null);
  const [problems, setProblems] = useState([]);
  const [navigateTo, setNavigateTo] = useState(null);
  
  // Terminal State
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [terminalHeight, setTerminalHeight] = useState(250);
  const [isResizing, setIsResizing] = useState(false);

  const handleFileSelect = (file) => {
    setCurrentFile({
      ...file,
      isDirty: false,
      tempPath: null
    });
    setProblems([]);
  };

  const handleContentChange = (newContent) => {
    setCurrentFile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        content: newContent,
        isDirty: true
      };
    });
  };

  const handleProblemsChange = (newProblems) => {
    setProblems(newProblems || []);
  };

  const addLog = (message, type = 'info') => {
    setTerminalLogs(prev => [...prev, {
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleCodeGenerated = async (files) => {
    // When AI generates code, display the first file in the editor
    const firstFilename = Object.keys(files)[0];
    if (firstFilename) {
      setCurrentFile({
        name: firstFilename,
        content: files[firstFilename],
        path: null, // Generated files don't have a path yet
        isDirty: true,
        tempPath: null
      });
    }

    // Log success
    addLog(`Successfully generated ${Object.keys(files).length} files.`, 'success');

    // Optionally: Save generated files to disk
    if (window.electronAPI) {
      // You could prompt user to select a folder and save all generated files
      console.log('Generated files:', Object.keys(files));
    }
  };

  const handleProblemClick = async (problem) => {
    if (!problem) return;

    if (problem.filePath && window.electronAPI) {
      const result = await window.electronAPI.readFile(problem.filePath);
      if (result.success) {
        setCurrentFile({
          path: problem.filePath,
          name: problem.fileName || problem.filePath.split(/[\\/]/).pop(),
          content: result.content,
          isDirty: false,
          tempPath: null
        });
      }
    }

    setNavigateTo({
      line: problem.line || 1,
      column: problem.column || 1
    });
  };

  // Resizing Logic
  const startResizing = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const resize = (e) => {
    if (isResizing) {
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight > 100 && newHeight < window.innerHeight - 100) {
        setTerminalHeight(newHeight);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle Terminal: Ctrl + `
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!window.electronAPI?.setUnsavedState) return;
    if (!currentFile) {
      window.electronAPI.setUnsavedState({ hasUnsaved: false });
      return;
    }

    const hasUnsaved = !!(currentFile.isDirty || (!currentFile.path && currentFile.tempPath));
    window.electronAPI.setUnsavedState({
      hasUnsaved,
      fileName: currentFile.name || 'untitled',
      filePath: currentFile.path || '',
      content: currentFile.content || '',
      isTemp: !currentFile.path && !!currentFile.tempPath
    });
  }, [
    currentFile?.content,
    currentFile?.path,
    currentFile?.name,
    currentFile?.isDirty,
    currentFile?.tempPath
  ]);

  return (
    <div className="app">
      <div className="main-content" style={{ paddingBottom: isTerminalOpen ? `${terminalHeight}px` : '0' }}>
        <FileExplorer 
          onFileSelect={handleFileSelect}
          currentFile={currentFile}
          onLog={addLog}
        />
        <CodeEditor 
          file={currentFile}
          onContentChange={handleContentChange}
          onProblemsChange={handleProblemsChange}
          navigateTo={navigateTo}
          onNavigateHandled={() => setNavigateTo(null)}
          onLog={addLog}
          onFileSaved={(savedFile) => {
            if (savedFile) {
              setCurrentFile({
                ...savedFile,
                isDirty: false,
                tempPath: null
              });
            }
          }}
          onTempFileSaved={(tempPath) => {
            if (!tempPath) return;
            setCurrentFile((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                tempPath
              };
            });
          }}
          onCloseFile={() => {
            setCurrentFile(null);
            setProblems([]);
          }}
        />
        <AgenticPanel 
          onCodeGenerated={handleCodeGenerated}
          onLog={addLog}
        />
      </div>

      <BottomTerminal 
        logs={terminalLogs}
        problems={problems}
        onProblemClick={handleProblemClick}
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        height={terminalHeight}
        onResizeStart={startResizing}
        onClearLogs={() => setTerminalLogs([])}
      />
    </div>
  );
}

export default App;
