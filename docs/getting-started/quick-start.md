# Quick Start Guide

This guide will help you quickly integrate AgentBridge into a React application, enabling AI agents to interact with your UI components and application functions.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A React application (create-react-app or similar)

## Installation

Install the required AgentBridge packages:

```bash
# Core package
npm install @agentbridge/core

# React SDK
npm install @agentbridge/react

# Choose one of the communication providers:
# For Pub/Sub mode with Ably:
npm install @agentbridge/provider-ably ably
# OR for Self-Hosted mode with WebSockets:
npm install @agentbridge/comm-websocket isomorphic-ws
```

## Setting Up AgentBridge

### 1. Create an AgentBridge Instance

First, let's create and configure an AgentBridge instance based on your preferred communication mode.

#### Option A: Pub/Sub Mode (with Ably)

```jsx
// src/agentBridge.js
import { createReactBridge } from '@agentbridge/react';
import { initializeAblyProvider } from '@agentbridge/provider-ably';

// Create a unique ID for your application
const APP_ID = 'my-awesome-app';

// Create the bridge
const bridge = createReactBridge(APP_ID, {
  appName: 'My Awesome App',
  environment: process.env.NODE_ENV,
  // Configure Pub/Sub with Ably
  pubsub: {
    provider: 'ably',
    apiKey: 'YOUR_ABLY_API_KEY' // Get this from your Ably dashboard
  },
  logging: {
    level: 'debug' // Use 'info' or 'error' in production
  }
});

// Initialize the Ably provider
initializeAblyProvider(bridge, {
  appId: APP_ID,
  apiKey: 'YOUR_ABLY_API_KEY'
});

export default bridge;
```

#### Option B: Self-Hosted Mode (with WebSockets)

```jsx
// src/agentBridge.js
import { AgentBridge } from '@agentbridge/core';
import { initializeWebSocketProvider } from '@agentbridge/comm-websocket';

// Create the bridge
const bridge = new AgentBridge({
  communication: {
    mode: 'self-hosted'
  },
  logging: {
    level: 'debug' // Use 'info' or 'error' in production
  }
});

// Initialize the WebSocket provider
initializeWebSocketProvider(bridge, {
  url: 'wss://your-websocket-server.com/agent-bridge', // Your WebSocket server URL
  reconnect: {
    enabled: true
  }
});

export default bridge;
```

### 2. Add the AgentBridge Provider to Your App

Wrap your application with the AgentBridge provider to make it available throughout your component tree:

```jsx
// src/index.js or App.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import bridge from './agentBridge';
import { AgentBridgeProvider } from '@agentbridge/react';

ReactDOM.render(
  <React.StrictMode>
    <AgentBridgeProvider bridge={bridge}>
      <App />
    </AgentBridgeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
```

## Registering UI Components

Now, let's make UI components controllable by AI agents. AgentBridge offers several approaches:

### Approach 1: Using the `useRegisterComponent` Hook

```jsx
// src/components/SubmitButton.jsx
import React, { useState } from 'react';
import { useRegisterComponent } from '@agentbridge/react';
import { z } from 'zod';

const SubmitButton = ({ onSubmit, label = 'Submit' }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onSubmit();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Register this component with AgentBridge
  useRegisterComponent({
    id: 'submit-button',
    description: 'A button to submit the current form',
    componentType: 'button',
    // Define actions the AI can trigger
    actions: {
      click: {
        description: 'Click the submit button',
        handler: async (params, context) => {
          await handleClick();
          return { success: true };
        }
      }
    },
    // Properties the AI can update (optional)
    properties: z.object({
      disabled: z.boolean().optional(),
      label: z.string().optional()
    }),
    // Handler for property updates
    updateHandler: async (properties, context) => {
      // You'd typically update state here
      if (properties.label) {
        // Update label (in a real component, you'd use state)
      }
    },
    // Optional metadata
    tags: ['form', 'button', 'submit'],
    path: '/checkout/form'
  });
  
  return (
    <button
      onClick={handleClick}
      disabled={isLoading || isDisabled}
    >
      {isLoading ? 'Loading...' : label}
    </button>
  );
};

export default SubmitButton;
```

### Approach 2: Using the `AgentBridgeComponent` Wrapper

```jsx
// src/components/TextField.jsx
import React from 'react';
import { AgentBridgeComponent } from '@agentbridge/react';
import { z } from 'zod';

const TextField = ({ id, label, placeholder }) => {
  return (
    <AgentBridgeComponent
      register={{
        id: `input-${id}`,
        description: `Text input field for ${label}`,
        componentType: 'input',
        properties: z.object({
          value: z.string().optional(),
          placeholder: z.string().optional(),
          disabled: z.boolean().optional()
        }),
        tags: ['form', 'input', 'text']
      }}
      initialState={{ value: '', placeholder, disabled: false }}
    >
      {(state, setState) => (
        <div className="form-field">
          <label htmlFor={id}>{label}</label>
          <input
            id={id}
            type="text"
            value={state.value}
            placeholder={state.placeholder}
            disabled={state.disabled}
            onChange={(e) => setState({ ...state, value: e.target.value })}
          />
        </div>
      )}
    </AgentBridgeComponent>
  );
};

export default TextField;
```

### Approach 3: Using the Higher-Order Component

```jsx
// src/components/Checkbox.jsx
import React from 'react';
import { withAgentBridge } from '@agentbridge/react';
import { z } from 'zod';

const Checkbox = ({ id, label, checked, onChange, disabled }) => {
  return (
    <div className="checkbox-field">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};

// Wrap the component with AgentBridge
export default withAgentBridge(Checkbox, {
  id: 'terms-checkbox',
  description: 'Checkbox for accepting terms and conditions',
  componentType: 'checkbox',
  properties: z.object({
    checked: z.boolean(),
    disabled: z.boolean().optional()
  }),
  tags: ['form', 'checkbox', 'terms']
});
```

## Registering Application Functions

You can also expose application-level functions (like API calls or business logic) to AI agents:

```jsx
// src/hooks/useAuthFunctions.js
import { useRegisterFunction } from '@agentbridge/react';
import { z } from 'zod';
import { useAuth } from './useAuth'; // Your auth hook

export function useAuthFunctions() {
  const { login, logout, register } = useAuth();
  
  // Register login function
  useRegisterFunction(
    'login',
    'Authenticate a user with email and password',
    z.object({
      email: z.string().email(),
      password: z.string().min(6)
    }),
    async (params, context) => {
      try {
        const result = await login(params.email, params.password);
        return { success: true, user: result.user };
      } catch (error) {
        return { success: false, message: error.message };
      }
    },
    { authLevel: 'public' }
  );
  
  // Register logout function
  useRegisterFunction(
    'logout',
    'Log out the current user',
    z.object({}),
    async (params, context) => {
      await logout();
      return { success: true };
    },
    { authLevel: 'user' }
  );
  
  // Register user registration function
  useRegisterFunction(
    'register',
    'Register a new user account',
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(1)
    }),
    async (params, context) => {
      try {
        const result = await register(params);
        return { success: true, user: result.user };
      } catch (error) {
        return { success: false, message: error.message };
      }
    },
    { authLevel: 'public' }
  );
}
```

Then use this hook in your app:

```jsx
// src/App.jsx
import React from 'react';
import { useAuthFunctions } from './hooks/useAuthFunctions';

function App() {
  // Register auth functions with AgentBridge
  useAuthFunctions();
  
  return (
    // Your app components
  );
}

export default App;
```

## How AI Agents Interact with Your App

Once your app is properly configured with AgentBridge:

1. **For Pub/Sub Mode:** AI agents can connect to the same Ably channels using your app ID.
2. **For Self-Hosted Mode:** AI agents connect to your WebSocket server.

Agents can then:

1. **Discover Capabilities**: Query available components and functions.
2. **Control UI**: Update component properties and trigger actions.
3. **Call Functions**: Execute registered application functions.

## Next Steps

- [Communication Modes](./communication-modes.md): Learn more about the different communication modes.
- [Pub/Sub Configuration](../core/pubsub-config.md): Detailed configuration for Pub/Sub providers.
- [WebSocket Configuration](../core/websocket-config.md): Detailed configuration for self-hosted WebSockets.
- [Component Registration](../web/component-registration.md): Advanced component registration techniques.
- [Function Registration](../core/function-registration.md): Advanced function registration techniques.
- [React Integration](../web/react.md): In-depth React integration guide.
- [React Native Integration](../mobile/react-native.md): Integrating with React Native applications.
- [Security Best Practices](../advanced/security.md): Securing your AgentBridge implementation.