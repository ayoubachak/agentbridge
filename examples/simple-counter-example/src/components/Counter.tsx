import React, { useState, useCallback } from 'react';
import { useAgentComponent, AgentButton } from '@agentbridge/react';
import './Counter.css';

interface CounterState {
  count: number;
}

function Counter() {
  const [count, setCount] = useState(0);
  
  // Callback functions for the counter
  const increment = useCallback(() => {
    setCount(prevCount => prevCount + 1);
  }, []);
  
  const decrement = useCallback(() => {
    setCount(prevCount => prevCount - 1);
  }, []);
  
  const reset = useCallback(() => {
    setCount(0);
  }, []);
  
  // Register the counter component with AgentBridge
  const counterComponent = useAgentComponent<{}, CounterState>({
    componentId: 'main-counter',
    componentType: 'counter',
    description: 'A counter that can be incremented, decremented, or reset',
    initialState: { count: 0 },
    properties: {
      count: count,
      isPositive: count >= 0,
      isEven: count % 2 === 0
    },
    actions: {
      increment: {
        description: 'Increase the counter by 1',
        parameters: { type: 'object', properties: {} },
        handler: async () => {
          let newCount: number;
          setCount(prevCount => {
            newCount = prevCount + 1;
            return newCount;
          });
          return { success: true, newCount: newCount! };
        }
      },
      decrement: {
        description: 'Decrease the counter by 1',
        parameters: { type: 'object', properties: {} },
        handler: async () => {
          let newCount: number;
          setCount(prevCount => {
            newCount = prevCount - 1;
            return newCount;
          });
          return { success: true, newCount: newCount! };
        }
      },
      reset: {
        description: 'Reset the counter to 0',
        parameters: { type: 'object', properties: {} },
        handler: async () => {
          setCount(0);
          return { success: true, newCount: 0 };
        }
      },
      setTo: {
        description: 'Set the counter to a specific value',
        parameters: {
          type: 'object',
          properties: {
            value: { 
              type: 'number', 
              description: 'The value to set the counter to' 
            }
          },
          required: ['value']
        },
        handler: async (params: { value: number }) => {
          setCount(params.value);
          return { success: true, newCount: params.value };
        }
      }
    },
    onStateChange: (updates) => {
      // Update local state when agent changes it
      if (updates.count !== undefined) {
        setCount(updates.count);
      }
    }
  });
  
  // No need to manually sync count - React manages the state
  // The agent can read the current state through the action handlers
  
  return (
    <div className="counter">
      <h2>Counter</h2>
      <div className="counter-value">
        <span className={count >= 0 ? 'positive' : 'negative'}>
          {count}
        </span>
      </div>
      <div className="counter-info">
        <p>The count is <strong>{count % 2 === 0 ? 'even' : 'odd'}</strong></p>
        <p>The count is <strong>{count >= 0 ? 'positive' : 'negative'}</strong></p>
      </div>
      <div className="counter-controls">
        <AgentButton
          componentId="decrement-button"
          label="-"
          description="Decrement the counter"
          onClick={decrement}
          variant="secondary"
        />
        <AgentButton
          componentId="reset-button"
          label="Reset"
          description="Reset the counter to zero"
          onClick={reset}
          variant="outline"
        />
        <AgentButton
          componentId="increment-button"
          label="+"
          description="Increment the counter"
          onClick={increment}
          variant="primary"
        />
      </div>
      <div className="counter-help">
        <p>This counter is registered with AgentBridge and can be controlled by AI agents.</p>
        <p>Try these commands:</p>
        <ul>
          <li>Increment the counter</li>
          <li>Decrement the counter</li>
          <li>Reset the counter</li>
          <li>Set the counter to 10</li>
        </ul>
      </div>
    </div>
  );
}

export default Counter;
