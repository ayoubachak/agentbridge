# React SDK for AgentBridge

The React SDK for AgentBridge makes it easy to integrate your React web applications with AI agents. This SDK provides hooks, components, and utilities to register functions and UI components with AgentBridge, making them accessible to AI agents.

## Hooks

The React SDK provides several hooks for interacting with AgentBridge:

### useRegisterComponent

A modern hook for registering a component with AgentBridge. This hook provides a clean, declarative way to expose your components to AI agents.

```jsx
import { useRegisterComponent } from '@agentbridge/react';

function Counter() {
  const [count, setCount] = useState(0);
  
  const updateState = useRegisterComponent({
    id: 'counter-1',
    componentType: 'counter',
    name: 'Counter Component',
    description: 'A counter that can be incremented or decremented',
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
          return true;
        }
      },
      decrement: {
        description: 'Decrease the counter by 1',
        handler: () => {
          setCount(prev => prev - 1);
          return true;
        }
      },
      reset: {
        description: 'Reset the counter to 0',
        handler: () => {
          setCount(0);
          return true;
        }
      }
    }
  });
  
  // The component's UI
  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
    </div>
  );
}
```

### useAgentFunction

A hook for registering a function with AgentBridge:

```jsx
import { useAgentFunction } from '@agentbridge/react';

function WeatherWidget() {
  useAgentFunction(
    'getWeather',
    'Get weather information for a location',
    async (params, context) => {
      const { location } = params;
      // Fetch weather data from an API
      return { temperature: 72, conditions: 'sunny' };
    },
    {
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string' }
        },
        required: ['location']
      },
      tags: ['weather', 'data']
    }
  );
  
  return <div>Weather function registered!</div>;
}
```

### useAgentBridge

Access the AgentBridge instance and connection status:

```jsx
import { useAgentBridge } from '@agentbridge/react';

function ConnectionStatus() {
  const { isConnected, bridge } = useAgentBridge();
  
  return (
    <div>
      <h2>Connection Status</h2>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={() => isConnected ? bridge.disconnect() : bridge.connect()}>
        {isConnected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  );
}
```

## Components

The React SDK provides pre-built components that are ready to be used with AgentBridge:

- `AgentButton`: A button that can be controlled by AI agents
- `AgentInput`: An input field that can be controlled by AI agents
- `AgentSelect`: A select dropdown that can be controlled by AI agents
- `AgentContainer`: A container for other components

```jsx
import { AgentButton, AgentInput } from '@agentbridge/react';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  return (
    <div>
      <AgentInput
        agentId="username-input"
        agentType="text-input"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      
      <AgentInput
        agentId="password-input"
        agentType="password-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      
      <AgentButton
        agentId="login-button"
        agentType="submit-button"
        onClick={() => console.log('Login clicked')}
      >
        Login
      </AgentButton>
    </div>
  );
}
```

## Provider

Wrap your application with the `AgentBridgeProvider` to connect to the AgentBridge framework:

```jsx
import { AgentBridgeProvider } from '@agentbridge/react';
import { AblyProvider } from '@agentbridge/provider-ably';

function App() {
  const ablyProvider = new AblyProvider({
    apiKey: 'your-ably-api-key'
  });
  
  return (
    <AgentBridgeProvider communicationProvider={ablyProvider}>
      <YourApplication />
    </AgentBridgeProvider>
  );
}
```

## Learn More

For more detailed information, see:

- [Hooks Reference](hooks.md)
- [Components Reference](components.md)
- [Getting Started Guide](getting-started.md) 