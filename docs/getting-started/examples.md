# Example Projects

AgentBridge provides several example projects that demonstrate how to use the framework with different web and mobile frameworks.

## React Examples

### Local React Example

The Local React Example demonstrates how to use AgentBridge with React in a self-hosted mode using WebSockets for communication.

**Location:** `examples/local-react-example`

**Features:**
- WebSocket-based communication between the app and AI agents
- Counter component with properties and actions
- Event history tracking
- AgentBridge function registration

**Running the example:**

```bash
# Start the WebSocket server
cd examples/local-react-example
npm install
node server.js

# In a separate terminal, start the React app
cd examples/local-react-example
npm install
npm start
```

**Key components:**
- `Counter.js`: Demonstrates the `useRegisterComponent` hook for registering a UI component
- `App.js`: Shows how to set up the `AgentBridgeProvider` with a WebSocket communication provider
- `server.js`: Implements a simple WebSocket server for communication

### React Counter Example

The React Counter Example demonstrates using AgentBridge with React in both Pub/Sub and Self-Hosted modes.

**Location:** `examples/react-counter`

**Features:**
- Support for both Pub/Sub (Ably) and Self-Hosted (WebSocket) communication
- UI for switching between communication modes
- Counter component with properties and actions
- History panel for tracking actions

**Running the example:**

```bash
cd examples/react-counter
npm install
npm start

# For Self-Hosted mode, start the WebSocket server in another terminal
npm run server
```

**Key components:**
- `Counter.js`: Demonstrates component registration with properties and actions
- `App.js`: Shows setting up different communication providers
- `useAgentBridge.js`: Custom hook for managing AgentBridge configuration

## Angular Examples

### Local Angular Example

The Local Angular Example demonstrates how to use AgentBridge with Angular in a self-hosted mode.

**Location:** `examples/local-angular-example`

**Features:**
- WebSocket-based communication
- Angular component directives
- Function registration using decorators

**Running the example:**

```bash
# Start the WebSocket server
cd examples/local-angular-example
npm install
node server.js

# In a separate terminal, start the Angular app
cd examples/local-angular-example
npm install
ng serve
```

**Key components:**
- Uses the `AgentBridgeModule` for integration
- Demonstrates the `agentBridgeComponent` directive
- Shows how to register functions with AgentBridge

## Technical Details

### WebSocket Server

Both the React and Angular examples use a simple WebSocket server for self-hosted mode. The server:

1. Listens for connections from the app and AI agents
2. Forwards messages between the app and agents
3. Maintains connection state and handles reconnections
4. Implements a ping-pong mechanism to keep connections alive

**Features:**
- Client type detection (app vs. agent)
- Message forwarding
- Connection tracking
- Ping/pong for connection health checks

**Implementation:**
```javascript
const WebSocket = require('ws');
const http = require('http');
const { v4: uuidv4 } = require('uuid');

// Create HTTP server
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Handle connections
wss.on('connection', (ws) => {
  const clientId = uuidv4();
  
  // Handle messages
  ws.on('message', (message) => {
    // Process and forward messages
  });
  
  // Handle disconnections
  ws.on('close', () => {
    // Clean up
  });
});

server.listen(3001);
```

## Next Steps

After exploring these examples, you can:

1. Customize the examples to fit your use case
2. Integrate AgentBridge into your own application
3. Create your own AI agents that interact with these examples

For more advanced usage, see the [Advanced Topics](../advanced/index.md) section. 