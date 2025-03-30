# AgentBridge Architecture

This document provides an overview of the AgentBridge framework architecture, explaining how the different components work together to enable AI agents to interact with applications.

## Overview

AgentBridge is designed with a modular architecture that separates the core functionality from the platform-specific implementations. This allows for consistent behavior across different platforms and frameworks while enabling platform-specific optimizations.

```mermaid
graph TD
    AgentBridge[AgentBridge Core] --> Registry
    AgentBridge --> TypeSystem[Type System]
    AgentBridge --> AuthSystem[Authentication]
    
    AgentBridge --> FrameworkAdapter[Framework Adapter Interface]
    
    FrameworkAdapter --> ReactAdapter[React Adapter]
    FrameworkAdapter --> AngularAdapter[Angular Adapter]
    FrameworkAdapter --> ReactNativeAdapter[React Native Adapter]
    FrameworkAdapter --> FlutterAdapter[Flutter Adapter]
    
    ReactAdapter --> ReactComponents[React Components]
    AngularAdapter --> AngularComponents[Angular Components]
    ReactNativeAdapter --> RNComponents[React Native Components]
    FlutterAdapter --> FlutterComponents[Flutter Components]
    
    AIAgent[AI Agent] --> |Function Call| AgentBridge
    AIAgent --> |Component Interaction| FrameworkAdapter
    
    Registry --> FunctionDef[Function Definitions]
    
    subgraph "Application Layer"
        ReactComponents
        AngularComponents
        RNComponents
        FlutterComponents
    end
    
    subgraph "Adapter Layer"
        ReactAdapter
        AngularAdapter
        ReactNativeAdapter
        FlutterAdapter
    end
    
    subgraph "Core Layer"
        AgentBridge
        Registry
        TypeSystem
        AuthSystem
    end
```

## Core Components

### AgentBridge

The `AgentBridge` class is the central component of the framework. It provides the following functionality:

- Function registration and execution
- Authentication and authorization
- Context management
- Type validation
- Error handling

The core functionality is platform-agnostic and is used by all platform-specific adapters.

### FrameworkAdapter

The `FrameworkAdapter` interface defines the contract that all platform-specific adapters must implement. It includes methods for:

- Initializing the adapter
- Registering UI components
- Handling function calls
- Converting between different frameworks

### Registry

The `Registry` class manages the registration and lookup of functions. It provides:

- Function registration
- Function lookup
- Authentication checks
- Rate limiting

### Type System

The type system provides validation for function parameters and return values. It ensures that functions are called with the correct parameters and that they return valid results.

## Adapter Architecture

Each supported platform has its own adapter that implements the `FrameworkAdapter` interface. The adapters provide platform-specific functionality while maintaining a consistent API.

### React Adapter

The React adapter (`ReactAdapter`) integrates AgentBridge with React applications. It provides:

- React-specific hooks and components
- Integration with React's component lifecycle
- Context-based state management

### Angular Adapter

The Angular adapter (`AngularAdapter`) integrates AgentBridge with Angular applications. It provides:

- Angular services and components
- Integration with Angular's dependency injection
- Observable-based state management

### React Native Adapter

The React Native adapter extends the React adapter with mobile-specific functionality. It adds:

- Mobile device API access
- React Native component integration
- Mobile-specific context information

### Flutter Adapter

The Flutter adapter (`FlutterAdapter`) integrates AgentBridge with Flutter applications. It provides:

- Flutter widgets and services
- Integration with Flutter's widget lifecycle
- Mobile-specific functions

## Component Integration

AgentBridge allows AI agents to interact with UI components through a component registry system.

```mermaid
sequenceDiagram
    participant App as Application
    participant Component as UI Component
    participant Adapter as Framework Adapter
    participant Bridge as AgentBridge
    participant Agent as AI Agent
    
    App->>Component: Render Component
    Component->>Adapter: Register with ID and Type
    Adapter->>Bridge: Store Component Info
    
    Agent->>Bridge: Get Available Components
    Bridge->>Adapter: Retrieve Components
    Adapter->>Bridge: Return Component List
    Bridge->>Agent: Components with IDs and Types
    
    Agent->>Bridge: Call Function to Interact with Component
    Bridge->>Adapter: Handle Component Interaction
    Adapter->>Component: Update State/Trigger Event
    Component->>App: Re-render with New State
```

### Component Registry

The component registry tracks all registered UI components and their current state. It allows AI agents to:

- Discover available components
- Read component properties and state
- Update component state
- Trigger component events

### Component Registration Process

1. A UI component (button, input, etc.) is rendered in the application
2. The component registers itself with AgentBridge through the framework adapter
3. The component provides its ID, type, and initial properties
4. AgentBridge adds the component to the registry

### Component Interaction Process

1. An AI agent discovers available components through the `getComponents` function
2. The agent selects a component to interact with based on its ID or type
3. The agent calls a function to update the component's state or trigger an event
4. The framework adapter handles the function call and updates the component
5. The component re-renders with the updated state

## Function Calling Process

When an AI agent calls a function through AgentBridge, the following process occurs:

1. The agent sends a function call request with the function name, parameters, and context
2. AgentBridge validates the request (authentication, parameters, rate limits, etc.)
3. AgentBridge looks up the function in the registry
4. The function is executed with the provided parameters and context
5. The result is returned to the agent

## Context Management

AgentBridge provides context information to functions when they are called. This context includes:

- Agent information (ID, name, capabilities)
- User information (if authenticated)
- Application information (ID, environment)
- Request information (IP, timestamp, etc.)

## Security Model

AgentBridge includes several security features:

### Authentication

Functions can require authentication to be called. AgentBridge supports different authentication levels:

- `public`: No authentication required
- `user`: User authentication required
- `admin`: Administrative privileges required

### Rate Limiting

Functions can be rate-limited to prevent abuse. Rate limits can be set per function and include:

- Maximum number of requests
- Time window for rate limiting
- Scope of rate limiting (per user, per IP, global)

### Permissions

Functions can check permissions before executing. Permissions can be based on:

- User roles
- Custom permission logic
- Application-specific rules

## Error Handling

AgentBridge provides structured error handling for function calls:

- Each function call returns a result object with success/error information
- Errors include a code, message, and optional details
- Execution metadata (duration, timestamps) is included in the result

## Cross-Framework Interoperability

AgentBridge allows components from different frameworks to interact with each other through a common interface. This is achieved through:

- Framework adapters that implement a common interface
- A serialization format for component state
- Conversion functions for component properties

## Extension Points

AgentBridge can be extended in several ways:

- Custom adapters for new frameworks
- Custom component types
- Custom function implementations
- Custom authentication providers
- Custom type validators

## Package Structure

The AgentBridge framework is organized into the following packages:

- `@agentbridge/core`: Core functionality, type system, registry
- `@agentbridge/react`: React integration
- `@agentbridge/angular`: Angular integration
- `@agentbridge/react-native`: React Native integration
- `agentbridge` (Flutter): Flutter integration

## Dependency Graph

```mermaid
graph LR
    Core["@agentbridge/core"]
    React["@agentbridge/react"]
    Angular["@agentbridge/angular"]
    ReactNative["@agentbridge/react-native"]
    Flutter["agentbridge (Flutter)"]
    
    Core --> React
    Core --> Angular
    React --> ReactNative
    
    Flutter -.-> |"conceptual dependency"| Core
    
    classDef js fill:#f9f,stroke:#333,stroke-width:1px;
    classDef dart fill:#9cf,stroke:#333,stroke-width:1px;
    
    class Core,React,Angular,ReactNative js;
    class Flutter dart;
```

## Performance Considerations

AgentBridge is designed with performance in mind:

- Component state updates are optimized to minimize re-renders
- Function calls are validated early to prevent unnecessary execution
- The registry uses efficient lookup mechanisms
- Adapters use platform-specific optimizations

## Testing Strategy

AgentBridge can be tested at different levels:

- Unit tests for core functionality
- Component tests for UI components
- Integration tests for function calling
- End-to-end tests for AI agent interactions

## Deployment Architecture

The AgentBridge packages can be deployed in several configurations, depending on the application's requirements.

```mermaid
graph TD
    subgraph "Package Registry"
        NPM["npm Registry<br>(@agentbridge/*)"]
        PubDev["pub.dev<br>(agentbridge)"]
    end
    
    subgraph "Web Application"
        WebApp["Web App"]
        WebCode["Application Code"]
        CoreLib["@agentbridge/core"]
        UILib["@agentbridge/react or<br>@agentbridge/angular"]
        
        WebCode --> CoreLib
        WebCode --> UILib
        CoreLib --> UILib
    end
    
    subgraph "Mobile Application"
        MobileApp["Mobile App"]
        MobileCode["Application Code"]
        MobileCore["@agentbridge/core or<br>agentbridge (Flutter)"]
        MobileUI["@agentbridge/react-native or<br>Flutter widgets"]
        
        MobileCode --> MobileCore
        MobileCode --> MobileUI
        MobileCore --> MobileUI
    end
    
    subgraph "AI Platform"
        AIModel["AI Model"]
        APIClient["API Client"]
        
        AIModel --> APIClient
    end
    
    NPM --> WebApp
    NPM --> MobileApp
    PubDev --> MobileApp
    
    WebApp --> |"Expose APIs"| AIModel
    MobileApp --> |"Expose APIs"| AIModel
```

## Model Context Protocols (MCPs) Integration

AgentBridge can be extended to support Model Context Protocols, enabling standardized communication between AI models and applications. The MCP support is built as an **optional feature** that can be enabled as needed without affecting existing functionality.

```mermaid
graph TD
    subgraph "AgentBridge Core"
        Bridge["AgentBridge Core"]
        Registry["Function Registry"]
        MCPManager["MCP Manager<br><i>(Optional)</i>"]
        MCPAdapters["MCP Adapters<br><i>(Optional)</i>"]
        DesignInfoCollector["Design Info Collector<br><i>(Optional)</i>"]
    end
    
    subgraph "Applications"
        WebApp["Web Application"]
        MobileApp["Mobile Application"]
    end
    
    subgraph "AI Platforms"
        OpenAI["OpenAI"]
        Anthropic["Anthropic"]
        Gemini["Google Gemini"]
    end
    
    WebApp <--> Bridge
    MobileApp <--> Bridge
    
    Bridge --> |Optional| MCPManager
    MCPManager --> MCPAdapters
    
    MCPAdapters --> |"OpenAI Adapter"| OpenAI
    MCPAdapters --> |"Anthropic Adapter"| Anthropic
    MCPAdapters --> |"Gemini Adapter"| Gemini
    
    Registry --> MCPAdapters
    DesignInfoCollector --> MCPManager
    
    classDef core fill:#f9f,stroke:#333,stroke-width:1px;
    classDef app fill:#9cf,stroke:#333,stroke-width:1px;
    classDef ai fill:#fd9,stroke:#333,stroke-width:1px;
    classDef optional fill:#f9f,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5;
    
    class Bridge,Registry core;
    class MCPManager,MCPAdapters,DesignInfoCollector optional;
    class WebApp,MobileApp app;
    class OpenAI,Anthropic,Gemini ai;
```

### Optional MCP Architecture

The MCP integration is designed to be completely optional, allowing applications to use AgentBridge with or without MCP support. The components are lazy-loaded and only initialized when explicitly requested. This ensures:

1. **No Performance Impact**: Applications that don't use MCPs won't experience any overhead
2. **Backward Compatibility**: Existing code continues to work without modification
3. **Progressive Adoption**: MCP support can be added incrementally to existing applications

```mermaid
sequenceDiagram
    participant App as Application
    participant Bridge as AgentBridge
    participant MCP as MCP Manager
    participant Adapter as MCP Adapter
    participant AI as AI Model

    Note over Bridge: MCP support not initialized
    
    App->>Bridge: registerMCPAdapter('openai', adapter)
    Bridge->>Bridge: initializeMCP() (lazy init)
    Bridge->>MCP: registerAdapter('openai', adapter)
    
    App->>Bridge: getMCPSchema('openai')
    Bridge->>MCP: getMCPSchema('openai')
    MCP->>Adapter: getFunctionSchema()
    Adapter->>MCP: Return schema
    MCP->>Bridge: Return schema
    Bridge->>App: Return schema
    
    App->>AI: Send schema
    AI->>App: Function call
    App->>Bridge: handleMCPFunctionCall('openai', call)
    Bridge->>MCP: handleMCPFunctionCall('openai', call)
    MCP->>Adapter: convertFromMCPCall(call)
    Adapter->>MCP: Return converted call
    MCP->>Bridge: Execute function
    Bridge->>MCP: Return result
    MCP->>Adapter: mapResponse(result)
    Adapter->>MCP: Return formatted response
    MCP->>Bridge: Return response
    Bridge->>App: Return response
    App->>AI: Send response
```

### MCP Adapter Design

MCP adapters follow a common interface but implement protocol-specific logic. The class diagram below shows the relationship between different adapter implementations:

```mermaid
classDiagram
    class MCPAdapter {
        <<interface>>
        +convertToMCPSchema(functionDef) any
        +convertFromMCPCall(mcpCall) any
        +mapContext(context) any
        +mapResponse(response) any
        +getFunctionSchema() any
    }
    
    class OpenAIMCPAdapter {
        -registry: Registry
        +convertToMCPSchema(functionDef) OpenAISchema
        +convertFromMCPCall(mcpCall) FunctionCallRequest
        +mapContext(context) any
        +mapResponse(response) any
        +getFunctionSchema() OpenAIToolsSchema
        -convertTypeToOpenAISchema(type) OpenAIParameterSchema
    }
    
    class AnthropicMCPAdapter {
        -registry: Registry
        +convertToMCPSchema(functionDef) AnthropicToolSchema
        +convertFromMCPCall(toolCall) FunctionCallRequest
        +mapContext(context) any
        +mapResponse(response) any
        +getFunctionSchema() AnthropicToolsSchema
        -convertTypeToAnthropicSchema(type) AnthropicParameterSchema
    }
    
    class GeminiMCPAdapter {
        -registry: Registry
        +convertToMCPSchema(functionDef) GeminiFunctionSchema
        +convertFromMCPCall(functionCall) FunctionCallRequest
        +mapContext(context) any
        +mapResponse(response) any
        +getFunctionSchema() GeminiFunctionsSchema
        -convertTypeToGeminiSchema(type) GeminiParameterSchema
    }
    
    MCPAdapter <|-- OpenAIMCPAdapter
    MCPAdapter <|-- AnthropicMCPAdapter
    MCPAdapter <|-- GeminiMCPAdapter
    
    class MCPManager {
        -adapters: Map<string, MCPAdapter>
        +registerAdapter(name, adapter) void
        +getAdapter(name) MCPAdapter
        +getMCPSchema(protocol) any
        +handleMCPFunctionCall(protocol, call, registry) Promise~any~
        +getSupportedProtocols() string[]
    }
    
    MCPManager --> "*" MCPAdapter : manages
    AgentBridge --> "0..1" MCPManager : uses
```

### Design Information Collection

The design information collection system captures the structure and appearance of UI components, enabling AI agents to understand and interact with application interfaces more effectively.

```mermaid
classDiagram
    class DesignInfoCollector {
        <<abstract>>
        +captureComponentTree(rootElement) ComponentTree
        #generateUniqueId() string
        #createEmptyTree() ComponentTree
        #createComponentInfo(id, type, props, state, designInfo) ComponentInfo
        #createDefaultDesignInfo() ComponentDesignInfo
        #addComponentToTree(tree, component, parentId) void
    }
    
    class ReactDesignInfoCollector {
        +captureComponentTree(rootElement) ComponentTree
        -traverseReactComponent(element, tree, parentId) void
        -processChildren(children, tree, parentId) void
        -getComponentState(element) object
        -extractDesignInfo(element) ComponentDesignInfo
        -extractLayoutInfo(element) LayoutInfo
        -extractStylingInfo(element) StylingInfo
        -extractScreenInfo(element) ScreenInfo
    }
    
    class FlutterDesignInfoCollector {
        +captureComponentTree(context) ComponentTree
        -_processElement(context, tree, parentId) void
        -_processChildren(context, tree, parentId) void
        -_extractProps(widget) Map
        -_extractState(context) Map
        -_extractDesignInfo(context) ComponentDesignInfo
        -_extractLayoutInfo(context) LayoutInfo
        -_extractStylingInfo(context) StylingInfo
        -_extractScreenInfo(context) ScreenInfo
    }
    
    DesignInfoCollector <|-- ReactDesignInfoCollector
    DesignInfoCollector <|-- FlutterDesignInfoCollector
```

### Enabling MCP Support

The MCP support is enabled on-demand through explicit integration points in the AgentBridge API:

```mermaid
graph TD
    Start[Application Start] --> CheckEnv{Use MCPs?}
    CheckEnv -->|No| StandardInit[Regular Initialization]
    CheckEnv -->|Yes| MCPInit[Initialize MCP Support]
    
    MCPInit --> RegisterAdapter[Register MCP Adapter]
    RegisterAdapter --> ConfigureAdapter[Configure MCP Schema]
    
    StandardInit --> AppReady[Application Ready]
    ConfigureAdapter --> AppReady
    
    AppReady --> FunctionCall{Need Function Call?}
    FunctionCall -->|Regular| StandardCall[Regular Function Call]
    FunctionCall -->|MCP| MCPCall[MCP Function Call]
    
    StandardCall --> ProcessResult[Process Result]
    MCPCall --> MCPResult[Process MCP Result]
    MCPResult --> ProcessResult
    
    classDef optional fill:#f9f,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5;
    class MCPInit,RegisterAdapter,ConfigureAdapter,MCPCall,MCPResult optional;
```

### Type Translation

A key aspect of MCP integration is the translation between AgentBridge types and MCP-specific schemas:

```mermaid
graph TD
    subgraph "AgentBridge Type System"
        ABString[String Type]
        ABNumber[Number Type]
        ABBoolean[Boolean Type]
        ABObject[Object Type]
        ABArray[Array Type]
    end
    
    subgraph "MCP Type Systems"
        subgraph "OpenAI"
            OAIString["string"]
            OAINumber["number"]
            OAIBoolean["boolean"]
            OAIObject["object"]
            OAIArray["array"]
        end
        
        subgraph "Anthropic"
            AntString["string"]
            AntNumber["number"]
            AntBoolean["boolean"]
            AntObject["object"]
            AntArray["array"]
        end
    end
    
    ABString --> OAIString
    ABString --> AntString
    
    ABNumber --> OAINumber
    ABNumber --> AntNumber
    
    ABBoolean --> OAIBoolean
    ABBoolean --> AntBoolean
    
    ABObject --> OAIObject
    ABObject --> AntObject
    
    ABArray --> OAIArray
    ABArray --> AntArray
    
    classDef ab fill:#f9f,stroke:#333,stroke-width:1px;
    classDef oai fill:#9cf,stroke:#333,stroke-width:1px;
    classDef ant fill:#fd9,stroke:#333,stroke-width:1px;
    
    class ABString,ABNumber,ABBoolean,ABObject,ABArray ab;
    class OAIString,OAINumber,OAIBoolean,OAIObject,OAIArray oai;
    class AntString,AntNumber,AntBoolean,AntObject,AntArray ant;
```

### Package Structure with MCP Support

The MCP support is integrated into the existing package structure without disrupting it:

```mermaid
graph LR
    Core["@agentbridge/core"]
    CoreMCP["@agentbridge/core/mcp"]
    
    React["@agentbridge/react"]
    ReactComp["@agentbridge/react/components"]
    ReactDesign["@agentbridge/react/design"]
    
    Angular["@agentbridge/angular"]
    AngularComp["@agentbridge/angular/components"]
    AngularDesign["@agentbridge/angular/design"]
    
    RN["@agentbridge/react-native"]
    RNComp["@agentbridge/react-native/components"]
    RNDesign["@agentbridge/react-native/design"]
    
    Flutter["agentbridge"]
    FlutterComp["agentbridge/components"]
    FlutterDesign["agentbridge/design"]
    
    MCPOpenAI["@agentbridge/mcp-openai<br><i>(Optional)</i>"]
    MCPAnthropic["@agentbridge/mcp-anthropic<br><i>(Optional)</i>"]
    MCPGemini["@agentbridge/mcp-gemini<br><i>(Optional)</i>"]
    
    Core --> CoreMCP
    Core --> React
    Core --> Angular
    Core --> RN
    
    React --> ReactComp
    React --> ReactDesign
    
    Angular --> AngularComp
    Angular --> AngularDesign
    
    RN --> RNComp
    RN --> RNDesign
    
    Flutter --> FlutterComp
    Flutter --> FlutterDesign
    
    CoreMCP --> MCPOpenAI
    CoreMCP --> MCPAnthropic
    CoreMCP --> MCPGemini
    
    classDef core fill:#f9f,stroke:#333,stroke-width:1px;
    classDef adapter fill:#9cf,stroke:#333,stroke-width:1px;
    classDef component fill:#cfc,stroke:#333,stroke-width:1px;
    classDef mcp fill:#f9f,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5;
    
    class Core,CoreMCP core;
    class React,Angular,RN,Flutter adapter;
    class ReactComp,AngularComp,RNComp,FlutterComp,ReactDesign,AngularDesign,RNDesign,FlutterDesign component;
    class MCPOpenAI,MCPAnthropic,MCPGemini mcp;
```

## Function Call Process with MCPs

The following sequence diagram shows how function calls are processed through the MCP layer:

```mermaid
sequenceDiagram
    participant AIAgent as AI Agent
    participant App as Application
    participant Bridge as AgentBridge
    participant MCPManager as MCP Manager
    participant Adapter as MCP Adapter
    participant Registry as Registry
    participant Function as Function
    
    AIAgent->>App: Function call via MCP
    App->>Bridge: handleMCPFunctionCall('openai', call)
    Bridge->>MCPManager: handleMCPFunctionCall('openai', call, registry)
    MCPManager->>Adapter: getAdapter('openai')
    MCPManager->>Adapter: convertFromMCPCall(call)
    Adapter->>MCPManager: Return function call request
    MCPManager->>Registry: executeFunction(name, params, context)
    Registry->>Function: Execute with params and context
    Function->>Registry: Return result
    Registry->>MCPManager: Return function result
    MCPManager->>Adapter: mapResponse(result)
    Adapter->>MCPManager: Return MCP-formatted response
    MCPManager->>Bridge: Return response
    Bridge->>App: Return response
    App->>AIAgent: Return MCP response
```

## Future Architecture Directions

Future enhancements to the AgentBridge architecture may include:

- Server-side rendering support
- WebSocket-based real-time updates
- Component synchronization across devices
- Enhanced MCP support for multiple AI platforms
- AI agent capability discovery
- Enhanced type system with runtime validation
- Additional design information collection mechanisms
- Advanced UI reasoning capabilities for AI agents 