import React, { useEffect, useRef, useState } from 'react';
import { FaTimes, FaPlus, FaChevronDown } from 'react-icons/fa';
import './BottomTerminal.css';

const BottomTerminal = ({ 
  logs = [], 
  problems = [],
  onProblemClick,
  isOpen, 
  onClose, 
  height, 
  onResizeStart,
  onClearLogs
}) => {
  const [activeTab, setActiveTab] = useState('Terminal');
  const [inputValue, setInputValue] = useState('');
  const outputRef = useRef(null);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      const command = inputValue.trim();
      if (command === 'clear') {
        onClearLogs && onClearLogs();
      } else if (command) {
        // Echo command (mock) - ideally this would go to a handler
        // For now we just clear input
      }
      setInputValue('');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="bottom-terminal" 
      style={{ height: `${height}px` }}
    >
      <div 
        className="terminal-resizer"
        onMouseDown={onResizeStart}
      />
      
      <div className="terminal-header">
        <div className="terminal-tabs">
          {['PROBLEMS', 'OUTPUT', 'DEBUG CONSOLE', 'TERMINAL'].map(tab => (
            <div 
              key={tab}
              className={`terminal-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
        
        <div className="terminal-actions">
          <div className="action-btn" title="New Terminal">
            <FaPlus />
            <FaChevronDown style={{ fontSize: 10, marginLeft: 2 }} />
          </div>
          <div className="action-btn" onClick={onClose} title="Close Panel">
            <FaTimes />
          </div>
        </div>
      </div>

      <div className="terminal-content">
        {activeTab === 'PROBLEMS' ? (
          <div className="problems-panel">
            {problems.length === 0 ? (
              <div className="terminal-empty">
                <p>No problems detected</p>
              </div>
            ) : (
              <div className="problems-list">
                {problems.map((p, index) => (
                  <button
                    key={`${p.filePath || p.fileName}-${p.line}-${index}`}
                    className={`problem-item ${p.severity}`}
                    onClick={() => onProblemClick && onProblemClick(p)}
                    title={`${p.fileName || 'Unknown'}:${p.line || 1}`}
                  >
                    <span className={`problem-dot ${p.severity}`} />
                    <span className="problem-message">{p.message}</span>
                    <span className="problem-meta">
                      {p.fileName || 'Unknown'}:{p.line || 1}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'TERMINAL' ? (
          <div className="terminal-body" ref={outputRef}>
            <div className="terminal-info">
              Microsoft Windows [Version 10.0.19045.2486]<br/>
              (c) Microsoft Corporation. All rights reserved.<br/>
              <br/>
              C:\Users\Arun\Desktop\Desktop Application\desktop-app&gt; _
            </div>
            
            {logs.map((log, index) => (
              <div key={index} className="log-entry">
                {log.timestamp && <span className="log-time">[{log.timestamp}] </span>}
                <span className={`log-message ${log.type || 'info'}`}>{log.message}</span>
              </div>
            ))}

            <div className="terminal-input-line">
              <span className="prompt-path">C:\Users\Arun\Desktop\Desktop Application\desktop-app&gt;</span>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                className="terminal-input"
                autoFocus
                spellCheck={false}
              />
            </div>
          </div>
        ) : (
          <div className="terminal-empty">
            <p>No output for {activeTab}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BottomTerminal;
