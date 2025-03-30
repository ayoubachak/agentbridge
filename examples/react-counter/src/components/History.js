import React from 'react';
import './History.css';

function History({ history, clearHistory }) {
  // Format timestamp to a readable time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };
  
  return (
    <div className="history">
      <div className="history-header">
        <h2>Action History</h2>
        <button 
          className="clear-button" 
          onClick={clearHistory}
          disabled={history.length === 0}
        >
          Clear
        </button>
      </div>
      
      <div className="history-list">
        {history.length === 0 ? (
          <div className="no-history">No actions recorded yet</div>
        ) : (
          <ul>
            {history.map((entry, index) => (
              <li key={index}>
                <span className="history-time">{formatTime(entry.timestamp)}</span>
                <span className="history-action">{entry.action}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default History; 