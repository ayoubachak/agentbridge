# Installation

This guide will walk you through installing AgentBridge for different frameworks and platforms.

## Prerequisites

Before installing AgentBridge, ensure you have:

- Node.js 14.x or higher (for JavaScript packages)
- npm 7.x or higher or yarn 1.22.x or higher
- Flutter 3.0.0 or higher (for Flutter package)

## Installing the Core Package

The core package is required for all installations:

```bash
npm install @agentbridge/core
```

## Installing Framework SDKs

Choose the framework SDK that matches your application:

### React

```bash
npm install @agentbridge/react
```

### Angular

```bash
npm install @agentbridge/angular
```

### React Native

```bash
npm install @agentbridge/react-native
```

### Flutter

Add to your `pubspec.yaml`:

```yaml
dependencies:
  agentbridge: ^0.2.0
```

Then run:

```bash
flutter pub get
```

## Installing Communication Providers

You'll need at least one communication provider to connect your application with AI agents:

### Ably Provider

[Ably](https://ably.com/) offers a reliable real-time messaging service with an excellent free tier.

```bash
npm install @agentbridge/provider-ably
```

You'll need an Ably API key, which you can get by [signing up for a free account](https://ably.com/sign-up).

### Firebase Provider

[Firebase](https://firebase.google.com/) provides a comprehensive platform with real-time database capabilities.

```bash
npm install @agentbridge/provider-firebase
```

You'll need to create a Firebase project and configure your application to use it.

### Pusher Provider

[Pusher](https://pusher.com/) is a popular real-time messaging platform.

```bash
npm install @agentbridge/provider-pusher
```

You'll need a Pusher account and API credentials.

### Supabase Provider

[Supabase](https://supabase.com/) is an open-source Firebase alternative with real-time capabilities.

```bash
npm install @agentbridge/provider-supabase
```

You'll need a Supabase project and API credentials.

### WebSocket Provider (Self-Hosted Mode)

For applications with backends, you can use the WebSocket provider for direct communication:

```bash
npm install @agentbridge/communication-websocket
```

If you're using the self-hosted mode, you'll also need the server package:

```bash
npm install @agentbridge/server
```

## Framework-Specific Setup

### React Setup

1. Install the required packages:

```bash
npm install @agentbridge/core @agentbridge/react
```

2. Choose a communication provider (e.g., Ably):

```bash
npm install @agentbridge/provider-ably
```

3. Wrap your application with the AgentBridgeProvider:

```jsx
import React from 'react';
import { AgentBridgeProvider } from '@agentbridge/react';
import { AblyProvider } from '@agentbridge/provider-ably';

// Create a communication provider
const ablyProvider = new AblyProvider({
  apiKey: 'your-ably-api-key',
});

function App() {
  return (
    <AgentBridgeProvider 
      applicationId="your-app-id"
      communicationProvider={ablyProvider}
    >
      {/* Your app components */}
      <YourApp />
    </AgentBridgeProvider>
  );
}

export default App;
```

### Angular Setup

1. Install the required packages:

```bash
npm install @agentbridge/core @agentbridge/angular
```

2. Choose a communication provider (e.g., Firebase):

```bash
npm install @agentbridge/provider-firebase
```

3. Import the AgentBridgeModule in your app module:

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AgentBridgeModule } from '@agentbridge/angular';
import { FirebaseProvider } from '@agentbridge/provider-firebase';
import { AppComponent } from './app.component';

// Create a communication provider
const firebaseProvider = new FirebaseProvider({
  firebaseConfig: {
    apiKey: 'your-api-key',
    authDomain: 'your-auth-domain',
    projectId: 'your-project-id',
    storageBucket: 'your-storage-bucket',
    messagingSenderId: 'your-messaging-sender-id',
    appId: 'your-app-id'
  }
});

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AgentBridgeModule.forRoot({
      applicationId: 'your-app-id',
      communicationProvider: firebaseProvider
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### React Native Setup

1. Install the required packages:

```bash
npm install @agentbridge/core @agentbridge/react-native
```

2. Choose a communication provider (e.g., Pusher):

```bash
npm install @agentbridge/provider-pusher
```

3. Wrap your application with the AgentBridgeProvider:

```jsx
import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { AgentBridgeProvider } from '@agentbridge/react-native';
import { PusherProvider } from '@agentbridge/provider-pusher';

// Create a communication provider
const pusherProvider = new PusherProvider({
  appId: 'your-pusher-app-id',
  key: 'your-pusher-key',
  cluster: 'your-pusher-cluster',
});

function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <AgentBridgeProvider 
        applicationId="your-app-id"
        communicationProvider={pusherProvider}
      >
        {/* Your app components */}
        <YourApp />
      </AgentBridgeProvider>
    </SafeAreaView>
  );
}

export default App;
```

### Flutter Setup

1. Add dependencies to `pubspec.yaml`:

```yaml
dependencies:
  agentbridge: ^0.2.0
  supabase_flutter: ^1.10.0  # If using Supabase provider
```

2. Run `flutter pub get`

3. Initialize AgentBridge in your app:

```dart
import 'package:flutter/material.dart';
import 'package:agentbridge/agentbridge.dart';
import 'package:agentbridge/providers/supabase_provider.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Create a Supabase provider
    final supabaseProvider = SupabaseProvider(
      url: 'your-supabase-url',
      anonKey: 'your-supabase-anon-key',
    );
    
    return MaterialApp(
      title: 'AgentBridge Demo',
      home: AgentBridgeProvider(
        applicationId: 'your-app-id',
        communicationProvider: supabaseProvider,
        child: MyHomePage(),
      ),
    );
  }
}
```

## Self-Hosted Mode Setup

If you're using self-hosted mode, you'll need to set up the server component:

1. Install the server package:

```bash
npm install @agentbridge/server
```

2. Create a server instance:

```typescript
// server.js
import { AgentBridgeServer } from '@agentbridge/server';

const server = new AgentBridgeServer({
  port: 3000,
  authenticationHandler: async (token) => {
    // Implement your authentication logic
    // Return null if authentication fails, or user info if it succeeds
    return { id: 'user-123', name: 'John Doe' };
  }
});

server.start().then(() => {
  console.log('AgentBridge server running on port 3000');
});
```

3. Connect your client application:

```typescript
import { WebSocketProvider } from '@agentbridge/communication-websocket';

const webSocketProvider = new WebSocketProvider({
  url: 'ws://localhost:3000',
  authToken: 'your-auth-token'
});

// Then use this provider with your framework's AgentBridgeProvider
```

## Verifying Installation

To verify that AgentBridge is installed correctly, you can implement a simple component and function:

### React Verification

```jsx
import React from 'react';
import { useAgentFunction, AgentButton } from '@agentbridge/react';

function VerificationComponent() {
  useAgentFunction({
    name: 'ping',
    description: 'Test function that returns a pong response',
    parameters: {},
    handler: async () => {
      return { message: 'pong', timestamp: new Date().toISOString() };
    }
  });
  
  return (
    <div>
      <h2>AgentBridge Test</h2>
      <AgentButton 
        id="test-button"
        label="Test Button"
        onClick={() => console.log('Button clicked')}
      />
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. **Connection failed**: Check your API keys and network connection
2. **Components not registered**: Ensure your components have unique IDs
3. **Functions not working**: Verify the function registration and parameters
4. **WebSocket connection issues**: Check port availability and firewall settings
5. **React/Angular provider errors**: Make sure the provider is wrapped correctly

### Version Compatibility

Ensure all your AgentBridge packages have compatible versions. It's recommended to use the same version number for all packages.

## Next Steps

- [Quick Start Guide](quick-start.md): Build your first AI-enabled application
- [Choose a Communication Mode](communication-modes.md): Learn more about Pub/Sub vs. Self-Hosted modes 