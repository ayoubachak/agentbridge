# Installation Guide

This guide covers how to install AgentBridge in various environments and frameworks. AgentBridge is designed to work with both web and mobile applications, with packages tailored for different frameworks.

## Core Package

The core package provides the foundation for AgentBridge and is required regardless of your framework or communication mode.

```bash
npm install @agentbridge/core
```

or with yarn:

```bash
yarn add @agentbridge/core
```

## Framework-Specific SDKs

### React

For React web applications, install the React SDK:

```bash
npm install @agentbridge/react
```

### Angular

For Angular applications, install the Angular SDK:

```bash
npm install @agentbridge/angular
```

### React Native

For React Native mobile applications, install the React Native SDK:

```bash
npm install @agentbridge/react-native
```

### Flutter

For Flutter applications, add the AgentBridge Flutter package to your `pubspec.yaml`:

```yaml
dependencies:
  agent_bridge: ^0.2.0
```

Then run:

```bash
flutter pub get
```

## Communication Providers

AgentBridge supports two communication modes: Pub/Sub and Self-Hosted. You'll need to install the appropriate provider package for your chosen mode.

### Pub/Sub Providers

#### Ably Provider

To use Ably as your Pub/Sub provider:

```bash
npm install @agentbridge/provider-ably ably
```

#### Firebase Provider

To use Firebase Realtime Database as your Pub/Sub provider:

```bash
npm install @agentbridge/provider-firebase firebase
```

#### Pusher Provider

To use Pusher as your Pub/Sub provider:

```bash
npm install @agentbridge/provider-pusher pusher-js
```

#### Supabase Provider

To use Supabase Realtime as your Pub/Sub provider:

```bash
npm install @agentbridge/provider-supabase @supabase/supabase-js
```

### Self-Hosted Mode

For the self-hosted WebSocket mode, you'll be using the server package directly:

```bash
npm install @agentbridge/server ws
```

## Complete Installation Examples

Here are complete installation examples for common setups:

### React + Ably (Pub/Sub Mode)

```bash
npm install @agentbridge/core @agentbridge/react @agentbridge/provider-ably ably
```

### React + Self-Hosted WebSocket

```bash
# Frontend
npm install @agentbridge/core @agentbridge/react

# Backend (Node.js)
npm install @agentbridge/server ws express
```

### Angular + Firebase (Pub/Sub Mode)

```bash
npm install @agentbridge/core @agentbridge/angular @agentbridge/provider-firebase firebase
```

### React Native + Pusher (Pub/Sub Mode)

```bash
npm install @agentbridge/core @agentbridge/react-native @agentbridge/provider-pusher pusher-js
```

### Flutter + Supabase (Pub/Sub Mode)

In `pubspec.yaml`:

```yaml
dependencies:
  agent_bridge: ^0.2.0
  agent_bridge_provider_supabase: ^0.2.0
  supabase_flutter: ^1.0.0
```

## TypeScript Support

All JavaScript packages include TypeScript definitions. To ensure full TypeScript support, make sure you have TypeScript installed in your project:

```bash
npm install typescript --save-dev
```

## Next Steps

Now that you've installed the required packages, you can proceed to set up AgentBridge in your application:

1. [Quick Start Guide](./quick-start.md): Build your first AI-enabled application
2. [Communication Modes](./communication-modes.md): Learn about the different communication modes
3. [Framework-Specific Guides](../web/index.md): Integration guides for specific frameworks 