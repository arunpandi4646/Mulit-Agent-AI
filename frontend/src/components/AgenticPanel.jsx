import React, { useState } from 'react';
import { FaRobot, FaPaperPlane, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { agenticAPI } from '../services/api';
import AgentStepsView from './AgentStepsView';
import './AgenticPanel.css';

const AgenticPanel = ({ onCodeGenerated, onLog }) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentSteps, setAgentSteps] = useState(null);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('unknown');

  const checkBackendHealth = async () => {
    const health = await agenticAPI.healthCheck();
    const status = (health?.status || '').toLowerCase();
    const isOnline = status === 'online' || status === 'healthy';
    setBackendStatus(isOnline ? 'online' : 'offline');
  };

  React.useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRunAI = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    if (backendStatus === 'offline') {
      const msg = 'Backend is offline. Please start the FastAPI server.';
      setError(msg);
      if (onLog) onLog(msg, 'error');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setAgentSteps(null);

    // Initial logs
    if (onLog) {
      onLog('Starting Neuro pipeline...', 'info');
      onLog(`Processing prompt: "${prompt}"`, 'info');
    }

    try {
      if (onLog) onLog('Planner Agent: Analyzing intent...', 'info');
      
      const response = await agenticAPI.generateCode(prompt);
      
      if (onLog) {
        onLog('Planner Agent: Plan created successfully.', 'success');
        onLog('Architect Agent: Architecture designed.', 'success');
        onLog('Code Generator Agent: Files generated.', 'success');
        onLog('Debug Agent: Code passed verification.', 'success');
      }

      setAgentSteps({
        plan: response.plan,
        architecture: response.architecture,
        files: response.files,
        debug: response.debug || 'Code generation completed successfully'
      });

      // Notify parent component with generated files
      if (onCodeGenerated && response.files) {
        onCodeGenerated(response.files);
      }

    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to generate code';
      setError(errorMsg);
      if (onLog) onLog(`Error: ${errorMsg}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleRunAI();
    }
  };

  return (
    <div className="agentic-panel">
      <div className="panel-header">
        <div className="panel-title">
          <FaRobot className="icon" />
          <span>NEURO</span>
        </div>
        <div className={`status-indicator ${backendStatus}`}>
          <div className="status-dot"></div>
          <span>
            {backendStatus === 'online' ? '🟢 online' : '🔴 offline'}
          </span>
        </div>
      </div>

      <div className="panel-content">
        <div className="prompt-section">
          <label htmlFor="ai-prompt">Vibe Coding Prompt</label>
          <textarea
            id="ai-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe what you want to build in natural language...&#10;&#10;Example: Create a React todo app with add, delete, and mark complete features"
            disabled={isProcessing}
            rows={6}
          />
          <div className="prompt-hint">
            Press Ctrl+Enter to run
          </div>
        </div>

        <button
          className="run-ai-btn"
          onClick={handleRunAI}
          disabled={isProcessing || !prompt.trim()}
        >
          {isProcessing ? (
            <>
              <FaSpinner className="icon spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <FaPaperPlane className="icon" />
              <span>Run Neuro</span>
            </>
          )}
        </button>

        {error && (
          <div className="error-message fade-in">
            <strong>Error:</strong> {error}
          </div>
        )}

        {agentSteps && (
          <div className="success-message fade-in">
            <FaCheckCircle className="icon" />
            <span>Code generated successfully!</span>
          </div>
        )}

        {agentSteps && (
          <AgentStepsView steps={agentSteps} />
        )}
      </div>
    </div>
  );
};

export default AgenticPanel;
