import React, { useState } from 'react';
import { FaChevronDown, FaChevronRight, FaLightbulb, FaSitemap, FaCode, FaBug } from 'react-icons/fa';
import './AgentStepsView.css';

const AgentStepsView = ({ steps }) => {
  const [expandedSections, setExpandedSections] = useState({
    plan: true,
    architecture: true,
    files: true,
    debug: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderFileContent = (filename, content) => {
    return (
      <div key={filename} className="file-item">
        <div className="file-header">
          <FaCode className="icon" />
          <span className="filename">{filename}</span>
        </div>
        <pre className="file-content">
          <code>{content}</code>
        </pre>
      </div>
    );
  };

  return (
    <div className="agent-steps-view fade-in">
      <h3 className="steps-title">Agent Execution Steps</h3>

      {/* Planner Agent */}
      <div className="step-section">
        <div 
          className="step-header"
          onClick={() => toggleSection('plan')}
        >
          <div className="step-title">
            {expandedSections.plan ? <FaChevronDown /> : <FaChevronRight />}
            <FaLightbulb className="icon planner" />
            <span>1. Planner Agent</span>
          </div>
        </div>
        {expandedSections.plan && (
          <div className="step-content">
            <p>{steps.plan}</p>
          </div>
        )}
      </div>

      {/* Architect Agent */}
      <div className="step-section">
        <div 
          className="step-header"
          onClick={() => toggleSection('architecture')}
        >
          <div className="step-title">
            {expandedSections.architecture ? <FaChevronDown /> : <FaChevronRight />}
            <FaSitemap className="icon architect" />
            <span>2. Architect Agent</span>
          </div>
        </div>
        {expandedSections.architecture && (
          <div className="step-content">
            <p>{steps.architecture}</p>
          </div>
        )}
      </div>

      {/* Code Generator Agent */}
      <div className="step-section">
        <div 
          className="step-header"
          onClick={() => toggleSection('files')}
        >
          <div className="step-title">
            {expandedSections.files ? <FaChevronDown /> : <FaChevronRight />}
            <FaCode className="icon coder" />
            <span>3. Code Generator Agent</span>
          </div>
        </div>
        {expandedSections.files && (
          <div className="step-content">
            <div className="files-list">
              {Object.entries(steps.files).map(([filename, content]) =>
                renderFileContent(filename, content)
              )}
            </div>
          </div>
        )}
      </div>

      {/* Debug Agent */}
      <div className="step-section">
        <div 
          className="step-header"
          onClick={() => toggleSection('debug')}
        >
          <div className="step-title">
            {expandedSections.debug ? <FaChevronDown /> : <FaChevronRight />}
            <FaBug className="icon debugger" />
            <span>4. Debug Agent</span>
          </div>
        </div>
        {expandedSections.debug && (
          <div className="step-content">
            <p>{steps.debug}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentStepsView;
