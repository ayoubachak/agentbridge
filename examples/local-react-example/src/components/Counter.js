import React, { useState, useCallback, useEffect } from 'react';
import { useRegisterComponent } from '@agentbridge/react';

function Counter({ id = 'counter1' }) {
  const [count, setCount] = useState(0);
  
  // Define actions for the counter
  const increment = useCallback(() => {
    setCount(prevCount => prevCount + 1);
    return { success: true, message: 'Counter incremented', newValue: count + 1 };
  }, [count]);
  
  const decrement = useCallback(() => {
    setCount(prevCount => prevCount - 1);
    return { success: true, message: 'Counter decremented', newValue: count - 1 };
  }, [count]);
  
  const reset = useCallback(() => {
    setCount(0);
    return { success: true, message: 'Counter reset', newValue: 0 };
  }, []);
  
  // Get the current parity and sign of the count
  const parity = count % 2 === 0 ? 'even' : 'odd';
  const sign = count > 0 ? 'positive' : count < 0 ? 'negative' : 'zero';
  
  // Register the component with AgentBridge
  const { updateState } = useRegisterComponent({
    id,
    componentType: 'counter',
    name: 'Counter',
    description: 'A simple counter that can be controlled by AI agents',
    properties: {
      count,
      parity,
      sign
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
      }
    }
  });
  
  // Update the state whenever count changes
  useEffect(() => {
    updateState({ count, parity, sign });
  }, [count, parity, sign, updateState]);
  
  return (
    <div className="component-container">
      <h3>Counter Component</h3>
      <div>
        <strong>Count:</strong> {count} ({parity}, {sign})
      </div>
      <div style={{ marginTop: '10px' }}>
        <button onClick={increment}>Increment</button>
        <button onClick={decrement}>Decrement</button>
        <button onClick={reset}>Reset</button>
      </div>
      <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
        <p>This component is registered with AgentBridge and can be controlled by AI agents.</p>
        <p>Component ID: {id}</p>
        <p>Available commands:</p>
        <ul>
          <li>Increment the counter</li>
          <li>Decrement the counter</li>
          <li>Reset the counter to zero</li>
          <li>Get the current count</li>
          <li>Check if the count is even or odd</li>
          <li>Check if the count is positive or negative</li>
        </ul>
      </div>
    </div>
  );
}

export default Counter; 