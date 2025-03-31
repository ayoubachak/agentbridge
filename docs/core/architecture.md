# Architecture

This document outlines the architecture of the AgentBridge framework.

## Overview

AgentBridge is designed with a modular, pluggable architecture that enables AI agents to interact with applications across different platforms and frameworks.

```mermaid
graph TB
    subgraph "AI Agent"
        A[LLM/AI Agent]
    end
    
    subgraph "Core"
        B[AgentBridge Core]
        C[Component Registry]
        D[Function Registry]
        E[Type System]
        B --- C
        B --- D
        B --- E
    end
    
    subgraph "Communication"
        F[Communication Interface]
        G[PubSub Provider]
        H[WebSocket Provider]
        I[Custom Provider]
        F --- G
        F --- H
        F --- I
    end
    
    subgraph "Framework Adapters"
        J[React Adapter]
        K[Angular Adapter]
        L[React Native Adapter]
        M[Flutter Adapter]
    end
    
    subgraph "Application"
        N[UI Components]
        O[Application Functions]
    end
    
    A <--> B
    B <--> F
    F <--> J & K & L & M
    J & K & L & M <--> N
    J & K & L & M <--> O
```

## Core Components

The core of AgentBridge consists of several key components that work together to provide a cohesive framework.

### Component Registry

The Component Registry maintains a list of UI components that are available to AI agents. Each component is registered with:

- A unique identifier
- Component type
- Properties and their current values
- Available actions

```mermaid
classDiagram
    class ComponentRegistry {
        +Map<string, ComponentDefinition> components
        +registerComponent(component)
        +unregisterComponent(id)
        +getComponent(id)
        +getComponentsByType(type)
        +updateComponentState(id, state)
    }
    
    class ComponentDefinition {
        +string id
        +string type
        +string name
        +string description
        +Map<string, any> properties
        +Map<string, Action> actions
    }
    
    class Action {
        +string name
        +string description
        +Function handler
        +execute(params)
    }
    
    ComponentRegistry "1" --> "*" ComponentDefinition
    ComponentDefinition "1" --> "*" Action
```

### Function Registry

The Function Registry maintains a list of functions that are exposed to AI agents:

```mermaid
classDiagram
    class FunctionRegistry {
        +Map<string, FunctionDefinition> functions
        +registerFunction(function)
        +unregisterFunction(name)
        +getFunction(name)
        +getFunctionsByTag(tag)
        +executeFunction(name, params)
    }
    
    class FunctionDefinition {
        +string name
        +string description
        +JSONSchema parameters
        +Function handler
        +string[] tags
        +bool enabled
        +execute(params)
    }
    
    FunctionRegistry "1" --> "*" FunctionDefinition
```

## Communication Flow

The detailed flow of information through the AgentBridge system:

```mermaid
sequenceDiagram
    participant Agent as AI Agent
    participant Bridge as AgentBridge Core
    participant Provider as Communication Provider
    participant Adapter as Framework Adapter
    participant Component as UI Component
    
    Agent->>Bridge: Request component list
    Bridge->>Agent: Return available components
    
    Agent->>Bridge: Request component action
    Bridge->>Provider: Transmit action request
    Provider->>Adapter: Deliver action request
    Adapter->>Component: Execute action
    Component->>Adapter: Return action result
    Adapter->>Provider: Send action response
    Provider->>Bridge: Transmit action response
    Bridge->>Agent: Deliver action result
    
    Component->>Adapter: State change notification
    Adapter->>Provider: Send state update
    Provider->>Bridge: Transmit state update
    Bridge->>Agent: Notify of state change
```

## Initialization Process

The initialization process of AgentBridge within an application:

```mermaid
stateDiagram-v2
    [*] --> CreateBridge
    CreateBridge --> ConfigureBridge
    ConfigureBridge --> SetupProvider
    SetupProvider --> ConnectProvider
    ConnectProvider --> RegisterComponents
    RegisterComponents --> RegisterFunctions
    RegisterFunctions --> Ready
    Ready --> [*]
    
    ConnectProvider --> ConnectionError
    ConnectionError --> RetryConnection
    RetryConnection --> ConnectProvider
    
    state ConnectionError {
        [*] --> LogError
        LogError --> NotifyApplication
        NotifyApplication --> [*]
    }
    
    state RegisterComponents {
        [*] --> ScanForComponents
        ScanForComponents --> CreateComponentDefinitions
        CreateComponentDefinitions --> AddToRegistry
        AddToRegistry --> [*]
    }
```

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