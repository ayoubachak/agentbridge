# AgentBridge

AgentBridge is a robust framework that provides an integrated API layer for mobile and web applications, enabling seamless interaction by AI agents. The framework exposes application functionalities as callable functions (APIs) so that AI agents can autonomously perform tasks without manual user input.

## Overview

AgentBridge bridges the gap between AI agents and applications by providing:

- **Core API Layer**: Standardized interfaces for AI-application communication
- **Cross-Platform Support**: SDKs for mobile (React Native, Flutter) and web (React, Angular) applications
- **Adapter Architecture**: Consistent code interface across different frameworks
- **Security & Access Control**: Authentication and permissions management
- **Developer-Friendly Tools**: Documentation, testing utilities, and example applications

## Project Structure

```
agentbridge/
├── packages/                    # Monorepo for all packages
│   ├── core/                    # Core API layer implementation
│   ├── web/                     # Web SDK implementations
│   │   ├── react/               # React SDK
│   │   └── angular/             # Angular SDK
│   ├── mobile/                  # Mobile SDK implementations
│   │   ├── react-native/        # React Native SDK
│   │   └── flutter/             # Flutter SDK (skeleton)
│   └── utils/                   # Shared utilities
├── examples/                    # Example applications
│   ├── web/                     # Web examples
│   └── mobile/                  # Mobile examples
├── docs/                        # Documentation
├── tests/                       # Testing utilities and tests
└── scripts/                     # Build and deployment scripts
```

## Key Features

- **Cross-Platform Support**: Unified API across React, Angular, React Native, and Flutter
- **Component Registry**: Register UI components for AI interaction
- **Type System**: Strongly-typed function definitions for reliable interactions
- **Security Controls**: Authentication, rate limiting, and access control
- **Adapter Architecture**: Consistent interface across different frameworks
- **MCP Support**: Optional integration with Model Context Protocols for standardized AI communication
- **Design Information Collection**: Capture UI design information for enhanced AI understanding

## Getting Started

### Installation

#### JavaScript/TypeScript

```bash
# Core package
npm install @agentbridge/core

# Platform-specific package (choose one)
npm install @agentbridge/react
npm install @agentbridge/angular
npm install @agentbridge/react-native
```

#### Flutter

```bash
# Add to pubspec.yaml
dependencies:
  agentbridge_flutter: ^0.1.0
```

### Basic Usage

#### React

```jsx
import { AgentBridge } from '@agentbridge/core';
import { ReactAdapter } from '@agentbridge/react';

// Initialize AgentBridge
const agentBridge = new AgentBridge();
const reactAdapter = new ReactAdapter(agentBridge);

// Register a function
agentBridge.registerFunction({
  name: 'greeting',
  description: 'Generate a personalized greeting',
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'User name' },
      formal: { type: 'boolean', description: 'Use formal greeting' }
    },
    required: ['name']
  },
  handler: async (params, context) => {
    const { name, formal = false } = params;
    return formal 
      ? `Good day, ${name}. How may I assist you?` 
      : `Hey ${name}! What's up?`;
  }
});

// Use with Model Context Protocols (optional)
if (process.env.ENABLE_MCP === 'true') {
  import { OpenAIMCPAdapter } from '@agentbridge/mcp-openai';
  
  // Register MCP adapter
  const openaiAdapter = new OpenAIMCPAdapter(agentBridge.registry);
  agentBridge.registerMCPAdapter('openai', openaiAdapter);
  
  // Get schema for OpenAI
  const schema = agentBridge.getMCPSchema('openai');
  console.log('OpenAI Function Schema:', schema);
}

// In your React component
function App() {
  const rootRef = React.useRef(null);
  
  React.useEffect(() => {
    if (rootRef.current) {
      // Initialize with root element to capture design information
      reactAdapter.initialize(rootRef.current);
    }
  }, []);
  
  return (
    <div ref={rootRef}>
      {/* Your application */}
    </div>
  );
}
```

#### Flutter

```dart
import 'package:agentbridge/agentbridge.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final AgentBridge agentBridge = AgentBridge.instance;
  
  @override
  void initState() {
    super.initState();
    
    // Register functions
    agentBridge.registerFunction({
      'name': 'showMessage',
      'description': 'Display a message to the user',
      'parameters': {
        'type': 'object',
        'properties': {
          'message': {'type': 'string', 'description': 'Message to display'},
          'duration': {'type': 'integer', 'description': 'Duration in seconds'}
        },
        'required': ['message']
      },
      'handler': (params, context) async {
        // Implementation
        return {'success': true};
      }
    });
    
    // Optional MCP support
    final enableMcp = const bool.fromEnvironment('ENABLE_MCP', defaultValue: false);
    if (enableMcp) {
      final openaiAdapter = OpenAIMCPAdapter(agentBridge.registry);
      agentBridge.registerMCPAdapter('openai', openaiAdapter);
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: Text('AgentBridge Flutter Example')),
        body: Center(
          child: Text('AgentBridge is initialized'),
        ),
      ),
    );
  }
}
```

## Documentation

Comprehensive documentation is available at [https://your-organization.github.io/agentbridge](https://your-organization.github.io/agentbridge)

- [Getting Started Guide](https://your-organization.github.io/agentbridge/getting-started)
- [API Reference](https://your-organization.github.io/agentbridge/api-reference)
- [Architecture Overview](https://your-organization.github.io/agentbridge/development/architecture)
- [MCP Integration](https://your-organization.github.io/agentbridge/development/mcp-evaluation)
- [Deployment Guide](https://your-organization.github.io/agentbridge/development/deployment)

## Contributing

We welcome contributions to AgentBridge! Please see our [Contributing Guide](./CONTRIBUTING.md) for more information.

## License

MIT

## Development

### Publishing Packages

AgentBridge uses a streamlined process for publishing packages to npm. The process includes several tools to ensure consistency and reliability.

#### Publishing Tools

1. **Check Publish Readiness**
   ```bash
   npm run check-publish-readiness
   ```
   This tool validates all packages to ensure they meet the requirements for publishing, including:
   - Checking required fields in package.json
   - Verifying dist folders exist and contain build artifacts
   - Confirming version consistency across packages
   - Validating npm login status

2. **Prepare Package Versions**
   ```bash
   npm run prepare-publish
   ```
   Interactive tool that prompts you to:
   - Select which packages to update
   - Choose a new version number
   - Update repository metadata
   
   Can also be run with a version argument:
   ```bash
   npm run prepare-publish 1.0.0
   ```

3. **Publish Packages**
   ```bash
   npm run publish-packages
   ```
   Interactive publishing tool that:
   - Publishes packages in the correct dependency order
   - Offers dry-run mode to test without actually publishing
   - Provides options for building before publishing
   - Allows setting npm distribution tags

4. **All-in-One Release Command**
   ```bash
   npm run release
   ```
   Runs all the above tools in sequence for a complete release process.

#### Manual Publishing Steps

1. Check if packages are ready for publishing:
   ```bash
   npm run check-publish-readiness
   ```

2. Update all package versions:
   ```bash
   npm run prepare-publish 1.0.0
   ```

3. Commit the changes:
   ```bash
   git add .
   git commit -m "chore: prepare release v1.0.0"
   ```

4. Tag the release:
   ```bash
   git tag v1.0.0
   ```

5. Publish packages to npm:
   ```bash
   npm run publish-packages
   ```

6. Push changes and tags to GitHub:
   ```bash
   git push && git push --tags
   ```

#### Automated Publishing via GitHub Actions

1. The GitHub workflow will automatically publish packages to npm when a tag starting with 'v' is pushed (e.g., v1.0.0).

2. The workflow will:
   - Run tests for all packages
   - Build all packages
   - Publish JavaScript packages to npm
   - Create a GitHub release with release notes

3. Required secrets for automated publishing:
   - `NPM_TOKEN`: Access token for npm publishing

#### Publishing Requirements

- For npm packages: Ensure you have logged in with `npm login` and have the appropriate access rights.
- Make sure all packages have been built before publishing: `npm run build:js` 