import React from 'react';
import { AgentBridgeProvider } from '@agentbridge/react';
import { AgentBridge, WebSocketAdapter } from '@agentbridge/core';
import Counter from './components/Counter';
import './App.css';

function App() {
  const [connectionStatus, setConnectionStatus] = React.useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  
  // Create AgentBridge instance with WebSocket communication
  const bridge = React.useMemo(() => {
    const wsAdapter = new WebSocketAdapter({
      url: 'ws://localhost:8080',
      autoReconnect: true,
      debug: true
    });

    const bridge = new AgentBridge({
      logging: {
        level: 'debug'
      }
    });

    // Set the WebSocket adapter as the communication manager
    bridge.setCommunicationManager(wsAdapter);

    // Connect to the server
    wsAdapter.connect()
      .then(() => {
        console.log('✅ Connected to AgentBridge server');
        setConnectionStatus('connected');
      })
      .catch((error) => {
        console.error('❌ Failed to connect to AgentBridge server:', error);
        setConnectionStatus('disconnected');
      });

    return bridge;
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>AgentBridge Simple Counter Example</h1>
        <p>Counter and buttons controlled by AI agents via WebSocket</p>
        <div style={{ 
          marginTop: '10px', 
          padding: '8px 16px', 
          borderRadius: '4px',
          backgroundColor: connectionStatus === 'connected' ? '#4caf50' : 
                          connectionStatus === 'connecting' ? '#ff9800' : '#f44336',
          color: 'white',
          fontWeight: 'bold',
          display: 'inline-block'
        }}>
          {connectionStatus === 'connected' && '✅ Connected to Server'}
          {connectionStatus === 'connecting' && '⏳ Connecting to Server...'}
          {connectionStatus === 'disconnected' && '❌ Disconnected from Server'}
        </div>
      </header>
      
      <main className="app-content">
        <AgentBridgeProvider bridge={bridge}>
          <Counter />
        </AgentBridgeProvider>
      </main>
      
      <footer className="app-footer">
        <p>
          AgentBridge Example - Components registered and ready for AI control
        </p>
        <p style={{ fontSize: '0.9em', marginTop: '10px', color: '#666' }}>
          Server: ws://localhost:8080 | Agent Client: ws://localhost:8081
        </p>
      </footer>
    </div>
  );
}

export default App;
