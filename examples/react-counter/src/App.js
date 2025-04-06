import React, { useState, useEffect } from 'react';
import { AgentBridge } from '@agentbridge/core';
import { AgentBridgeProvider } from '@agentbridge/react';
import { AblyProvider } from '@agentbridge/provider-ably';
import { WebSocketProvider } from '@agentbridge/communication-websocket';

import Counter from './components/Counter';
import History from './components/History';
import Settings from './components/Settings';
import BridgeDebugger from './components/BridgeDebugger';
import './App.css';

function App() {
  const [bridge, setBridge] = useState(null);
  const [communicationMode, setCommunicationMode] = useState('pubsub');
  const [ablyKey, setAblyKey] = useState('');
  const [history, setHistory] = useState([]);
  const [wsUrl, setWsUrl] = useState('ws://localhost:3001');
  const [isConnected, setIsConnected] = useState(false);

  // Create or update the bridge when configuration changes
  useEffect(() => {
    let provider;
    
    if (communicationMode === 'pubsub' && ablyKey) {
      provider = new AblyProvider({ apiKey: ablyKey });
    } else if (communicationMode === 'self-hosted' && wsUrl) {
      provider = new WebSocketProvider({ url: wsUrl });
    } else {
      // Don't create bridge if configuration is incomplete
      setBridge(null);
      setIsConnected(false);
      return;
    }
    
    const newBridge = new AgentBridge({
      provider,
      logging: true,
    });
    
    // Register application-level functions
    newBridge.registerFunction({
      name: 'addToHistory',
      description: 'Add an entry to the history',
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string', description: 'The action performed' },
          timestamp: { type: 'number', description: 'Timestamp of the action' },
        },
        required: ['action'],
      },
      handler: (params) => {
        const entry = {
          action: params.action,
          timestamp: params.timestamp || Date.now(),
        };
        setHistory(prev => [...prev, entry]);
        return { success: true, entry };
      }
    });
    
    // Listen for connection status
    const handleConnectionChange = (status) => {
      setIsConnected(status.connected);
      if (status.connected) {
        setHistory(prev => [...prev, { action: 'Connected to AgentBridge', timestamp: Date.now() }]);
      } else {
        setHistory(prev => [...prev, { action: 'Disconnected from AgentBridge', timestamp: Date.now() }]);
      }
    };
    
    newBridge.on('connectionChange', handleConnectionChange);
    
    // Set the bridge
    setBridge(newBridge);
    
    // Connect
    newBridge.connect();
    
    // Cleanup
    return () => {
      newBridge.removeListener('connectionChange', handleConnectionChange);
      newBridge.disconnect();
    };
  }, [communicationMode, ablyKey, wsUrl]);
  
  // Add a count change to history
  const addCountChangeToHistory = (action, value) => {
    setHistory(prev => [...prev, {
      action: `${action}: ${value}`,
      timestamp: Date.now()
    }]);
  };
  
  // Clear history
  const clearHistory = () => {
    setHistory([]);
  };
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>AgentBridge React Counter Example</h1>
        <div className="connection-status">
          Status: {isConnected ? 
            <span className="connected">Connected</span> : 
            <span className="disconnected">Disconnected</span>}
        </div>
      </header>
      
      <main className="app-content">
        <div className="app-container">
          {bridge ? (
            <AgentBridgeProvider bridge={bridge}>
              <div className="counter-container">
                <Counter onCountChange={addCountChangeToHistory} />
                <BridgeDebugger />
              </div>
            </AgentBridgeProvider>
          ) : (
            <div className="setup-message">
              Please configure your communication settings to connect.
            </div>
          )}
          
          <div className="side-panel">
            <Settings 
              communicationMode={communicationMode}
              setCommunicationMode={setCommunicationMode}
              ablyKey={ablyKey}
              setAblyKey={setAblyKey}
              wsUrl={wsUrl}
              setWsUrl={setWsUrl}
            />
            
            <History 
              history={history}
              clearHistory={clearHistory}
            />
          </div>
        </div>
      </main>
      
      <footer className="app-footer">
        <p>
          AgentBridge Example - <a 
            href="https://github.com/agentbridge/agentbridge"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Repository
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App; 