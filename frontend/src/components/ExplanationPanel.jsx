import React from 'react';
import './ExplanationPanel.css';

const ExplanationPanel = ({ explanation }) => {
    return (
        <div className="explanation-panel">
            <div className="panel-label">ANALYSIS</div>
            <div className="explanation-content">
                {explanation}
            </div>
        </div>
    );
};

export default ExplanationPanel;
