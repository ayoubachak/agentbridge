import React, { useState, useCallback } from 'react';
import { useRegisterComponent } from '@agentbridge/react';
import './Counter.css';

function Counter({ onCountChange }) {
  const [count, setCount] = useState(0);
  
  // Callback functions for the counter
  const increment = useCallback(() => {
    setCount(prevCount => {
      const newCount = prevCount + 1;
      onCountChange && onCountChange('Incremented', newCount);
      return newCount;
    });
  }, [onCountChange]);
  
  const decrement = useCallback(() => {
    setCount(prevCount => {
      const newCount = prevCount - 1;
      onCountChange && onCountChange('Decremented', newCount);
      return newCount;
    });
  }, [onCountChange]);
  
  const reset = useCallback(() => {
    setCount(0);
    onCountChange && onCountChange('Reset', 0);
  }, [onCountChange]);
  
  // Register the counter component for AI control
  useRegisterComponent({
    // Unique identifier for this component
    id: 'main-counter',
    
    // Type of component
    type: 'counter',
    
    // Display name for the component
    name: 'Main Counter',
    
    // Description of what this component does
    description: 'A counter that can be incremented, decremented, or reset',
    
    // Current properties/state of the component
    properties: {
      count: count,
      isPositive: count >= 0,
      isEven: count % 2 === 0
    },
    
    // Actions that can be performed on this component
    actions: {
      increment: {
        description: 'Increase the counter by 1',
        handler: increment
      },
      decrement: {
        description: 'Decrease the counter by 1',
        handler: decrement
      },
      reset: {
        description: 'Reset the counter to 0',
        handler: reset
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
        handler: ({ value }) => {
          setCount(value);
          onCountChange && onCountChange('Set to', value);
        }
      }
    }
  });
  
  return (
    <div className="counter">
      <h2>Counter</h2>
      <div className="counter-value">
        <span className={count >= 0 ? 'positive' : 'negative'}>
          {count}
        </span>
      </div>
      <div className="counter-info">
        <p>The count is {count % 2 === 0 ? 'even' : 'odd'}</p>
        <p>The count is {count >= 0 ? 'positive' : 'negative'}</p>
      </div>
      <div className="counter-controls">
        <button onClick={decrement}>-</button>
        <button onClick={reset}>Reset</button>
        <button onClick={increment}>+</button>
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