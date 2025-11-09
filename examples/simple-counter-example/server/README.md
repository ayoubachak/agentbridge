# AgentBridge Custom Server

This is a custom WebSocket server that routes messages between UI clients (React/Angular apps) and AI agent clients.

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│             │         │              │         │              │
│  React App  │◄───────►│   Server     │◄───────►│ Agent Client │
│  (Port 5173)│  :8080  │  (Dual Port) │  :8081  │  (CLI)       │
│             │         │              │         │              │
└─────────────┘         └──────────────┘         └──────────────┘
       ▲                                                ▲
       │                                                │
       │                                                │
       └────────────────────────────────────────────────┘
              Both can control the same components
       
┌──────────────┐
│ Angular App  │◄──────► Server :8080
│ (Port 4200)  │
└──────────────┘
```

## Running the Server

```bash
npm install
npm start
```

The server will start on:
- **UI Port**: ws://localhost:8080 (for React/Angular apps)
- **Agent Port**: ws://localhost:8081 (for AI agent clients)

## Running the Agent Client

In a separate terminal:

```bash
npm run agent
```

### Agent Commands

- `list` - List all registered capabilities
- `increment` - Increment the counter
- `decrement` - Decrement the counter
- `reset` - Reset the counter to zero
- `set <value>` - Set counter to a specific value
- `help` - Show available commands
- `exit` - Exit the agent client

## Message Types

### From UI to Server

- `register_capabilities` - Full sync of all capabilities
- `update_capabilities` - Merge/update specific capabilities
- `function_result` - Result of a function execution
- `component_action_result` - Result of a component action
- `error` - Error message

### From Agent to Server

- `query_capabilities` - Request list of all capabilities
- `call_function` - Call a registered function
- `call_component_action` - Invoke a component action
- `update_component` - Update component properties

### From Server to Clients

- `connection_ack` - Connection acknowledgment
- `capabilities_updated` - Capabilities have changed
- `capabilities_result` - Response to capability query

## Features

✅ **Dual Port Architecture** - Separate ports for UI and agents
✅ **Capability Merging** - Smart merging of capabilities from multiple sources
✅ **Broadcast Routing** - Messages broadcast to all connected clients
✅ **Graceful Shutdown** - Clean server shutdown on SIGINT
✅ **Error Handling** - Robust error handling and logging
✅ **Multi-Framework Support** - Works with React, Angular, and more

## Testing

1. Start the server
2. Start the React app (`npm run dev` in `../`)
3. Start the Angular app (`npm start` in `../../angular-counter-example`)
4. Start the agent client
5. Type `list` to see capabilities from both apps
6. Control both apps from the same agent client!

This demonstrates the **framework-agnostic** nature of AgentBridge! 🚀
