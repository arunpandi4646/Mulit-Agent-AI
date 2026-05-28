import React, { useState } from 'react';
import { FaTimesCircle, FaExclamationTriangle, FaInfoCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './ProblemsPanel.css';

const ProblemsPanel = ({ problems, isOpen, onClose, onNavigate }) => {
  const [expandedFile, setExpandedFile] = useState(null);

  if (!isOpen) return null;

  // Group problems by file
  const groupedProblems = problems.reduce((acc, problem) => {
    const file = problem.fileName || 'Unknown';
    if (!acc[file]) {
      acc[file] = [];
    }
    acc[file].push(problem);
    return acc;
  }, {});

  const errorCount = problems.filter(p => p.severity === 'error').length;
  const warningCount = problems.filter(p => p.severity === 'warning').length;

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error':
        return <FaTimesCircle className="severity-error" />;
      case 'warning':
        return <FaExclamationTriangle className="severity-warning" />;
      default:
        return <FaInfoCircle className="severity-info" />;
    }
  };

  const handleProblemClick = (problem) => {
    if (onNavigate) {
      onNavigate({
        file: problem.filePath,
        line: problem.line,
        column: problem.column
      });
    }
  };

  const toggleFileExpanded = (fileName) => {
    setExpandedFile(expandedFile === fileName ? null : fileName);
  };

  return (
    <div className="problems-panel">
      <div className="problems-header">
        <div className="problems-title">
          <span>PROBLEMS</span>
          <span className="problem-counts">
            {errorCount > 0 && <span className="error-count">{errorCount}</span>}
            {warningCount > 0 && <span className="warning-count">{warningCount}</span>}
          </span>
        </div>
        <button className="close-btn" onClick={onClose} title="Close Problems Panel">
          ✕
        </button>
      </div>

      <div className="problems-content">
        {problems.length === 0 ? (
          <div className="problems-empty">
            <FaInfoCircle />
            <p>No problems in this workspace</p>
          </div>
        ) : (
          <div className="problems-list">
            {Object.entries(groupedProblems).map(([fileName, fileProblems]) => (
              <div key={fileName} className="problem-file-group">
                <div 
                  className="problem-file-header"
                  onClick={() => toggleFileExpanded(fileName)}
                >
                  <span className="chevron">
                    {expandedFile === fileName ? <FaChevronDown /> : <FaChevronUp />}
                  </span>
                  <span className="file-name">{fileName}</span>
                  <span className="file-problem-count">({fileProblems.length})</span>
                </div>

                {expandedFile === fileName && (
                  <div className="problem-file-items">
                    {fileProblems.map((problem, idx) => (
                      <div
                        key={`${fileName}-${idx}`}
                        className={`problem-item severity-${problem.severity}`}
                        onClick={() => handleProblemClick(problem)}
                      >
                        <span className="problem-severity">
                          {getSeverityIcon(problem.severity)}
                        </span>
                        <div className="problem-details">
                          <div className="problem-message">{problem.message}</div>
                          <div className="problem-location">
                            {fileName}:{problem.line}:{problem.column}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemsPanel;
