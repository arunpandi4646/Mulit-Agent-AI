import React from 'react';
import './ErrorCard.css';

const ErrorCard = ({ error }) => {
    const severityClass = error.severity.toLowerCase();
    
    return (
        <div className="error-card">
            <div className="error-header">
                <div className={`severity-badge ${severityClass}`}>
                    {error.severity}
                </div>
                <div className="file-info">
                    <span className="filename">{error.file}</span>
                    <span className="location">:{error.line}:{error.column}</span>
                </div>
            </div>
            
            <div className="error-message-container">
                <code className="error-message">
                    {error.message}
                </code>
            </div>
            
            <div className="error-type">
                Type: <span className="type-value">{error.type}</span>
            </div>
        </div>
    );
};

export default ErrorCard;
