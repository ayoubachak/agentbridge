# AgentBridge

Connect AI agents to your web and mobile applications with ease.

## Overview

AgentBridge is a framework that allows you to expose your application components and functions to AI agents. It provides a standardized way for agents to discover, interact with, and manipulate your application.

## Features

- **Dual-Mode Communication**: Choose between Pub/Sub services like Ably and Firebase, or Self-Hosted mode with WebSockets
- **Framework Support**: Ready-to-use SDKs for React, Angular, and React Native
- **Component Registration**: Easy component registration with HOCs, hooks, or decorators
- **Function Registration**: Expose application functions to agents
- **Type-Safety**: Full TypeScript support

## Project Structure

```
agentbridge/
├── packages/
│   ├── core/             # Core functionality and interfaces
│   ├── frameworks/       # Framework-specific implementations
│   │   ├── react/        # React SDK
│   │   ├── angular/      # Angular SDK
│   │   ├── react-native/ # React Native SDK
│   ├── providers/        # Communication providers
│   │   ├── ably/         # Ably provider
│   │   ├── firebase/     # Firebase provider
│   │   ├── pusher/       # Pusher provider
│   │   ├── supabase/     # Supabase provider
│   ├── server/           # Self-hosted mode server
├── examples/             # Example applications
├── docs/                 # Documentation
```

## Installation

```bash
# Core package
npm install @agentbridge/core

# Framework SDKs
npm install @agentbridge/react    # For React applications
npm install @agentbridge/angular  # For Angular applications
npm install @agentbridge/react-native  # For React Native applications

# Communication Providers
npm install @agentbridge/provider-ably     # For using Ably as communication provider
npm install @agentbridge/provider-firebase # For using Firebase as communication provider
```

For more detailed installation instructions, see [Installation Guide](docs/getting-started/installation.md).

## Quick Start

```jsx
// React example
import { AgentBridgeProvider } from '@agentbridge/react';
import { AblyProvider } from '@agentbridge/provider-ably';

const ablyProvider = new AblyProvider({
  apiKey: 'your-ably-api-key'
});

function App() {
  return (
    <AgentBridgeProvider communicationProvider={ablyProvider}>
      {/* Your app components */}
    </AgentBridgeProvider>
  );
}
```

For more examples, see [Quick Start Guide](docs/getting-started/quick-start.md).

## Documentation

- [Getting Started](docs/getting-started/quick-start.md)
- [Communication Modes](docs/getting-started/communication-modes.md)
- [Architecture](docs/core/architecture.md)
- [API Reference](docs/api/core.md)

## Roadmap

See our [Roadmap](docs/development/roadmap.md) for upcoming features and improvements.

## Contributing

Contributions are welcome! See [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT 