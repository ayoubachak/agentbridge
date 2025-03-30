# React SDK Overview

The AgentBridge React SDK provides hooks, components, and utilities that make it easy to integrate the AgentBridge framework with React applications. This SDK is designed to work seamlessly with your existing React codebase.

## Features

- **React Components**: Ready-to-use React components that can be controlled by AI agents
- **Hooks API**: React hooks for component registration and function management
- **Context Provider**: React context provider for easy access to AgentBridge functionality
- **HOCs**: Higher-order components for component registration
- **TypeScript Support**: Full TypeScript support with type definitions
- **State Synchronization**: Automatic synchronization of component state

## Installation

Install the AgentBridge React SDK and core package:

```bash
npm install @agentbridge/core @agentbridge/react
```

Also install one of the communication providers:

```bash
# If using Ably
npm install @agentbridge/provider-ably

# If using Firebase
npm install @agentbridge/provider-firebase

# If using Pusher
npm install @agentbridge/provider-pusher

# If using Supabase
npm install @agentbridge/provider-supabase
```

## Basic Setup

To get started with AgentBridge in your React application, wrap your app with the `AgentBridgeProvider`:

```jsx
import React from 'react';
import { AgentBridgeProvider } from '@agentbridge/react';
import { AblyProvider } from '@agentbridge/provider-ably';

// Create a communication provider
const ablyProvider = new AblyProvider({
  apiKey: 'your-ably-api-key',
});

function App() {
  return (
    <AgentBridgeProvider 
      applicationId="your-app-id"
      communicationProvider={ablyProvider}
    >
      {/* Your app components */}
      <YourComponents />
    </AgentBridgeProvider>
  );
}

export default App;
```

## Using AgentBridge Components

The React SDK provides several pre-built components that can be controlled by AI agents:

```jsx
import React, { useState } from 'react';
import { 
  AgentButton, 
  AgentTextField, 
  AgentSwitch 
} from '@agentbridge/react';

function MyForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subscribe, setSubscribe] = useState(false);
  
  const handleSubmit = () => {
    console.log({ name, email, subscribe });
    // Handle form submission
  };
  
  return (
    <div>
      <h2>Contact Form</h2>
      
      <AgentTextField 
        id="name-input"
        label="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      
      <AgentTextField 
        id="email-input"
        label="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
      />
      
      <AgentSwitch 
        id="subscribe-switch"
        label="Subscribe to newsletter"
        checked={subscribe}
        onChange={(checked) => setSubscribe(checked)}
      />
      
      <AgentButton 
        id="submit-button"
        label="Submit"
        onClick={handleSubmit}
      />
    </div>
  );
}
```

## Registering Custom Components

You can register your own React components to be controlled by AI agents:

### Using the useAgentComponent Hook

```jsx
import React, { useState } from 'react';
import { useAgentComponent } from '@agentbridge/react';

function CustomCard({ id, title, description, onAction }) {
  const [expanded, setExpanded] = useState(false);
  
  // Register this component with AgentBridge
  useAgentComponent(id, {
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

### Using the withAgentComponent HOC

```jsx
import React, { useState } from 'react';
import { withAgentComponent } from '@agentbridge/react';

function CustomCard({ 
  title, 
  description, 
  onAction, 
  registerAgentAction 
}) {
  const [expanded, setExpanded] = useState(false);
  
  // Register actions with the HOC
  React.useEffect(() => {
    registerAgentAction('expand', () => {
      setExpanded(true);
      return true;
    });
    
    registerAgentAction('collapse', () => {
      setExpanded(false);
      return true;
    });
    
    registerAgentAction('trigger', () => {
      if (onAction) onAction();
      return true;
    });
  }, [onAction, registerAgentAction]);
  
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

// Wrap with the HOC
export default withAgentComponent(CustomCard, {
  getAgentProperties: (props, state) => ({
    title: props.title,
    description: props.description,
    expanded: state.expanded,
  })
});
```

## Registering Functions

You can register functions that AI agents can call:

```jsx
import React from 'react';
import { useAgentBridge } from '@agentbridge/react';

function FunctionDemo() {
  const { registerFunction } = useAgentBridge();
  
  React.useEffect(() => {
    // Register a function with AgentBridge
    registerFunction({
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
  }, [registerFunction]);
  
  return (
    <div>
      <h2>Weather Function Registered</h2>
      <p>The AI agent can now call the getWeather function.</p>
    </div>
  );
}
```

## Using the AgentBridge Context

The `useAgentBridge` hook provides access to the AgentBridge context:

```jsx
import React from 'react';
import { useAgentBridge } from '@agentbridge/react';

function BridgeStatus() {
  const { 
    isConnected, 
    connectionStatus, 
    componentCount,
    functionCount,
    applicationId
  } = useAgentBridge();
  
  return (
    <div>
      <h2>AgentBridge Status</h2>
      <ul>
        <li>Connected: {isConnected ? 'Yes' : 'No'}</li>
        <li>Status: {connectionStatus}</li>
        <li>Components: {componentCount}</li>
        <li>Functions: {functionCount}</li>
        <li>App ID: {applicationId}</li>
      </ul>
    </div>
  );
}
```

## Advanced Usage

### Custom Communication Provider

You can implement a custom communication provider by implementing the `CommunicationProvider` interface:

```jsx
import { CommunicationProvider } from '@agentbridge/core';

class CustomProvider implements CommunicationProvider {
  // Implement required methods
  // ...
}

// Then use it with the provider
const customProvider = new CustomProvider();

<AgentBridgeProvider
  communicationProvider={customProvider}
>
  {/* ... */}
</AgentBridgeProvider>
```

### Component Composition

You can compose multiple agent-aware components together:

```jsx
import React from 'react';
import { AgentButton, AgentTextField } from '@agentbridge/react';
import CustomCard from './CustomCard';

function CompositePage() {
  return (
    <div>
      <h1>My Dashboard</h1>
      
      <CustomCard
        id="welcome-card"
        title="Welcome to AgentBridge"
        description="This card can be controlled by AI agents."
        onAction={() => console.log('Card action triggered')}
      />
      
      <div>
        <AgentTextField
          id="search-input"
          label="Search"
          placeholder="Search items..."
        />
        
        <AgentButton
          id="search-button"
          label="Search"
          onClick={() => console.log('Search clicked')}
        />
      </div>
    </div>
  );
}
```

## Next Steps

- See the [Components](components.md) documentation for detailed component API reference
- Learn more about [Hooks](hooks.md) provided by the React SDK
- Explore the [Core API](../../core/api-reference.md)
