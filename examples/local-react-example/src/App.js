import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createAgentBridge } from '@agentbridge/core';
import { initializeWebSocketProvider } from '@agentbridge/communication-websocket';
import './App.css';

// Create a static bridge instance outside the component
const bridge = createAgentBridge();

// Initialize WebSocket configuration
const WEBSOCKET_URL = 'ws://localhost:3001';

// Create a WebSocket provider
let websocketProvider = null;

// Helper function to create schemas with describe method
function createSchema(schemaObject) {
  return {
    ...schemaObject,
    describe: function(name) {
      return {
        type: this.type || 'object',
        properties: this.properties,
        required: this.required,
        title: name
      };
    }
  };
}

// Helper function to create parameters schema
function createParametersSchema(params) {
  return createSchema({
    type: 'object',
    properties: params,
    required: Object.keys(params).filter(key => 
      params[key].required === true
    )
  });
}

function StandardApp() {
  const [isConnected, setIsConnected] = useState(false);
  const [history, setHistory] = useState([]);
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  
  // Keep the ref in sync with the state
  useEffect(() => {
    countRef.current = count;
  }, [count]);

  // Counter actions
  const increment = useCallback(() => {
    setCount(prev => prev + 1);
    return { success: true, newValue: countRef.current + 1 };
  }, []);

  const decrement = useCallback(() => {
    setCount(prev => prev - 1);
    return { success: true, newValue: countRef.current - 1 };
  }, []);

  const reset = useCallback(() => {
    setCount(0);
    return { success: true, newValue: 0 };
  }, []);

  const setValue = useCallback((value) => {
    if (typeof value !== 'number') {
      return { 
        success: false, 
        error: 'Value must be a number' 
      };
    }
    setCount(value);
    return { success: true, newValue: value };
  }, []);

  // Initialize the bridge and register components
  useEffect(() => {
    console.log('Initializing WebSocket connection...');
    
    // Initialize the WebSocket provider
    websocketProvider = initializeWebSocketProvider(bridge, { url: WEBSOCKET_URL });
    
    // Create schemas for the component properties and actions
    const counterPropertiesSchema = createSchema({
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Current count value'
        }
      }
    });
    
    const setValueParamsSchema = createParametersSchema({
      value: {
        type: 'number',
        description: 'The value to set the counter to'
      }
    });
    
    // Create empty parameter schemas for actions that don't need parameters
    const emptyParamsSchema = createParametersSchema({});
    
    // Register counter component with the bridge
    bridge.registerComponent(
      'main-counter',
      'A simple counter that can be incremented, decremented, reset, or set to a specific value.',
      'Counter',
      {
        properties: counterPropertiesSchema,
        actions: {
          increment: {
            description: 'Increment the counter by 1',
            parameters: emptyParamsSchema,
            handler: increment
          },
          decrement: {
            description: 'Decrement the counter by 1',
            parameters: emptyParamsSchema,
            handler: decrement
          },
          reset: {
            description: 'Reset the counter to 0',
            parameters: emptyParamsSchema,
            handler: reset
          },
          setValue: {
            description: 'Set the counter to a specific value',
            parameters: setValueParamsSchema,
            handler: ({ value }) => setValue(value)
          }
        }
      }
    );
    
    // Register function to add history entries
    bridge.registerFunction(
      'addHistoryEntry',
      'Add an entry to the history log',
      createParametersSchema({
        message: {
          type: 'string',
          description: 'Message to add to the history'
        }
      }),
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
    
    // Setup connection status listener
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
    
    // Connect to the WebSocket with specific connection configuration
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
    
    // Clean up on unmount
    return () => {
      console.log('Cleaning up WebSocket connection...');
      bridge.off('connectionChange', handleConnectionChange);
      bridge.unregisterComponent('main-counter');
      bridge.unregisterFunction('addHistoryEntry');
      
      if (websocketProvider) {
        websocketProvider.disconnect().catch(err => {
          console.error('Error disconnecting WebSocket:', err);
        });
      }
    };
  }, [increment, decrement, reset, setValue]);

  // Effect to update component state when count changes
  useEffect(() => {
    if (bridge) {
      try {
        // Note: We're assuming updateComponentState is a method that may exist elsewhere
        // If this method doesn't exist, this will need to be handled differently
        bridge.updateComponentState?.('main-counter', {
          count
        });
      } catch (error) {
        console.error('Error updating component state:', error);
      }
    }
  }, [count]);

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

export default StandardApp;