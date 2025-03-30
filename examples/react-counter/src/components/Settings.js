import React from 'react';
import './Settings.css';

function Settings({ 
  communicationMode, 
  setCommunicationMode, 
  ablyKey, 
  setAblyKey, 
  wsUrl, 
  setWsUrl 
}) {
  return (
    <div className="settings">
      <h2>Connection Settings</h2>
      
      <div className="settings-section">
        <h3>Communication Mode</h3>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="communicationMode"
              value="pubsub"
              checked={communicationMode === 'pubsub'}
              onChange={() => setCommunicationMode('pubsub')}
            />
            Pub/Sub Mode (Ably)
          </label>
          
          <label>
            <input
              type="radio"
              name="communicationMode"
              value="self-hosted"
              checked={communicationMode === 'self-hosted'}
              onChange={() => setCommunicationMode('self-hosted')}
            />
            Self-Hosted Mode (WebSocket)
          </label>
        </div>
      </div>
      
      {communicationMode === 'pubsub' && (
        <div className="settings-section">
          <h3>Ably Configuration</h3>
          <div className="form-group">
            <label htmlFor="ably-key">Ably API Key</label>
            <input
              id="ably-key"
              type="text"
              value={ablyKey}
              onChange={(e) => setAblyKey(e.target.value)}
              placeholder="Enter your Ably API key"
            />
            <div className="help-text">
              Get a free API key at <a 
                href="https://ably.com/" 
                target="_blank"
                rel="noopener noreferrer"
              >Ably.com</a>
            </div>
          </div>
        </div>
      )}
      
      {communicationMode === 'self-hosted' && (
        <div className="settings-section">
          <h3>WebSocket Configuration</h3>
          <div className="form-group">
            <label htmlFor="ws-url">WebSocket URL</label>
            <input
              id="ws-url"
              type="text"
              value={wsUrl}
              onChange={(e) => setWsUrl(e.target.value)}
              placeholder="Enter WebSocket URL"
            />
            <div className="help-text">
              Default: ws://localhost:3001<br />
              <strong>Note:</strong> Make sure to start the WebSocket server with:<br />
              <code>npm run server</code>
            </div>
          </div>
        </div>
      )}
      
      <div className="settings-section">
        <h3>Connection Instructions</h3>
        <div className="connection-info">
          <p>To connect an AI agent to this application:</p>
          
          {communicationMode === 'pubsub' && (
            <>
              <ol>
                <li>Enter your Ably API key above</li>
                <li>Provide the agent with:
                  <ul>
                    <li>Your Ably API key</li>
                    <li>The channel ID: <code>agentbridge-example</code></li>
                  </ul>
                </li>
                <li>Ask the agent to use the Ably provider to connect</li>
              </ol>
            </>
          )}
          
          {communicationMode === 'self-hosted' && (
            <>
              <ol>
                <li>Start the WebSocket server</li>
                <li>Provide the agent with:
                  <ul>
                    <li>The WebSocket URL: <code>{wsUrl}</code></li>
                  </ul>
                </li>
                <li>Ask the agent to use the WebSocket provider to connect</li>
              </ol>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings; 