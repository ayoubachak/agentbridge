# AgentBridge React Counter Example

This example demonstrates how to use AgentBridge in a React application to create AI-controllable components. The example is a simple counter application where the counter can be controlled by an AI agent.

## Features

- Demonstrates both communication modes (Pub/Sub and Self-Hosted)
- Shows component registration
- Includes function registration for app-level functions
- Provides a complete working example that can be extended

## Getting Started

### Prerequisites

- Node.js 14 or higher
- npm or yarn

### Installation

1. Clone the AgentBridge repository
   ```bash
   git clone https://github.com/agentbridge/agentbridge.git
   cd agentbridge
   ```

2. Install dependencies and build the packages
   ```bash
   npm install
   npm run build
   ```

3. Navigate to the example directory
   ```bash
   cd examples/react-counter
   npm install
   ```

4. Start the development server
   ```bash
   npm start
   ```

5. Open your browser to http://localhost:3000

## Using the Example

The counter example provides:

1. A counter component that can be incremented, decremented, and reset
2. A history component that displays the history of counter actions
3. A settings panel for configuring the communication mode

### Controlling via AI Agent

1. In the settings panel, choose your communication mode:
   - **Pub/Sub Mode**: Using Ably (requires an API key)
   - **Self-Hosted Mode**: Using WebSockets (requires running the provided server)

2. For Self-Hosted mode, start the WebSocket server:
   ```bash
   npm run server
   ```

3. Connect with an AI agent using the connection details shown in the app.

4. The AI can now control the counter using commands like:
   - Increment the counter
   - Decrement the counter
   - Reset the counter
   - Get the current count

## Understanding the Code

### Key Files

- `src/App.js` - Main application component with AgentBridge setup
- `src/components/Counter.js` - Counter component with AgentBridge registration
- `src/components/History.js` - History component showing actions
- `src/hooks/useAgentBridge.js` - Custom hook for AgentBridge setup
- `server/index.js` - WebSocket server for Self-Hosted mode

### AgentBridge Integration

The example demonstrates:

1. Setting up an AgentBridge instance with different providers
2. Registering a component (Counter) to make it controllable
3. Registering application functions
4. Switching between communication modes

## Next Steps

Try extending this example by:

1. Adding more controllable components
2. Implementing additional functions
3. Creating an AI agent that connects to this application
4. Trying different communication providers 