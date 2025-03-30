# AgentBridge Architecture

This document provides an overview of the AgentBridge architecture, explaining how the framework enables AI agents to interact with frontend applications using a standardized API.

## Design Philosophy

AgentBridge is designed with the following principles in mind:

1. **Frontend-First**: Directly integrate into frontend code (React, Angular, Vue, React Native, Flutter) without requiring backend changes.
2. **Dual-Mode Communication**: Support both backend and backendless (frontend-only) applications.
3. **Standardized Schema**: Define a consistent way to describe components and functions across different frameworks.
4. **Security & Privacy**: Provide controls for managing access to sensitive functionality.
5. **Framework Agnostic**: Core concepts that work across different UI frameworks.
6. **Extensibility**: Ability to add custom providers, adapters, and integrations.

## High-Level Architecture

![AgentBridge Architecture](../assets/images/architecture-overview.png)

AgentBridge consists of the following key components:

1. **Core**: Central functionality including message handling, registries, and communication interfaces.
2. **Framework SDKs**: Adapters for different UI frameworks (React, Angular, etc.).
3. **Communication Providers**: Implementations for different communication modes.
4. **Server Components**: Optional backend components for self-hosted mode.

## Core Components

### AgentBridge Class

The `AgentBridge` class is the central entry point for the framework. It:

- Manages component and function registries
- Handles message routing
- Coordinates between framework adapters and communication providers
- Provides the public API for framework SDKs

### Registries

AgentBridge uses registries to track registered components and functions:

- **Function Registry**: Stores functions that can be called by AI agents
- **Component Registry**: Stores UI components that can be controlled by AI agents

### Communication Interface

The communication interface defines how AgentBridge communicates with AI agents:

- **Message Types**: Standard message formats for capabilities, commands, and results
- **Communication Manager**: Abstract interface implemented by different providers

## Communication Modes

### Pub/Sub Mode

![Pub/Sub Architecture](../assets/images/pubsub-detailed.png)

The Pub/Sub mode uses third-party real-time messaging services to facilitate communication between AI agents and frontend applications:

1. **Channels/Topics**:
   - **Capabilities Channel**: Frontend publishes available components and functions
   - **Commands Channel**: AI agents publish commands to call functions or control components
   - **Responses Channel**: Frontend publishes results of executed commands

2. **Message Flow**:
   - Frontend connects to Pub/Sub service and registers its capabilities
   - AI agent connects to the same Pub/Sub service
   - AI agent discovers capabilities by subscribing to the capabilities channel
   - AI agent sends commands via the commands channel
   - Frontend executes commands and sends results via the responses channel

3. **Supported Providers**:
   - Ably
   - Firebase Realtime Database
   - Pusher
   - Supabase Realtime
   - Custom providers (via extension API)

### Self-Hosted Mode

![Self-Hosted Architecture](../assets/images/self-hosted-detailed.png)

The Self-Hosted mode uses WebSockets with your own backend server:

1. **Components**:
   - **Frontend WebSocket Client**: Connects frontend to your backend server
   - **Backend WebSocket Server**: Manages connections and routes messages
   - **Agent API**: REST or WebSocket API for AI agents to connect to your backend

2. **Message Flow**:
   - Frontend connects to backend via WebSocket
   - Frontend registers capabilities with backend
   - AI agent connects to backend via API
   - AI agent requests capabilities from backend
   - AI agent sends commands to backend
   - Backend routes commands to appropriate frontend
   - Frontend executes commands and sends results back
   - Backend routes results back to AI agent

## Component Model

AgentBridge uses a standardized component model to describe UI elements across different frameworks:

### Component Definition

A component definition includes:

- **ID**: Unique identifier for the component
- **Description**: Human-readable description of the component
- **Type**: Component type (e.g., button, input, form)
- **Properties**: Schema for component properties that can be updated
- **Actions**: Actions that can be performed on the component
- **Metadata**: Additional information like tags, path, and authorization level

### Component Implementation

The actual implementation includes:

- **Definition**: The component metadata
- **Update Handler**: Function to handle property updates
- **Action Handlers**: Functions to handle component actions

### Example (React)

```jsx
useRegisterComponent({
  id: 'submit-button',
  description: 'Button to submit the user registration form',
  componentType: 'button',
  properties: z.object({
    disabled: z.boolean().optional(),
    label: z.string().optional()
  }),
  actions: {
    click: {
      description: 'Click the button',
      handler: async () => {
        await handleSubmit();
        return { success: true };
      }
    }
  },
  tags: ['form', 'registration'],
  path: '/registration/form'
});
```

## Function Model

AgentBridge also standardizes the way application functions are exposed:

### Function Definition

A function definition includes:

- **Name**: Unique identifier for the function
- **Description**: Human-readable description of the function
- **Parameters**: Schema for function parameters
- **Authorization Level**: Required access level to call the function
- **Tags**: For categorizing and filtering functions

### Example (React)

```jsx
useRegisterFunction(
  'loginUser',
  'Authenticate a user with email and password',
  z.object({
    email: z.string().email(),
    password: z.string().min(6)
  }),
  async (params, context) => {
    // Implementation
    return { success: true, token: '...' };
  },
  { authLevel: 'public', tags: ['auth'] }
);
```

## Integration Patterns

AgentBridge can be integrated with frontend applications in several ways:

### React

- **Hooks**: `useRegisterComponent`, `useRegisterFunction`
- **Components**: `AgentBridgeComponent`
- **HOCs**: `withAgentBridge`

### Angular

- **Decorators**: `@AgentBridgeComponent`, `@AgentBridgeFunction`
- **Directives**: `agentBridgeComponent`
- **Services**: `AgentBridgeService`

### Mobile (React Native / Flutter)

- Similar patterns adapted for mobile frameworks
- Mobile-specific component types
- Hooks/components for React Native
- Widgets/Mixins for Flutter

## Security Considerations

AgentBridge provides several security mechanisms:

1. **Authentication**: Authenticate AI agents before allowing access
2. **Authorization Levels**: Control which functions and components can be accessed
3. **Input Validation**: Validate all input parameters against schemas
4. **Rate Limiting**: Limit the frequency of function calls
5. **Execution Context**: Provide context about the calling agent and user

## Extending AgentBridge

AgentBridge is designed to be extensible:

1. **Custom Communication Providers**: Implement your own Pub/Sub or WebSocket providers
2. **Framework Adapters**: Create adapters for additional UI frameworks
3. **Custom Component Types**: Define your own component types with specialized behaviors
4. **Middleware**: Add custom middleware for logging, validation, or transformation
5. **API Extensions**: Extend the core API with additional functionality

## Next Steps

- [Core API Reference](./api-reference.md): Detailed API documentation
- [Communication Protocol](./communication-protocol.md): Message format specifications
- [Security Guide](../advanced/security.md): In-depth security considerations 