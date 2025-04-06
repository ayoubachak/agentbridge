# AgentBridge React SDK

A React SDK for the AgentBridge framework, allowing you to create AI-controllable components in your React applications.

## Installation

Install the React SDK along with the core package:

```bash
npm install @agentbridge/core @agentbridge/react
```

## Usage

### Basic Setup

Wrap your application with the `AgentBridgeProvider`:

```jsx
import { AgentBridgeProvider } from '@agentbridge/react';
import { createAgentBridge } from '@agentbridge/core';

// Create an AgentBridge instance
const bridge = createAgentBridge();

function App() {
  return (
    <AgentBridgeProvider bridge={bridge}>
      {/* Your application components */}
    </AgentBridgeProvider>
  );
}
```

### Creating AI-Controllable Components

You can make your components controllable by AI agents using the provided hooks:

```jsx
import { useRegisterComponent } from '@agentbridge/react';

function Counter() {
  const [count, setCount] = useState(0);
  
  // Register this component with AgentBridge
  useRegisterComponent({
    id: 'main-counter',
    componentType: 'counter',
    description: 'A counter component that can be incremented or decremented',
    properties: {
      count,
      isPositive: count >= 0
    },
    actions: {
      increment: {
        description: 'Increment the counter by 1',
        handler: () => setCount(prev => prev + 1)
      },
      decrement: {
        description: 'Decrement the counter by 1',
        handler: () => setCount(prev => prev - 1)
      },
      reset: {
        description: 'Reset the counter to 0',
        handler: () => setCount(0)
      }
    }
  });
  
  return (
    <div>
      <h2>Counter: {count}</h2>
      <button onClick={() => setCount(prev => prev - 1)}>-</button>
      <button onClick={() => setCount(0)}>Reset</button>
      <button onClick={() => setCount(prev => prev + 1)}>+</button>
    </div>
  );
}
```

### Exposing Functions to AI Agents

You can expose functions that AI agents can call:

```jsx
import { useAgentFunction } from '@agentbridge/react';

function MessageComponent() {
  const [messages, setMessages] = useState([]);
  
  // Register a function that AI agents can call
  useAgentFunction({
    name: 'sendMessage',
    description: 'Send a message to the user',
    parameters: {
      message: {
        type: 'string',
        description: 'The message to send'
      }
    }
  }, async ({ message }) => {
    setMessages(prev => [...prev, message]);
    return { success: true };
  });
  
  return (
    <div>
      <h2>Messages</h2>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Pre-Built Components

The SDK includes pre-built components that can be directly controlled by AI agents:

```jsx
import { AgentButton, AgentInput, AgentSelect } from '@agentbridge/react';

function FormComponent() {
  return (
    <form>
      <AgentInput 
        agentId="name-input" 
        placeholder="Enter your name" 
      />
      
      <AgentSelect agentId="color-select">
        <option value="red">Red</option>
        <option value="blue">Blue</option>
        <option value="green">Green</option>
      </AgentSelect>
      
      <AgentButton 
        agentId="submit-button"
        onClick={() => console.log('Submitted!')}
      >
        Submit
      </AgentButton>
    </form>
  );
}
```

## Migration Guide from v0.1.x to v0.2.0

### Breaking Changes

Version 0.2.0 includes several important improvements to fix React hook-related issues and improve overall stability:

1. **Hook API Changes**:
   - `useAgentFunction` now takes an options object instead of separate parameters
   - All hooks now handle null context values gracefully

2. **React Version Requirements**:
   - React 17.0.0 or higher is required
   - React DOM is now a peer dependency

### How to Migrate

#### Update Dependency

Update to the latest version:

```bash
npm install @agentbridge/react@latest @agentbridge/core@latest
```

#### Update Hook Usage

**Before (v0.1.x)**:
```jsx
useAgentFunction(
  'functionName',
  'Function description',
  async (params) => {
    // Function logic
  },
  {
    tags: ['tag1', 'tag2']
  }
);
```

**After (v0.2.0)**:
```jsx
useAgentFunction(
  {
    name: 'functionName',
    description: 'Function description',
    tags: ['tag1', 'tag2']
  },
  async (params) => {
    // Function logic  
  }
);
```

#### Ensuring Proper React Context

Make sure your app uses a consistent version of React by adding resolutions (for yarn) or overrides (for npm) to your package.json:

```json
{
  "resolutions": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

## License

MIT 