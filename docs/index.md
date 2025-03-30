# AgentBridge Documentation

**AgentBridge** is a framework for building applications that can be controlled by AI agents. It provides a unified interface for exposing functionality to AI systems across different platforms and frameworks.

## What is AgentBridge?

AgentBridge is a comprehensive SDK that enables seamless integration between AI agents and your applications. It provides a structured way to:

- Expose application functionality to AI agents through a standardized API
- Allow AI agents to interact with UI components
- Maintain consistent behavior across different platforms and frameworks
- Handle authentication, permissions, and context management
- Bridge communication between AI agents and applications with no backend requirements

## Key Features

- **Cross-Platform Support**: Works on web (React, Angular) and mobile (React Native, Flutter) applications
- **Component Registry**: Register UI components that can be controlled by AI agents
- **Function Registry**: Expose application functionality as callable functions
- **Type System**: Define and validate function parameters and return values
- **Dual-Mode Communication**:
  - **Pub/Sub Mode**: For applications without backends, using providers like Ably, Firebase, Pusher, or Supabase
  - **Self-Hosted Mode**: For applications with backends, using WebSockets for direct communication
- **Authentication & Authorization**: Control access to sensitive functionality
- **Context Management**: Provide context to AI agents about the application state
- **Adapter Architecture**: Easy to extend to support new platforms and frameworks

## Why AgentBridge?

In the rapidly evolving landscape of AI-powered applications, developers need a consistent way to expose functionality to AI agents. AgentBridge solves this problem by providing:

1. **Consistency**: The same API works across different platforms and frameworks
2. **Simplicity**: Easy to integrate into existing applications
3. **Flexibility**: No backend required - works with both backend and backendless applications
4. **Extensibility**: Designed to be extended to support new platforms and frameworks
5. **Security**: Built-in authentication and authorization controls
6. **Performance**: Optimized for high-performance applications

## Communication Modes

AgentBridge supports two communication modes to suit different application architectures:

### Pub/Sub Mode

Ideal for frontend-only applications without dedicated backends. This mode uses third-party real-time messaging services to facilitate communication between AI agents and your application.

- **Supported Providers**:
  - **Ably**: Reliable real-time messaging with excellent free tier
  - **Firebase Realtime Database**: Google's real-time solution with strong ecosystem
  - **Pusher**: Popular real-time messaging platform
  - **Supabase Realtime**: Open-source Firebase alternative

### Self-Hosted Mode

For applications with dedicated backends, this mode uses WebSockets for direct communication between your backend and frontend, with the backend acting as a mediator for AI agent interactions.

- **Complete Control**: Manage all communication within your own infrastructure
- **Enhanced Security**: Implement custom security measures
- **Integration Flexibility**: Integrate with existing backend services

## Getting Started

To get started with AgentBridge, follow these steps:

1. [Installation](getting-started/installation.md): Learn how to install AgentBridge
2. [Quick Start](getting-started/quick-start.md): Build your first AI-enabled application
3. [Choose a Communication Mode](getting-started/communication-modes.md): Decide between Pub/Sub and Self-Hosted

## Integration Examples

- [React Web App](examples/react-web.md): Integrate with a React web application
- [React Native App](examples/react-native.md): Integrate with a React Native mobile app
- [Angular Web App](examples/angular.md): Integrate with an Angular web application
- [Flutter App](examples/flutter.md): Integrate with a Flutter mobile app

## Resources

- [GitHub Repository](https://github.com/agentbridge/agentbridge)
- [Example Applications](https://github.com/agentbridge/examples)
- [Community Forum](https://community.agentbridge.ai)

## License

AgentBridge is released under the MIT License. 