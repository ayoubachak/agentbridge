# Installation

This guide will help you install AgentBridge in your application. AgentBridge is available for different platforms and frameworks, including React, Angular, React Native, and Flutter.

## Prerequisites

- Node.js 14.x or higher (for web applications)
- Flutter 3.0.0 or higher (for Flutter applications)
- npm 7.x or higher or yarn 1.22.x or higher

## Installing the Core Package

The core package provides the fundamental functionality of AgentBridge and is required by all platform-specific SDKs.

### Using npm

```bash
npm install @agentbridge/core
```

### Using yarn

```bash
yarn add @agentbridge/core
```

## Web SDKs

### React

The React SDK provides components and hooks for integrating AgentBridge with React applications.

```bash
npm install @agentbridge/react
```

### Angular

The Angular SDK provides services, components, and directives for integrating AgentBridge with Angular applications.

```bash
npm install @agentbridge/angular
```

## Mobile SDKs

### React Native

The React Native SDK extends the React SDK and adds mobile-specific functionality for React Native applications.

```bash
npm install @agentbridge/react-native
```

### Flutter

The Flutter SDK provides widgets and services for integrating AgentBridge with Flutter applications.

```bash
flutter pub add agentbridge
```

## Environment Setup

### Web Applications

For web applications, you need to make sure that your bundler (webpack, Rollup, etc.) is configured correctly to handle the AgentBridge packages.

### React Native Applications

For React Native applications, you may need to install additional dependencies depending on the features you use:

```bash
npm install @agentbridge/react
```

### Flutter Applications

For Flutter applications, add the following dependency to your `pubspec.yaml` file:

```yaml
dependencies:
  agentbridge: ^0.1.0
```

## Verifying Installation

To verify that AgentBridge is installed correctly, you can create a simple test application that imports the core package and initializes the AgentBridge instance:

### JavaScript/TypeScript

```typescript
import { createAgentBridge } from '@agentbridge/core';

const bridge = createAgentBridge();
console.log('AgentBridge initialized:', bridge);
```

### Dart (Flutter)

```dart
import 'package:agentbridge/agentbridge.dart';

void main() {
  final bridge = AgentBridge();
  print('AgentBridge initialized: $bridge');
}
```

## Next Steps

Now that you have installed AgentBridge, you can proceed to the [Quick Start](quick-start.md) guide to learn how to use it in your application. 