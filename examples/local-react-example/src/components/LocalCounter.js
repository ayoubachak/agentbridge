import React, { useState, useCallback } from 'react';
import { useRegisterComponent } from '../LocalBridge';

function LocalCounter({ id = "counter-1" }) {
  const [count, setCount] = useState(0);
  
  // Callbacks for counter operations
  const increment = useCallback(() => {
    setCount(prevCount => prevCount + 1);
  }, []);
  
  const decrement = useCallback(() => {
    setCount(prevCount => prevCount - 1);
  }, []);
  
  const reset = useCallback(() => {
    setCount(0);
  }, []);
  
  const setTo = useCallback((value) => {
    setCount(parseInt(value, 10));
  }, []);
  
  // Register this component with AgentBridge
  useRegisterComponent({
    id,
    componentType: 'counter',
    name: `Counter ${id}`,
    description: 'A counter component that can be incremented, decremented, or reset',
    properties: {
      count,
      isPositive: count >= 0,
      isEven: count % 2 === 0
    },
    actions: {
      increment: {
        description: 'Increment the counter by 1',
        handler: increment
      },
      decrement: {
        description: 'Decrement the counter by 1',
        handler: decrement
      },
      reset: {
        description: 'Reset the counter to 0',
        handler: reset
      },
      setTo: {
        description: 'Set the counter to a specific value',
        parameters: {
          value: {
            type: 'number',
            description: 'The value to set the counter to'
          }
        },
        handler: ({ value }) => setTo(value)
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
      <div className="counter-buttons">
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

export default LocalCounter; 