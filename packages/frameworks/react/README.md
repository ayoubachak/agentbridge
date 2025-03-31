# @agentbridge/react

React SDK for AgentBridge framework to connect your web applications with AI agents.

## Installation

```bash
npm install @agentbridge/react @agentbridge/core

# You'll also need a communication provider
npm install @agentbridge/provider-ably  # or another provider
```

## Usage

### Setup

Wrap your app with the `AgentBridgeProvider`:

```jsx
import React from 'react';
import { AgentBridgeProvider } from '@agentbridge/react';
import { AblyProvider } from '@agentbridge/provider-ably';

// Initialize a communication provider
const ablyProvider = new AblyProvider({
  apiKey: 'your-ably-api-key'
});

export default function App() {
  return (
    <AgentBridgeProvider communicationProvider={ablyProvider} debug={true}>
      <YourApp />
    </AgentBridgeProvider>
  );
}
```

### Registering Components

There are multiple ways to register components:

#### 1. Using the `useRegisterComponent` Hook

```jsx
import React, { useState } from 'react';
import { useRegisterComponent } from '@agentbridge/react';

function Counter() {
  const [count, setCount] = useState(0);
  
  // Register with AgentBridge
  const updateState = useRegisterComponent({
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
      increment: () => {
        setCount(prev => prev + 1);
        return true;
      },
      decrement: () => {
        setCount(prev => prev - 1);
        return true;
      },
      reset: () => {
        setCount(0);
        return true;
      }
    }
  });
  
  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

#### 2. Using the Legacy `useAgentComponent` Hook

```jsx
import React, { useState } from 'react';
import { useAgentComponent } from '@agentbridge/react';

export default function MessageDisplay() {
  const [message, setMessage] = useState('Hello World');
  
  // Register with AgentBridge
  useAgentComponent('message-display', {
    type: 'message',
    properties: {
      message,
      length: message.length
    },
    actions: {
      setMessage: (newMessage) => {
        setMessage(newMessage);
        return true;
      },
      clear: () => {
        setMessage('');
        return true;
      }
    }
  });
  
  return (
    <div>
      <p>{message}</p>
      <button onClick={() => setMessage('Updated message!')}>
        Change Message
      </button>
    </div>
  );
}
```

### Registering Functions

Use the `useAgentFunction` hook:

```jsx
import React from 'react';
import { useAgentFunction } from '@agentbridge/react';

export default function AuthModule() {
  // Register a login function with AgentBridge
  useAgentFunction({
    name: 'login',
    description: 'Log in a user',
    parameters: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        password: { type: 'string' }
      },
      required: ['username', 'password']
    },
    handler: async (params) => {
      const { username, password } = params;
      
      try {
        // In a real app, call your authentication API here
        if (username && password) {
          return { success: true, message: 'Login successful' };
        }
        return { success: false, message: 'Invalid credentials' };
      } catch (error) {
        return { success: false, message: error.message };
      }
    }
  });
  
  return (
    <div>
      <h2>Auth Module</h2>
      <p>The AI agent can now authenticate users through the login function.</p>
    </div>
  );
}
```

### Calling Functions

Use the `useAgentFunctionCall` hook:

```jsx
import React, { useState } from 'react';
import { useAgentFunctionCall } from '@agentbridge/react';

export default function WeatherWidget() {
  const [location, setLocation] = useState('New York');
  
  // Set up the function call
  const { 
    data: weatherData, 
    loading, 
    error, 
    call: fetchWeather 
  } = useAgentFunctionCall('getWeather');
  
  const handleGetWeather = () => {
    fetchWeather({ location });
  };
  
  return (
    <div>
      <h2>Weather Widget</h2>
      <input 
        value={location} 
        onChange={(e) => setLocation(e.target.value)} 
        placeholder="Enter location" 
      />
      <button onClick={handleGetWeather} disabled={loading}>
        {loading ? 'Loading...' : 'Get Weather'}
      </button>
      
      {error && <p className="error">Error: {error.message}</p>}
      
      {weatherData && (
        <div className="weather-data">
          <h3>{weatherData.location}</h3>
          <p>Temperature: {weatherData.temperature}°C</p>
          <p>Conditions: {weatherData.conditions}</p>
        </div>
      )}
    </div>
  );
}
```

### Accessing the Bridge Directly

Use the `useAgentBridge` hook to access the bridge instance:

```jsx
import React from 'react';
import { useAgentBridge } from '@agentbridge/react';

export default function BridgeStatus() {
  const { bridge, isConnected, connectionStatus } = useAgentBridge();
  
  return (
    <div>
      <h2>Bridge Status</h2>
      <p>Connection: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <p>Status: {connectionStatus}</p>
      <button 
        onClick={() => {
          if (isConnected) {
            bridge.disconnect();
          } else {
            bridge.connect();
          }
        }}
      >
        {isConnected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  );
}
```

## API Reference

### Provider

- `AgentBridgeProvider` - React Context provider component

### Hooks

- `useAgentBridge()` - Access the bridge instance and connection status
- `useRegisterComponent(definition)` - Register a component with AgentBridge (recommended)
- `useAgentComponent(id, options)` - Legacy hook to register a component
- `useAgentFunction(options)` - Register a function with AgentBridge
- `useAgentFunctionCall(functionName)` - Call a function registered with AgentBridge

## License

MIT 