import React, { useState, useEffect } from 'react';
import { AgentBridgeProvider, useAgentBridge, useAgentFunction } from '@agentbridge/react';
import { createAgentBridge } from '@agentbridge/core';
import { initializeWebSocketProvider } from '@agentbridge/communication-websocket';
import Counter from './components/Counter';

// Create AgentBridge instance
const bridge = createAgentBridge();

// Initialize with WebSocket provider
const WEBSOCKET_URL = 'ws://localhost:3001';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [history, setHistory] = useState([]);

  // Initialize the WebSocket provider
  useEffect(() => {
    const provider = initializeWebSocketProvider(bridge, { url: WEBSOCKET_URL });
    
    // Listen for connection changes
    const handleConnectionChange = (connected) => {
      setIsConnected(connected);
      setHistory(prev => [...prev, {
        time: new Date().toLocaleTimeString(),
        type: connected ? 'connected' : 'disconnected',
        message: `WebSocket ${connected ? 'connected' : 'disconnected'}`
      }]);
    };
    
    // Setup connection listener
    bridge.on('connectionChanged', handleConnectionChange);
    
    // Connect to the WebSocket
    provider.connect()
      .then(() => console.log('Connected to WebSocket'))
      .catch(err => console.error('Error connecting to WebSocket:', err));
    
    return () => {
      bridge.off('connectionChanged', handleConnectionChange);
      provider.disconnect().catch(err => {
        console.error('Error disconnecting:', err);
      });
    };
  }, []);

  // Register a function to add entries to history
  useAgentFunction(
    {
      name: 'addHistoryEntry',
      description: 'Add an entry to the history log',
      parameters: {
        message: {
          type: 'string',
          description: 'Message to add to the history'
        }
      }
    },
    async ({ message }) => {
      const entry = {
        time: new Date().toLocaleTimeString(),
        type: 'info',
        message
      };
      setHistory(prev => [...prev, entry]);
      return { success: true, entry };
    }
  );

  // Function to add count changes to history
  const addToHistory = (message) => {
    setHistory(prev => [...prev, {
      time: new Date().toLocaleTimeString(),
      type: 'action',
      message
    }]);
  };

  // Function to clear history
  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1>AgentBridge React Example</h1>
        <p>
          <span 
            className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`} 
          />
          {isConnected ? 'Connected to WebSocket' : 'Disconnected from WebSocket'}
        </p>
      </div>
      
      <div className="card">
        <h2>Counter Demo</h2>
        <Counter id="main-counter" />
      </div>
      
      <div className="card">
        <h2>Event History</h2>
        <button onClick={clearHistory}>Clear History</button>
        <div style={{ marginTop: '10px', maxHeight: '200px', overflowY: 'auto' }}>
          {history.length === 0 ? (
            <p>No events yet</p>
          ) : (
            <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
              {history.map((item, index) => (
                <li key={index} style={{ 
                  padding: '4px 0',
                  borderBottom: '1px solid #eee',
                  color: item.type === 'error' ? '#f44336' : 
                         item.type === 'action' ? '#2196f3' : 
                         item.type === 'connected' ? '#4caf50' : 
                         item.type === 'disconnected' ? '#f44336' : '#333'
                }}>
                  <small>[{item.time}]</small> {item.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrap App with AgentBridgeProvider
function AppWithAgentBridge() {
  return (
    <AgentBridgeProvider bridge={bridge}>
      <App />
    </AgentBridgeProvider>
  );
}

export default AppWithAgentBridge; 