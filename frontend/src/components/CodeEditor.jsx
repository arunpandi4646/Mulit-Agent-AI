import React, { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { FaSave, FaPlay, FaSpinner, FaTimes } from 'react-icons/fa';
import './CodeEditor.css';

const CodeEditor = ({ file, onContentChange, onProblemsChange, navigateTo, onNavigateHandled, onLog, onFileSaved, onTempFileSaved, onCloseFile }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const markersListenerRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // 'saved', 'saving', 'unsaved'
  const autoSaveTimerRef = useRef(null);
  const lastAutoSaveRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure Monaco theme
    monaco.editor.defineTheme('vs-dark-custom', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#cccccc',
        'editor.lineHighlightBackground': '#2a2d2e',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#c6c6c6',
      }
    });
    monaco.editor.setTheme('vs-dark-custom');

    // Listen for diagnostics and publish problems for the current model
    if (markersListenerRef.current) {
      markersListenerRef.current.dispose();
    }
    markersListenerRef.current = monaco.editor.onDidChangeMarkers(() => {
      publishProblems();
    });

    publishProblems();
  };

  const handleEditorChange = (value) => {
    if (onContentChange && file) {
      onContentChange(value);
    }
  };

  const saveFile = async () => {
    if (!file || !window.electronAPI || !editorRef.current) return;

    const content = editorRef.current.getValue();
    const fileName = file?.name || 'untitled';
    const filePath = file?.path || '';
    const extension = getFileExtension(fileName);
    const defaultName = buildDefaultFileName(fileName, extension, getLanguage(fileName));

    if (!filePath) {
      if (!window.electronAPI.saveFileAs) {
        console.error('Save As is unavailable in this environment.');
        return;
      }
      const result = await window.electronAPI.saveFileAs({
        defaultPath: defaultName,
        content
      });

      if (result?.success && result.filePath) {
        const savedName = result.filePath.split(/[\\/]/).pop();
        if (onFileSaved) {
          onFileSaved({
            path: result.filePath,
            name: savedName,
            content
          });
        }
        console.log('File saved successfully:', result.filePath);
        return { success: true, filePath: result.filePath };
      } else if (result?.canceled) {
        console.log('Save canceled');
        return { success: false, canceled: true };
      } else {
        console.error('Error saving file:', result?.error || 'Unknown error');
        return { success: false, error: result?.error || 'Unknown error' };
      }
      return { success: false };
    }

    const result = await window.electronAPI.writeFile(filePath, content);
    if (result.success) {
      console.log('File saved successfully');
      if (onFileSaved) {
        onFileSaved({
          path: filePath,
          name: fileName,
          content
        });
      }
      return { success: true, filePath };
    } else {
      console.error('Error saving file:', result.error);
      return { success: false, error: result.error };
    }
  };

  const autoSaveFile = async () => {
    if (!file || !editorRef.current) return false;

    const content = editorRef.current.getValue();
    const fileName = file?.name || 'untitled';
    const extension = getFileExtension(fileName);

    // If file has a real path, auto-save there
    if (file?.path && window.electronAPI?.writeFile) {
      try {
        setAutoSaveStatus('saving');
        const result = await window.electronAPI.writeFile(file.path, content);
        if (result.success) {
          setAutoSaveStatus('saved');
          lastAutoSaveRef.current = Date.now();
          return true;
        }
      } catch (error) {
        console.warn('[Auto-save] Failed to save to file path:', error);
      }
    }

    // Otherwise, auto-save to temporary storage
    if (window.electronAPI?.saveTempFile) {
      try {
        setAutoSaveStatus('saving');
        const tempResult = await window.electronAPI.saveTempFile({
          fileName,
          extension,
          content
        });
        if (tempResult?.success) {
          setAutoSaveStatus('saved');
          lastAutoSaveRef.current = Date.now();
          if (onTempFileSaved) onTempFileSaved(tempResult.filePath);
          return true;
        }
      } catch (error) {
        console.warn('[Auto-save] Failed to save temp file:', error);
      }
    }

    setAutoSaveStatus('unsaved');
    return false;
  };

  const runCode = async () => {
    if (!file) {
      if (onLog) onLog('No file selected. Open a file before running.', 'warning');
      const payload = buildProblemsPayload([{
        severity: 'info',
        message: 'No file selected. Open a file before running.',
        line: 1,
        column: 1,
        fileName: 'N/A',
        filePath: ''
      }]);
      console.debug('[Problems] payload:', payload);
      if (onProblemsChange) onProblemsChange(payload.items);
      return payload;
    }

    if (!window.electronAPI) {
      if (onLog) onLog('Run requires the Electron desktop app.', 'warning');
      const payload = buildProblemsPayload([{
        severity: 'warning',
        message: 'Run requires the Electron desktop app.',
        line: 1,
        column: 1,
        fileName: file?.name || 'Unknown',
        filePath: file?.path || ''
      }]);
      console.debug('[Problems] payload:', payload);
      if (onProblemsChange) onProblemsChange(payload.items);
      return payload;
    }

    const fileName = file?.name || 'Untitled';
    let filePath = file?.path || '';
    const extension = getFileExtension(fileName);
    const runTarget = getRunTarget(extension);

    console.debug('[Run] fileName:', fileName, 'filePath:', filePath, 'extension:', extension, 'target:', runTarget);

    if (!filePath) {
      if (file?.tempPath) {
        filePath = file.tempPath;
      } else if (window.electronAPI?.saveTempFile && editorRef.current) {
        const content = editorRef.current.getValue();
        const tempResult = await window.electronAPI.saveTempFile({
          fileName,
          extension,
          content
        });
        if (tempResult?.success && tempResult.filePath) {
          filePath = tempResult.filePath;
          if (onTempFileSaved) onTempFileSaved(tempResult.filePath);
        } else if (tempResult?.error && onLog) {
          onLog(`Temp save failed: ${tempResult.error}`, 'warning');
        }
      }

        // Secondary fallback: try getTempDir approach
        if (!filePath && window.electronAPI?.getTempDir && window.electronAPI?.createFolder && window.electronAPI?.writeFile && editorRef.current) {
          try {
            const tempDirResult = await window.electronAPI.getTempDir();
            if (tempDirResult?.success && tempDirResult.tempDir) {
              const baseDir = joinPath(tempDirResult.tempDir, 'neuro-code-editor');
              await window.electronAPI.createFolder(baseDir);
              const tempFileName = buildTempFileName(fileName, extension);
              const tempPath = joinPath(baseDir, tempFileName);
              const content = editorRef.current.getValue();
              const writeResult = await window.electronAPI.writeFile(tempPath, content);
              if (writeResult?.success) {
                filePath = tempPath;
                if (onTempFileSaved) onTempFileSaved(tempPath);
              } else if (writeResult?.error && onLog) {
                onLog(`Temp save failed: ${writeResult.error}`, 'warning');
              }
            } else if (tempDirResult?.error && onLog) {
              onLog(`Temp directory unavailable: ${tempDirResult.error}`, 'warning');
            }
          } catch (fallbackErr) {
            console.warn('[Run] Fallback temp save failed:', fallbackErr);
            if (onLog) onLog(`Temp save failed: ${fallbackErr.message}`, 'warning');
          }
        }

        if (!filePath) {
          if (onLog) onLog('Unable to create a temporary file for execution. Try saving the file first using Ctrl+S.', 'error');
          const payload = buildProblemsPayload([{
            severity: 'error',
            message: 'Unable to create a temporary file for execution. Try saving the file first.',
            line: 1,
            column: 1,
            fileName,
            filePath: ''
          }]);
          console.debug('[Problems] payload:', payload);
          if (onProblemsChange) onProblemsChange(payload.items);
          setIsRunning(false);
          return payload;
        }
    }

    setIsRunning(true);
    if (onLog) onLog(`Running ${fileName} (${runTarget})...`, 'info');

    try {
      // Always save current buffer before run
      if (window.electronAPI?.writeFile && editorRef.current) {
        const content = editorRef.current.getValue();
        const saveResult = await window.electronAPI.writeFile(filePath, content);
        if (!saveResult?.success) {
          throw new Error(saveResult?.error || 'Failed to save file before running.');
        }
      }

      let result;
      if (runTarget === 'python' || runTarget === 'node' || runTarget === 'html') {
        if (!window.electronAPI?.runFile) {
          throw new Error('Run engine is unavailable in this environment. Use the Electron app.');
        }
        result = await window.electronAPI.runFile({ filePath, runTarget });
      } else {
        const infoMsg = `Unsupported file type "${extension || 'unknown'}".`;
        if (onLog) onLog(infoMsg, 'warning');
        const payload = buildProblemsPayload([{
          severity: 'info',
          message: infoMsg,
          line: 1,
          column: 1,
          fileName,
          filePath
        }]);
        console.debug('[Problems] payload:', payload);
        if (onProblemsChange) onProblemsChange(payload.items);
        setIsRunning(false);
        return payload;
      }

      console.debug('[Run] result:', result);

      if (result?.success) {
        if (result.output && onLog) onLog(result.output, 'success');
        if (result.info && onLog) onLog(result.info, 'info');
        if (onLog) onLog('Execution completed without errors.', 'success');
        const payload = buildProblemsPayload([]);
        console.debug('[Problems] payload:', payload);
        if (onProblemsChange) onProblemsChange(payload.items);
        return payload;
      } else {
        const errorText = result?.error || 'Unknown execution error';
        if (onLog) onLog(`Execution failed: ${errorText}`, 'error');
        const errors = parseErrorOutput(errorText, fileName, filePath);
        const payload = buildProblemsPayload(errors);
        console.debug('[Problems] payload:', payload);
        if (onProblemsChange) onProblemsChange(payload.items);
        return payload;
      }
    } catch (error) {
      console.error('[Run] error:', error);
      if (onLog) onLog(`Error running code: ${error.message}`, 'error');
      const payload = buildProblemsPayload([{
        severity: 'error',
        message: error.message || 'Unknown error',
        line: 1,
        column: 1,
        fileName: file?.name || 'Unknown',
        filePath: file?.path || ''
      }]);
      console.debug('[Problems] payload:', payload);
      if (onProblemsChange) onProblemsChange(payload.items);
      return payload;
    } finally {
      setIsRunning(false);
    }
  };

  const parseErrorOutput = (errorText, fileName, filePath) => {
    const errors = [];
    const safeText = typeof errorText === 'string' ? errorText : String(errorText || '');
    const lines = safeText.split('\n');
    const safeFileName = fileName || 'Unknown';
    const safeFilePath = filePath || '';

    lines.forEach((line, index) => {
      // Try to match common error patterns
      const pythonError = line.match(/File ".*?", line (\d+)/);
      const jsError = line.match(/at .*?:(\d+):(\d+)/);
      
      if (pythonError) {
        errors.push({
          severity: 'error',
          message: line.split('Error:')[1]?.trim() || line,
          line: parseInt(pythonError[1]),
          column: 1,
          fileName: safeFileName,
          filePath: safeFilePath
        });
      } else if (jsError) {
        errors.push({
          severity: 'error',
          message: line,
          line: parseInt(jsError[1]),
          column: parseInt(jsError[2]),
          fileName: safeFileName,
          filePath: safeFilePath
        });
      } else if (line.includes('Error') || line.includes('error')) {
        errors.push({
          severity: 'error',
          message: line,
          line: index + 1,
          column: 1,
          fileName: safeFileName,
          filePath: safeFilePath
        });
      }
    });

    return errors.length > 0 ? errors : [{
      severity: 'error',
      message: safeText,
      line: 1,
      column: 1,
      fileName: safeFileName,
      filePath: safeFilePath
    }];
  };

  const publishProblems = () => {
    if (!onProblemsChange || !monacoRef.current || !editorRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    const markers = monacoRef.current.editor.getModelMarkers({ resource: model.uri });
    const problems = markers.map((m) => {
      let severity = 'info';
      if (m.severity === monacoRef.current.MarkerSeverity.Error) severity = 'error';
      else if (m.severity === monacoRef.current.MarkerSeverity.Warning) severity = 'warning';

      return {
        severity,
        message: m.message,
        line: m.startLineNumber,
        column: m.startColumn,
        fileName: file?.name || model.uri.path.split('/').pop(),
        filePath: file?.path || model.uri.path
      };
    });

    onProblemsChange(problems);
  };

  useEffect(() => {
    if (!file && onProblemsChange) {
      onProblemsChange([]);
    }
    publishProblems();
    return () => {
      if (markersListenerRef.current) {
        markersListenerRef.current.dispose();
        markersListenerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file?.path, file?.name]);

  useEffect(() => {
    if (!navigateTo || !editorRef.current) return;
    const line = Math.max(1, navigateTo.line || 1);
    const column = Math.max(1, navigateTo.column || 1);
    editorRef.current.revealLineInCenter(line);
    editorRef.current.setPosition({ lineNumber: line, column });
    editorRef.current.focus();
    if (onNavigateHandled) onNavigateHandled();
  }, [navigateTo, onNavigateHandled]);

  // Auto-save functionality - saves every 30 seconds when file has changes
  useEffect(() => {
    if (!file || !file.isDirty) {
      // Clear timer if no unsaved changes
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
      if (file && !file.isDirty) {
        setAutoSaveStatus('saved');
      }
      return;
    }

    // Set status to unsaved when file changes
    setAutoSaveStatus('unsaved');

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    // Auto-save immediately on first change
    autoSaveFile();

    // Then set up interval for periodic auto-saves (every 30 seconds)
    autoSaveTimerRef.current = setInterval(() => {
      autoSaveFile();
    }, 30000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [file?.isDirty, file?.name]);

  const getLanguage = (filename) => {
    if (!filename || typeof filename !== 'string') return 'plaintext';
    
    const ext = getFileExtension(filename);
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'sh': 'shell',
      'sql': 'sql',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
    };
    
    return languageMap[ext] || 'plaintext';
  };

  const getFileExtension = (filename) => {
    if (!filename || typeof filename !== 'string') return '';
    const parts = filename.split('.');
    if (parts.length < 2) return '';
    return parts.pop().toLowerCase();
  };

  const joinPath = (base, part) => {
    const separator = base.includes('/') ? '/' : '\\';
    const trimmedBase = base.endsWith(separator) ? base.slice(0, -1) : base;
    const trimmedPart = part.startsWith(separator) ? part.slice(1) : part;
    return `${trimmedBase}${separator}${trimmedPart}`;
  };

  const buildTempFileName = (name, extension) => {
    const safeBase = (name || 'untitled').replace(/[\\/:*?"<>|]/g, '').trim() || 'untitled';
    const parsed = safeBase.split('.');
    const base = parsed.length > 1 ? parsed.slice(0, -1).join('.') : safeBase;
    const ext = extension ? `.${extension}` : (parsed.length > 1 ? `.${parsed[parsed.length - 1]}` : '.txt');
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    return `${base}-${unique}${ext}`;
  };

  const getRunTarget = (extension) => {
    switch (extension) {
      case 'py':
        return 'python';
      case 'js':
        return 'node';
      case 'html':
        return 'html';
      default:
        return 'unsupported';
    }
  };

  const buildDefaultFileName = (name, extension, language) => {
    const safeBase = (name || 'untitled').replace(/[\\/:*?"<>|]/g, '').trim() || 'untitled';
    if (extension) {
      return safeBase;
    }
    const extMap = {
      python: 'py',
      javascript: 'js',
      typescript: 'ts',
      html: 'html'
    };
    const ext = extMap[language] || 'txt';
    return `${safeBase}.${ext}`;
  };

  const hasUnsavedChanges = !!file && (file.isDirty || (!file.path && file.tempPath));

  const handleCloseFile = async () => {
    if (!file) return;

    if (hasUnsavedChanges) {
      if (window.electronAPI?.showUnsavedPrompt) {
        const response = await window.electronAPI.showUnsavedPrompt({ fileName: file.name });
        if (response?.choice === 'save') {
          const result = await saveFile();
          if (result?.success) {
            if (onCloseFile) onCloseFile();
          }
          return;
        }
        if (response?.choice === 'dont-save') {
          if (onCloseFile) onCloseFile();
        }
        return;
      }

      const confirmed = window.confirm('You have unsaved changes. Close without saving?');
      if (!confirmed) return;
    }

    if (onCloseFile) onCloseFile();
  };

  const buildProblemsPayload = (items) => {
    const safeItems = Array.isArray(items) ? items : [];
    const counts = safeItems.reduce((acc, item) => {
      const key = item?.severity || 'info';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, { error: 0, warning: 0, info: 0 });

    return {
      summary: {
        total: safeItems.length,
        error: counts.error || 0,
        warning: counts.warning || 0,
        info: counts.info || 0
      },
      items: safeItems
    };
  };

  return (
    <div className="code-editor">
      <div className="editor-header">
        <div className="editor-tabs">
          {file ? (
            <div className="editor-tab active">
              <span>
                {file.name}
                {file?.isDirty ? ' *' : ''}
              </span>
              {autoSaveStatus === 'saving' && (
                <span className="auto-save-indicator saving" title="Auto-saving...">
                  <FaSpinner className="auto-save-spinner" /> Saving
                </span>
              )}
              {autoSaveStatus === 'saved' && file?.isDirty === false && (
                <span className="auto-save-indicator saved" title="Auto-saved">
                  ✓ Saved
                </span>
              )}
              <button className="tab-close-btn" onClick={handleCloseFile} title="Close File">
                <FaTimes />
              </button>
            </div>
          ) : (
            <div className="editor-tab-placeholder">
              No file opened
            </div>
          )}
        </div>
        <div className="editor-actions">
          {file && (
            <button 
              className="run-btn" 
              onClick={runCode} 
              disabled={isRunning}
              title="Run Code (Ctrl+Shift+F5)"
            >
              {isRunning ? <FaSpinner className="spinner" /> : <FaPlay />}
              <span>{isRunning ? 'Running' : 'Run'}</span>
            </button>
          )}
          {file && (
            <button className="save-btn" onClick={saveFile} title="Save (Ctrl+S)">
              <FaSave />
              <span>Save</span>
            </button>
          )}
        </div>
      </div>

      <div className="editor-container">
        {file ? (
          <Editor
            height="100%"
            language={getLanguage(file.name)}
            path={file.path || file.name}
            value={file.content}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              fontSize: 14,
              fontFamily: 'Consolas, "Courier New", monospace',
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              lineNumbers: 'on',
              renderWhitespace: 'selection',
              cursorBlinking: 'smooth',
              smoothScrolling: true,
            }}
          />
        ) : (
          <div className="editor-empty-state">
            <h2>Welcome to Neuro Code Editor</h2>
            <p>Open a file from the explorer or use the AI panel to generate code</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
