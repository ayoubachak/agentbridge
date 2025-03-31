# React Hooks

The AgentBridge React SDK provides a set of hooks that make it easy to integrate with the AgentBridge framework. These hooks follow React best practices and provide a simple, declarative way to use AgentBridge functionality.

## Core Hooks

### useAgentBridge

The primary hook for accessing the AgentBridge instance and its capabilities.

```jsx
import { useAgentBridge } from '@agentbridge/react';

function MyComponent() {
  const {
    // Bridge status
    isConnected,
    connectionStatus,
    
    // Core methods
    registerFunction,
    unregisterFunction,
    callFunction,
    
    // Component methods
    registerComponent,
    unregisterComponent,
    updateComponentState,
    
    // Statistics
    componentCount,
    functionCount,
    
    // Metadata
    applicationId,
    environmentId
  } = useAgentBridge();
  
  // Use these methods and properties in your component
  return (
    <div>
      <h2>AgentBridge Status</h2>
      <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
      <div>Status: {connectionStatus}</div>
    </div>
  );
}
```

### useAgentFunction

A hook for registering a function with AgentBridge.

```jsx
import { useAgentFunction } from '@agentbridge/react';

function WeatherFunction() {
  // Register a function
  useAgentFunction({
    name: 'getWeather',
    description: 'Get weather information for a location',
    parameters: {
      type: 'object',
      properties: {
        location: { type: 'string' },
        units: { type: 'string', enum: ['metric', 'imperial'] }
      },
      required: ['location']
    },
    handler: async (params) => {
      const { location, units = 'metric' } = params;
      
      // Implementation (replace with actual API call)
      console.log(`Getting weather for ${location} in ${units}`);
      
      return {
        location,
        temperature: 22,
        conditions: 'sunny',
        humidity: 45,
        units
      };
    }
  });
  
  return (
    <div>
      <h2>Weather Function Registered</h2>
      <p>The AI agent can now call the getWeather function.</p>
    </div>
  );
}
```

### useRegisterComponent

A hook for registering a component with AgentBridge. This hook makes it easy to register your component with the AgentBridge framework, making it accessible to AI agents.

```jsx
import React, { useState, useEffect } from 'react';
import { useRegisterComponent } from '@agentbridge/react';

function Counter() {
  const [count, setCount] = useState(0);
  
  // Register this component with AgentBridge
  const { updateState } = useRegisterComponent({
    id: 'main-counter',
    componentType: 'counter',
    name: 'Main Counter',
    description: 'A counter component that can be incremented or decremented',
    properties: {
      count,
      isEven: count % 2 === 0,
      isPositive: count > 0
    },
    actions: {
      increment: {
        description: 'Increase the counter by 1',
        handler: () => {
          setCount(prev => prev + 1);
          return { success: true, message: 'Counter incremented', newValue: count + 1 };
        }
      },
      decrement: {
        description: 'Decrease the counter by 1',
        handler: () => {
          setCount(prev => prev - 1);
          return { success: true, message: 'Counter decremented', newValue: count - 1 };
        }
      },
      reset: {
        description: 'Reset the counter to 0',
        handler: () => {
          setCount(0);
          return { success: true, message: 'Counter reset', newValue: 0 };
        }
      }
    }
  });
  
  // Update the component state whenever count changes
  useEffect(() => {
    updateState({ 
      count, 
      isEven: count % 2 === 0,
      isPositive: count > 0 
    });
  }, [count, updateState]);
  
  return (
    <div className="counter">
      <h2>Count: {count}</h2>
      <div>
        <button onClick={() => setCount(prev => prev + 1)}>Increment</button>
        <button onClick={() => setCount(prev => prev - 1)}>Decrement</button>
        <button onClick={() => setCount(0)}>Reset</button>
      </div>
      <div>
        <p>This counter is {count % 2 === 0 ? 'even' : 'odd'} and {count > 0 ? 'positive' : count < 0 ? 'negative' : 'zero'}.</p>
      </div>
    </div>
  );
}
```

### useAgentComponent

A hook for registering a custom component with AgentBridge.

```jsx
import React, { useState } from 'react';
import { useAgentComponent } from '@agentbridge/react';

function CustomCard({ id, title, description, onAction }) {
  const [expanded, setExpanded] = useState(false);
  
  // Register this component with AgentBridge
  useAgentComponent(id, {
    // Define the component type
    type: 'card',
    
    // Define the component properties that agents can access
    properties: {
      title,
      description,
      expanded,
    },
    
    // Define actions that agents can perform
    actions: {
      expand: () => {
        setExpanded(true);
        return true;
      },
      collapse: () => {
        setExpanded(false);
        return true;
      },
      trigger: () => {
        if (onAction) onAction();
        return true;
      }
    }
  });
  
  return (
    <div className="custom-card">
      <h3>{title}</h3>
      {expanded && <p>{description}</p>}
      <button onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Collapse' : 'Expand'}
      </button>
      {onAction && (
        <button onClick={onAction}>
          Trigger Action
        </button>
      )}
    </div>
  );
}
```

### useAgentComponentState

A hook for tracking and updating component state with AgentBridge.

```jsx
import React from 'react';
import { useAgentComponentState } from '@agentbridge/react';

function Counter({ id }) {
  // Create agent-aware state
  const [count, setCount] = useAgentComponentState(id, 'count', 0);
  
  return (
    <div>
      <h2>Counter: {count}</h2>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
    </div>
  );
}
```

## Advanced Hooks

### useAgentComponentEffect

A hook for running effects when a component is registered or updated.

```jsx
import React, { useState } from 'react';
import { useAgentComponent, useAgentComponentEffect } from '@agentbridge/react';

function StatusMonitor({ id }) {
  const [status, setStatus] = useState('idle');
  const [logs, setLogs] = useState([]);
  
  // Register the component
  useAgentComponent(id, {
    type: 'monitor',
    properties: { status, logCount: logs.length },
    actions: {
      clearLogs: () => {
        setLogs([]);
        return true;
      },
      setStatus: (newStatus) => {
        setStatus(newStatus);
        return true;
      }
    }
  });
  
  // Run an effect when the component is updated
  useAgentComponentEffect(id, () => {
    // Add a log entry when status changes
    if (status !== 'idle') {
      const newLog = {
        timestamp: new Date().toISOString(),
        event: `Status changed to ${status}`
      };
      setLogs(prev => [...prev, newLog]);
    }
    
    // Cleanup function
    return () => {
      console.log('Component cleanup');
    };
  }, [status]);
  
  return (
    <div>
      <h2>Status: {status}</h2>
      <div>
        <h3>Logs ({logs.length})</h3>
        <ul>
          {logs.map((log, index) => (
            <li key={index}>
              {log.timestamp}: {log.event}
            </li>
          ))}
        </ul>
        <button onClick={() => setLogs([])}>
          Clear Logs
        </button>
      </div>
    </div>
  );
}
```

### useAgentFunctionCall

A hook for calling functions registered with AgentBridge.

```jsx
import React, { useState } from 'react';
import { useAgentFunctionCall } from '@agentbridge/react';

function WeatherDisplay() {
  const [location, setLocation] = useState('London');
  const [units, setUnits] = useState('metric');
  
  // Use the hook to call a function
  const { 
    data, 
    loading, 
    error, 
    call: getWeather 
  } = useAgentFunctionCall('getWeather');
  
  const handleGetWeather = () => {
    getWeather({ location, units });
  };
  
  return (
    <div>
      <div>
        <input 
          value={location} 
          onChange={(e) => setLocation(e.target.value)} 
          placeholder="Location"
        />
        <select 
          value={units} 
          onChange={(e) => setUnits(e.target.value)}
        >
          <option value="metric">Celsius</option>
          <option value="imperial">Fahrenheit</option>
        </select>
        <button onClick={handleGetWeather} disabled={loading}>
          {loading ? 'Loading...' : 'Get Weather'}
        </button>
      </div>
      
      {error && (
        <div className="error">
          Error: {error.message}
        </div>
      )}
      
      {data && (
        <div className="weather-data">
          <h3>Weather for {data.location}</h3>
          <div>Temperature: {data.temperature}°{units === 'metric' ? 'C' : 'F'}</div>
          <div>Conditions: {data.conditions}</div>
          <div>Humidity: {data.humidity}%</div>
        </div>
      )}
    </div>
  );
}
```

### useAgentComponentQuery

A hook for querying registered components.

```jsx
import React from 'react';
import { useAgentComponentQuery } from '@agentbridge/react';

function ComponentExplorer() {
  // Get all button components
  const buttonComponents = useAgentComponentQuery({ type: 'button' });
  
  // Get all components with a specific tag
  const navigationComponents = useAgentComponentQuery({ tags: ['navigation'] });
  
  return (
    <div>
      <h2>Button Components</h2>
      <ul>
        {buttonComponents.map(component => (
          <li key={component.id}>
            {component.id}: {component.properties.label || 'Unlabeled'}
          </li>
        ))}
      </ul>
      
      <h2>Navigation Components</h2>
      <ul>
        {navigationComponents.map(component => (
          <li key={component.id}>
            {component.id} ({component.type})
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Combining Hooks

Hooks can be combined for more complex scenarios:

```jsx
import React, { useState } from 'react';
import { 
  useAgentBridge, 
  useAgentComponent, 
  useAgentFunction 
} from '@agentbridge/react';

function TodoManager({ id }) {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const { componentCount } = useAgentBridge();
  
  // Register the component
  useAgentComponent(id, {
    type: 'todo-manager',
    properties: {
      todoCount: todos.length,
      todos: todos.map(todo => ({ text: todo.text, completed: todo.completed }))
    },
    actions: {
      addTodo: (text) => {
        if (text) {
          setTodos(prev => [...prev, { text, completed: false }]);
          setNewTodo('');
          return true;
        }
        return false;
      },
      clearCompleted: () => {
        setTodos(prev => prev.filter(todo => !todo.completed));
        return true;
      },
      toggleTodo: (index) => {
        if (index >= 0 && index < todos.length) {
          setTodos(prev => prev.map((todo, i) => 
            i === index ? { ...todo, completed: !todo.completed } : todo
          ));
          return true;
        }
        return false;
      }
    }
  });
  
  // Register a function
  useAgentFunction({
    name: 'getTodoStats',
    description: 'Get statistics about todos',
    parameters: {},
    handler: async () => {
      const completed = todos.filter(todo => todo.completed).length;
      const total = todos.length;
      
      return {
        total,
        completed,
        remaining: total - completed,
        percentComplete: total > 0 ? (completed / total) * 100 : 0
      };
    }
  });
  
  return (
    <div className="todo-manager">
      <h2>Todo Manager</h2>
      <p>Total Registered Components: {componentCount}</p>
      
      <div className="add-todo">
        <input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo"
          onKeyPress={(e) => {
            if (e.key === 'Enter' && newTodo) {
              setTodos(prev => [...prev, { text: newTodo, completed: false }]);
              setNewTodo('');
            }
          }}
        />
        <button 
          onClick={() => {
            if (newTodo) {
              setTodos(prev => [...prev, { text: newTodo, completed: false }]);
              setNewTodo('');
            }
          }}
        >
          Add
        </button>
      </div>
      
      <ul className="todo-list">
        {todos.map((todo, index) => (
          <li key={index} className={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => {
                setTodos(prev => prev.map((t, i) => 
                  i === index ? { ...t, completed: !t.completed } : t
                ));
              }}
            />
            <span>{todo.text}</span>
          </li>
        ))}
      </ul>
      
      {todos.some(todo => todo.completed) && (
        <button 
          onClick={() => setTodos(prev => prev.filter(todo => !todo.completed))}
        >
          Clear Completed
        </button>
      )}
    </div>
  );
}
```

## Best Practices

1. **Dependency arrays**: Make sure to include all dependencies in useEffect hooks to prevent stale closures
2. **Unique IDs**: Always use unique IDs for components
3. **Cleanup on unmount**: Register cleanup functions when using useAgentComponent
4. **Consistent naming**: Use consistent naming across your components and functions
5. **Type safety**: Use TypeScript interfaces for better type checking

## Next Steps

- See the [Components](components.md) documentation for detailed component API reference
- Explore the [Core API](../../core/api-reference.md) for more information on the underlying functionality
