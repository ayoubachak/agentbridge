# AgentBridge React Example

This is a simple React example showing how to use the AgentBridge SDK to make your components controllable by AI agents.

## Overview

This example demonstrates:

1. Creating AI-controllable components with the AgentBridge SDK
2. Registering functions that AI agents can call
3. Connecting to AI agents using WebSockets
4. Tracking events and interactions between the app and AI agents

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher

### Installation

1. Clone the repository and navigate to this directory:
   ```bash
   git clone https://github.com/agentbridge/agentbridge.git
   cd agentbridge/examples/local-react-example
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the WebSocket server:
   ```bash
   # In a separate terminal
   cd ../../examples/local-react-example
   node server.js
   ```

4. Start the React app:
   ```bash
   npm start
   ```

5. Open your browser to http://localhost:3000

## Key Concepts

### 1. AgentBridgeProvider

The `AgentBridgeProvider` component sets up the React context for AgentBridge:

```jsx
<AgentBridgeProvider bridge={bridge}>
  <AppContent />
</AgentBridgeProvider>
```

### 2. Creating Components

Use the `useRegisterComponent` hook to make your components controllable by AI:

```jsx
const { state, updateState } = useRegisterComponent({
  id: 'my-counter',
  componentType: 'counter',
  description: 'A counter component',
  properties: {
    count: count,
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
    }
  }
});
```

### 3. Registering Functions

Use the `useAgentFunction` hook to expose functions to AI agents:

```jsx
useAgentFunction({
  name: 'greet',
  description: 'Send a greeting to the user',
  parameters: {
    name: {
      type: 'string',
      description: 'Name to greet'
    }
  }
}, async ({ name }) => {
  console.log(`Hello, ${name}!`);
  return { success: true, message: `Greeted ${name}` };
});
```

### 4. WebSocket Connection

The example connects to a local WebSocket server to facilitate communication between the app and AI agents.

```jsx
const provider = initializeWebSocketProvider(bridge, { 
  url: 'ws://localhost:3001' 
});

provider.connect();
```

## Testing with AI Agents

1. Start the example app and WebSocket server as described above
2. Connect an AI agent to the WebSocket server at `ws://localhost:3001`
3. The AI agent can:
   - Control the counter (increment, decrement, reset)
   - Add entries to the history log
   - Clear the history
   - Send greetings to the user

## Implementation Details

- The `StandardCounter` component demonstrates component registration
- The `StandardApp` component shows:
  - Setting up the AgentBridge provider
  - Initializing WebSocket communication
  - Registering functions
  - Tracking connection state and history

## Troubleshooting

- **React Version Issues**: Make sure you're using a consistent version of React. The SDK requires React 17 or higher.
- **WebSocket Connection Issues**: Ensure the WebSocket server is running at localhost:3001
- **Hook Errors**: Make sure hooks are called at the top level of your components

## Next Steps

- Try creating your own AI-controllable components
- Implement additional functions for AI agents to call
- Connect to a real AI agent service

## License

MIT 