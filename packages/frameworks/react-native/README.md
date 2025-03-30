# @agentbridge/react-native

React Native SDK for AgentBridge framework to connect your mobile applications with AI agents.

## Installation

```bash
npm install @agentbridge/react-native @agentbridge/core

# You'll also need a communication provider
npm install @agentbridge/provider-ably  # or another provider
```

## Usage

### Setup

Wrap your app with the `AgentBridgeProvider`:

```jsx
import React from 'react';
import { View, Text } from 'react-native';
import { AgentBridgeProvider } from '@agentbridge/react-native';
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

#### 1. Using the HOC (Higher-Order Component)

```jsx
import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { withAgentBridge } from '@agentbridge/react-native';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <View>
      <Text>Count: {count}</Text>
      <Button title="Increment" onPress={() => setCount(count + 1)} />
    </View>
  );
}

// Register with AgentBridge
export default withAgentBridge(Counter, {
  name: 'counter',
  description: 'A simple counter component',
  props: {
    count: 0
  }
});
```

#### 2. Using the Hook

```jsx
import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { useRegisterComponent } from '@agentbridge/react-native';

export default function MessageDisplay() {
  const [message, setMessage] = useState('Hello World');
  
  // Register with AgentBridge
  useRegisterComponent({
    name: 'message-display',
    description: 'A component to display messages',
    props: {
      message,
      setMessage
    },
    component: MessageDisplay
  });
  
  return (
    <View>
      <Text>{message}</Text>
      <Button 
        title="Change Message" 
        onPress={() => setMessage('Updated message!')} 
      />
    </View>
  );
}
```

### Registering Functions

Use the `useRegisterFunction` hook:

```jsx
import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { useRegisterFunction } from '@agentbridge/react-native';

export default function AuthScreen() {
  // Register a login function with AgentBridge
  useRegisterFunction(
    {
      name: 'login',
      description: 'Log in a user',
      parameters: {
        username: {
          type: 'string',
          description: 'Username to log in with'
        },
        password: {
          type: 'string',
          description: 'Password for authentication'
        }
      },
      returnType: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' }
        }
      }
    },
    async ({ username, password }) => {
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
  );
  
  return (
    <View>
      <Text>Auth Screen</Text>
      <Button 
        title="Local Login" 
        onPress={() => Alert.alert('Local login pressed')} 
      />
    </View>
  );
}
```

### Accessing the Bridge Directly

Use the `useAgentBridge` hook to access the bridge instance:

```jsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAgentBridge } from '@agentbridge/react-native';

export default function BridgeStatus() {
  const { bridge, isConnected } = useAgentBridge();
  
  return (
    <View>
      <Text>Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</Text>
      <Button 
        title={isConnected ? 'Disconnect' : 'Connect'} 
        onPress={() => {
          if (isConnected) {
            bridge.disconnect();
          } else {
            bridge.connect();
          }
        }}
      />
    </View>
  );
}
```

## API Reference

### Provider

- `AgentBridgeProvider` - React Context provider component

### Hooks

- `useAgentBridge()` - Access the bridge instance and connection status
- `useRegisterComponent(component)` - Register a component with AgentBridge
- `useRegisterFunction(definition, implementation)` - Register a function with AgentBridge

### HOCs

- `withAgentBridge(Component, options)` - HOC to register a component with AgentBridge

## License

MIT 