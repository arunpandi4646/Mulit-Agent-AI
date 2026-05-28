import React from 'react';
import './StatusBar.css';

const StatusBar = ({ errorCount }) => {
    return (
        <div className="status-bar">
            <div className="status-item left">
                <span className="status-icon active"></span>
                <span>Active</span>
            </div>
            <div className="status-item right">
                <span>Errors: {errorCount}</span>
            </div>
        </div>
    );
};

export default StatusBar;
