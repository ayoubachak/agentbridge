# Core Overview

The AgentBridge Core package provides the foundation for all AgentBridge functionality. It contains the primary interfaces, classes, and utilities that power the framework across all supported platforms.

## Architecture

The core package is platform-agnostic and consists of several key components:

```
@agentbridge/core/
├── agent-bridge.ts      # Main AgentBridge class
├── adapter.ts           # Framework adapter interface
├── registry.ts          # Function registry implementation
├── component-registry.ts # Component registry implementation
├── types.ts             # TypeScript definitions and interfaces
└── utils/               # Utility functions and helpers
```

## Main Components

### AgentBridge Class

The `AgentBridge` class is the central coordinator of the framework. It:

- Manages communication between application and AI agents
- Registers and tracks UI components
- Registers and executes functions
- Handles context and state management

```typescript
import { AgentBridge } from '@agentbridge/core';

// Create an instance
const bridge = new AgentBridge({
  applicationId: 'my-app-123',
  environmentId: 'development'
});

// Initialize with a communication provider
bridge.initialize(communicationProvider);
```

### Framework Adapters

Framework adapters serve as bridges between the core functionality and specific UI frameworks (React, Angular, etc.). They implement the `FrameworkAdapter` interface:

```typescript
interface FrameworkAdapter {
  initialize(bridge: AgentBridge): void;
  registerComponent(componentId: string, definition: ComponentDefinition, handlers: ComponentHandlers): void;
  unregisterComponent(componentId: string): void;
  disconnect(): Promise<void>;
  getComponentDefinitions(): ComponentDefinition[];
}
```

### Function Registry

The function registry manages functions that can be called by AI agents:

```typescript
// Register a function
bridge.registerFunction({
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
    // Implementation
    return { temperature: 22, conditions: 'sunny' };
  }
});
```

### Component Registry

The component registry tracks UI components that can be controlled by AI agents:

```typescript
// Component definition example
const buttonDefinition = {
  type: 'button',
  properties: {
    label: { type: 'string' },
    disabled: { type: 'boolean' }
  },
  actions: ['click']
};
```

## Communication Architecture

AgentBridge supports two primary communication modes:

### 1. Pub/Sub Mode

Uses third-party messaging services to relay messages between AI agents and applications:

```
+-------------+        +---------------+        +------------+
|             |        |               |        |            |
| Application +<------>+ Pub/Sub Service +<------>+ AI Agent   |
|             |        |               |        |            |
+-------------+        +---------------+        +------------+
```

### 2. Self-Hosted Mode

Uses a direct WebSocket connection via your backend:

```
+-------------+        +---------------+        +------------+
|             |        |               |        |            |
| Application +<------>+ Your Backend  +<------>+ AI Agent   |
|             |        |               |        |            |
+-------------+        +---------------+        +------------+
```

## Message Protocol

AgentBridge uses a standardized message protocol for communication:

### Capability Messages
Sent from the application to the agent to describe available functions and components.

### Command Messages
Sent from the agent to the application to call functions or control components.

### Response Messages
Sent from the application to the agent in response to command messages.

## Type System

AgentBridge uses a JSON Schema-compatible type system to define and validate:

- Function parameters and return values
- Component properties and action parameters
- Message structures

## Context Management

The context system provides AI agents with information about:

- The current application state
- User information
- Environment details
- Execution context for functions

## Next Steps

- See the [API Reference](api-reference.md) for detailed documentation of all classes and interfaces
- Learn about the [Function Registry](function-registry.md) for registering functions
- Explore the [Type System](type-system.md) for defining schemas
