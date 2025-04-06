import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createAgentBridge } from '@agentbridge/core';
import { initializeWebSocketProvider } from '@agentbridge/communication-websocket';
import { 
  AgentBridgeProvider,
  useAgentComponent, 
  useAgentFunction
} from '@agentbridge/react';
import './App.css';

// Create a static bridge instance outside the component
const bridge = createAgentBridge();

// Initialize WebSocket configuration
const WEBSOCKET_URL = 'ws://localhost:3001';

// Create a WebSocket provider
let websocketProvider = null;

// Initialize the WebSocket provider before rendering
websocketProvider = initializeWebSocketProvider(bridge, { url: WEBSOCKET_URL });

function StandardApp() {
  return (
    <AgentBridgeProvider bridge={bridge} debug={true}>
      <AppContent />
    </AgentBridgeProvider>
  );
}

function AppContent() {
  const [isConnected, setIsConnected] = useState(false);
  const [history, setHistory] = useState([]);
  
  // Handle connection events
  useEffect(() => {
    console.log('Setting up connection status listener');
    
    const handleConnectionChange = (status) => {
      const connected = status && status.connected;
      console.log('Connection status changed:', connected);
      setIsConnected(connected);
      
      // Add event to history
      setHistory(prev => [
        ...prev, 
        {
          time: new Date().toLocaleTimeString(),
          type: connected ? 'connected' : 'disconnected',
          message: `WebSocket ${connected ? 'connected' : 'disconnected'}`
        }
      ]);
    };
    
    // Register for connection events
    bridge.on('connectionChange', handleConnectionChange);
    
    // Connect to the WebSocket
    if (websocketProvider) {
      websocketProvider.connect()
        .then(() => {
          console.log('WebSocket connected successfully');
          
          // Explicitly set connection status to ensure UI updates
          setIsConnected(true);
          
          // Add connection event to history
          setHistory(prev => [
            ...prev, 
            {
              time: new Date().toLocaleTimeString(),
              type: 'connected',
              message: 'WebSocket connected successfully'
            }
          ]);
        })
        .catch(err => {
          console.error('Error connecting to WebSocket:', err);
          
          // Ensure we handle connection errors for the UI
          setIsConnected(false);
          
          // Add error event to history
          setHistory(prev => [
            ...prev, 
            {
              time: new Date().toLocaleTimeString(),
              type: 'error',
              message: `WebSocket connection error: ${err.message}`
            }
          ]);
        });
    }
    
    // Clean up on unmount
    return () => {
      console.log('Cleaning up WebSocket connection...');
      bridge.off('connectionChange', handleConnectionChange);
      
      if (websocketProvider) {
        websocketProvider.disconnect().catch(err => {
          console.error('Error disconnecting WebSocket:', err);
        });
      }
    };
  }, []);
  
  // Function to clear history
  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1>AgentBridge Counter Example</h1>
        <p>
          <span 
            className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`} 
          />
          {isConnected ? 'Connected to WebSocket' : 'Disconnected from WebSocket'}
        </p>
      </div>
      
      <CounterDemo addHistoryEntry={(message) => {
        const entry = {
          time: new Date().toLocaleTimeString(),
          type: 'action',
          message
        };
        setHistory(prev => [...prev, entry]);
      }} />
      
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

function CounterDemo({ addHistoryEntry }) {
  const [count, setCount] = useState(0);
  
  // Keep a ref to the count for async handler access
  const countRef = useRef(count);
  useEffect(() => {
    countRef.current = count;
  }, [count]);

  // Counter actions
  const increment = useCallback(() => {
    setCount(prev => prev + 1);
    addHistoryEntry('Counter incremented');
    return { success: true, newValue: countRef.current + 1 };
  }, [addHistoryEntry]);

  const decrement = useCallback(() => {
    setCount(prev => prev - 1);
    addHistoryEntry('Counter decremented');
    return { success: true, newValue: countRef.current - 1 };
  }, [addHistoryEntry]);

  const reset = useCallback(() => {
    setCount(0);
    addHistoryEntry('Counter reset');
    return { success: true, newValue: 0 };
  }, [addHistoryEntry]);

  const setValue = useCallback((value) => {
    if (typeof value !== 'number') {
      return { 
        success: false, 
        error: 'Value must be a number' 
      };
    }
    setCount(value);
    addHistoryEntry(`Counter set to ${value}`);
    return { success: true, newValue: value };
  }, [addHistoryEntry]);

  // Register counter component with AgentBridge
  const counterComponent = useAgentComponent({
    componentId: 'main-counter',
    componentType: 'Counter',
    description: 'A simple counter that can be incremented, decremented, reset, or set to a specific value.',
    initialState: { count: 0 },
    properties: {
      count: {
        type: 'number',
        description: 'Current count value'
      }
    },
    actions: {
      increment: {
        description: 'Increment the counter by 1',
        parameters: { type: 'object', properties: {} },
        handler: increment
      },
      decrement: {
        description: 'Decrement the counter by 1',
        parameters: { type: 'object', properties: {} },
        handler: decrement
      },
      reset: {
        description: 'Reset the counter to 0',
        parameters: { type: 'object', properties: {} },
        handler: reset
      },
      setValue: {
        description: 'Set the counter to a specific value',
        parameters: {
          type: 'object',
          properties: {
            value: {
              type: 'number',
              description: 'The value to set the counter to'
            }
          }
        },
        handler: (params) => setValue(params.value)
      }
    }
  });
  
  // Register function to add history entries
  useAgentFunction(
    {
      name: 'addHistoryEntry',
      description: 'Add an entry to the history log',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Message to add to the history'
          }
        }
      }
    },
    async ({ message }) => {
      const entry = {
        time: new Date().toLocaleTimeString(),
        type: 'info',
        message
      };
      addHistoryEntry(message);
      return { success: true, entry };
    }
  );
  
  // Update component state when count changes
  useEffect(() => {
    counterComponent.updateState({ count });
  }, [count, counterComponent]);

  return (
    <div className="card">
      <h2>Counter Demo</h2>
      <div className="counter-container">
        <div className={`counter-value ${count > 0 ? 'positive' : count < 0 ? 'negative' : ''}`}>
          {count}
        </div>
        <div className="counter-buttons">
          <button 
            className="counter-button decrement"
            onClick={decrement}
            aria-label="Decrement counter"
          >
            -
          </button>
          <button 
            className="counter-button reset"
            onClick={reset}
            aria-label="Reset counter"
          >
            Reset
          </button>
          <button 
            className="counter-button increment"
            onClick={increment}
            aria-label="Increment counter"
          >
            +
          </button>
        </div>
        <div className="counter-help">
          <h4>AI Commands:</h4>
          <ul>
            <li>Increment the counter</li>
            <li>Decrement the counter</li>
            <li>Reset the counter</li>
            <li>Set the counter to 42</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default StandardApp; 