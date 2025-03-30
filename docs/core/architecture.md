# Architecture

This document provides an overview of the AgentBridge architecture, including its components, communication modes, and integration strategies.

## System Overview

AgentBridge is designed to bridge the gap between AI agents and applications, providing a standardized way for agents to interact with UI components and application functionality.

```mermaid
graph TD
    A[AI Agent] <-->|Commands & Responses| B[AgentBridge]
    B <-->|Events & State| C[Application]
    
    B -->|Uses| D[Core]
    B -->|Uses| E[Framework Adapters]
    B -->|Uses| F[Communication Providers]
    
    E -->|Connects to| G[React]
    E -->|Connects to| H[Angular]
    E -->|Connects to| I[React Native]
    E -->|Connects to| J[Flutter]
    
    F -->|Connects to| K[Ably]
    F -->|Connects to| L[Firebase]
    F -->|Connects to| M[Pusher]
    F -->|Connects to| N[Supabase]
    F -->|Connects to| O[WebSocket]
```

## Core Components

The AgentBridge framework consists of several core components:

### Agent Bridge

The main coordinator responsible for:
- Managing component and function registries
- Handling communication between application and AI agents
- Coordinating operations between different parts of the system

### Framework Adapters

Adapters for different UI frameworks, responsible for:
- Translating framework-specific component operations to AgentBridge operations
- Handling framework-specific lifecycle events
- Providing framework-specific APIs (hooks, components, etc.)

### Communication Providers

Providers for different communication methods, responsible for:
- Establishing connections between applications and AI agents
- Serializing and deserializing messages
- Handling connection lifecycle (connect, disconnect, reconnect)

### Registries

Manage registered functions and components:
- **Function Registry**: Stores function definitions and handlers
- **Component Registry**: Stores component definitions and handlers

## Communication Modes

AgentBridge supports two primary communication modes:

### Pub/Sub Mode

```mermaid
graph TD
    A[AI Agent] <-->|Pub/Sub Messages| B[Pub/Sub Service]
    B <-->|Pub/Sub Messages| C[Application]
    
    subgraph "Application"
        D[AgentBridge] <--> E[UI Components]
        D <--> F[Function Registry]
    end
    
    subgraph "Pub/Sub Service Options"
        G[Ably]
        H[Firebase]
        I[Pusher]
        J[Supabase]
    end
```

In Pub/Sub mode:
1. The application connects to a real-time messaging service
2. The AI agent connects to the same messaging service
3. They communicate via shared channels/topics
4. No backend is required for the application

Benefits:
- Simple to set up
- No need for a dedicated backend
- Multiple messaging providers supported

### Self-Hosted Mode

```mermaid
graph TD
    A[AI Agent] <-->|HTTP/WebSocket| B[Your Backend]
    B <-->|WebSocket| C[Application]
    
    subgraph "Application"
        D[AgentBridge] <--> E[UI Components]
        D <--> F[Function Registry]
    end
    
    subgraph "Your Backend"
        G[WebSocket Server]
        H[Authentication]
        I[Business Logic]
    end
```

In Self-Hosted mode:
1. The application connects to your backend via WebSockets
2. The AI agent connects to your backend via HTTP/WebSockets
3. Your backend serves as a mediator
4. The backend can implement additional logic, authentication, etc.

Benefits:
- Complete control over communication
- Enhanced security options
- Integration with existing backend systems

## Package Structure

The AgentBridge framework is organized into the following packages:

```mermaid
graph TD
    A[agentbridge] --> B[core]
    A --> C[frameworks]
    A --> D[providers]
    A --> E[communication]
    
    C --> F[react]
    C --> G[angular]
    C --> H[react-native]
    C --> I[flutter]
    
    D --> J[ably]
    D --> K[firebase]
    D --> L[pusher]
    D --> M[supabase]
    
    E --> N[websocket]
```

Each package has a specific responsibility:
- **core**: Core functionality and interfaces
- **frameworks**: Framework-specific implementations
- **providers**: Third-party service integrations
- **communication**: Communication protocol implementations

## Message Protocol

AgentBridge uses a standardized message protocol for communication between AI agents and applications. See the [Communication Protocol](communication-protocol.md) for details.

## Security

Security is a critical aspect of the AgentBridge architecture. The framework includes:
- Authentication mechanisms
- Authorization controls
- Input/output validation
- Transport security

For more details, see the [Security documentation](../advanced/security.md).

## Integration Patterns

### Basic Integration

```mermaid
sequenceDiagram
    participant App as Application
    participant Bridge as AgentBridge
    participant Agent as AI Agent
    
    App->>Bridge: Initialize
    App->>Bridge: Register Components
    App->>Bridge: Register Functions
    Bridge->>Agent: Send Capabilities
    Agent->>Bridge: Call Function
    Bridge->>App: Execute Function
    App->>Bridge: Return Result
    Bridge->>Agent: Send Result
```

### Component Integration

```mermaid
sequenceDiagram
    participant Component as UI Component
    participant Adapter as Framework Adapter
    participant Bridge as AgentBridge
    participant Agent as AI Agent
    
    Component->>Adapter: Register Component
    Adapter->>Bridge: Register with AgentBridge
    Bridge->>Agent: Send Component Capability
    Agent->>Bridge: Send Action Command
    Bridge->>Adapter: Execute Action
    Adapter->>Component: Execute Action
    Component->>Adapter: Return Action Result
    Adapter->>Bridge: Return Action Result
    Bridge->>Agent: Send Action Result
    Component->>Adapter: State Changed
    Adapter->>Bridge: Update Component State
    Bridge->>Agent: Send State Change Event
```

## Next Steps

- Read the [API Reference](api-reference.md) for detailed documentation
- See the [Function Registry](function-registry.md) and [Component Registry](component-registry.md) documentation
- Explore [Security considerations](../advanced/security.md) for secure implementations 