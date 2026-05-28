import React, { useState } from 'react';
import './SolutionPanel.css';

const SolutionPanel = ({ solution, onApply }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(solution);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="solution-panel">
            <div className="panel-label">SUGGESTED FIX</div>
            <div className="solution-container">
                <pre className="solution-code">
                    <code>{solution}</code>
                </pre>
                <div className="solution-actions">
                    <button className="vscode-btn" onClick={handleCopy}>
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button className="vscode-btn primary" onClick={onApply}>Apply Fix</button>
                </div>
            </div>
        </div>
    );
};

export default SolutionPanel;
