# Quick Start Guide

This guide will help you quickly set up AgentBridge in your application and start exposing functionality to AI agents.

## Prerequisites

- Node.js 14+ or a compatible JavaScript environment
- npm, yarn, or another package manager
- A frontend application (React, Angular, React Native, or Flutter)

## Installation

1. Install the core package and your preferred framework adapter:

```bash
# For React
npm install @agentbridge/core @agentbridge/react

# For Angular
npm install @agentbridge/core @agentbridge/angular

# For React Native
npm install @agentbridge/core @agentbridge/react-native

# For Flutter
# See Flutter-specific installation instructions
```

2. Install a communication provider:

```bash
# Choose one of these providers
npm install @agentbridge/provider-ably     # Ably
npm install @agentbridge/provider-firebase # Firebase
npm install @agentbridge/provider-pusher   # Pusher
npm install @agentbridge/provider-supabase # Supabase

# Or for self-hosted mode
npm install @agentbridge/communication-websocket
```

## Basic Setup

### React Application

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
      <YourApplication />
    </AgentBridgeProvider>
  );
}

export default App;
```

### Angular Application

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AgentBridgeModule } from '@agentbridge/angular';
import { AblyProvider } from '@agentbridge/provider-ably';

import { AppComponent } from './app.component';

// Create a communication provider
const ablyProvider = new AblyProvider({
  apiKey: 'your-ably-api-key',
});

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AgentBridgeModule.forRoot({
      applicationId: 'your-app-id',
      communicationProvider: ablyProvider,
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

### React Native Application

```jsx
import React from 'react';
import { SafeAreaView } from 'react-native';
import { AgentBridgeProvider } from '@agentbridge/react-native';
import { AblyProvider } from '@agentbridge/provider-ably';

// Create a communication provider
const ablyProvider = new AblyProvider({
  apiKey: 'your-ably-api-key',
});

function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AgentBridgeProvider 
        applicationId="your-app-id"
        communicationProvider={ablyProvider}
      >
        {/* Your app components */}
        <YourApplication />
      </AgentBridgeProvider>
    </SafeAreaView>
  );
}

export default App;
```

## Registering Components

Components can be registered to allow AI agents to discover and interact with them.

### React

```jsx
import React, { useState } from 'react';
import { useAgentComponent } from '@agentbridge/react';

function Counter() {
  const [count, setCount] = useState(0);
  
  // Register this component with AgentBridge
  useAgentComponent('counter-component', {
    // Define the component properties that agents can access
    properties: {
      count,
    },
    // Define actions that agents can perform
    actions: {
      increment: () => {
        setCount(count + 1);
        return true;
      },
      decrement: () => {
        setCount(count - 1);
        return true;
      },
      reset: () => {
        setCount(0);
        return true;
      }
    }
  });
  
  return (
    <div>
      <h2>Counter: {count}</h2>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

### Angular

```typescript
import { Component } from '@angular/core';
import { AgentComponent } from '@agentbridge/angular';

@Component({
  selector: 'app-counter',
  template: `
    <div>
      <h2>Counter: {{ count }}</h2>
      <button (click)="increment()">Increment</button>
      <button (click)="decrement()">Decrement</button>
      <button (click)="reset()">Reset</button>
    </div>
  `
})
@AgentComponent({
  id: 'counter-component',
  properties: ['count'],
  actions: ['increment', 'decrement', 'reset']
})
export class CounterComponent {
  count = 0;
  
  increment() {
    this.count++;
    return true;
  }
  
  decrement() {
    this.count--;
    return true;
  }
  
  reset() {
    this.count = 0;
    return true;
  }
}
```

## Registering Functions

Functions can be registered to allow AI agents to call them.

### React

```jsx
import React, { useEffect } from 'react';
import { useAgentBridge } from '@agentbridge/react';

function WeatherFunction() {
  const { registerFunction } = useAgentBridge();
  
  useEffect(() => {
    // Register a function with AgentBridge
    registerFunction({
      name: 'getWeather',
      description: 'Get weather information for a location',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string' },
          units: { type: 'string', enum: ['metric', 'imperial'] }
        },
        required: ['location']
      },
      handler: async (params) => {
        const { location, units = 'metric' } = params;
        
        // Implementation (replace with actual API call)
        console.log(`Getting weather for ${location} in ${units}`);
        
        // Mock weather data
        return {
          location,
          temperature: 22,
          conditions: 'sunny',
          humidity: 45,
          units
        };
      }
    });
    
    // Clean up function when component unmounts
    return () => {
      // Unregister the function
      // This is optional but recommended
      unregisterFunction('getWeather');
    };
  }, [registerFunction]);
  
  return null; // This component doesn't render anything
}
```

### Angular

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AgentBridgeService } from '@agentbridge/angular';

@Component({
  selector: 'app-weather-function',
  template: '' // This component doesn't render anything
})
export class WeatherFunctionComponent implements OnInit, OnDestroy {
  constructor(private agentBridge: AgentBridgeService) {}
  
  ngOnInit() {
    // Register a function with AgentBridge
    this.agentBridge.registerFunction({
      name: 'getWeather',
      description: 'Get weather information for a location',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string' },
          units: { type: 'string', enum: ['metric', 'imperial'] }
        },
        required: ['location']
      },
      handler: async (params) => {
        const { location, units = 'metric' } = params;
        
        // Implementation (replace with actual API call)
        console.log(`Getting weather for ${location} in ${units}`);
        
        // Mock weather data
        return {
          location,
          temperature: 22,
          conditions: 'sunny',
          humidity: 45,
          units
        };
      }
    });
  }
  
  ngOnDestroy() {
    // Unregister the function when component is destroyed
    this.agentBridge.unregisterFunction('getWeather');
  }
}
```

## Communication Modes

AgentBridge supports two communication modes:

### Pub/Sub Mode (Backend-less)

In this mode, AgentBridge uses a third-party messaging service:

```javascript
// Example with Ably
import { AblyProvider } from '@agentbridge/provider-ably';

const ablyProvider = new AblyProvider({
  apiKey: 'your-ably-api-key',
});

// Use this provider with AgentBridgeProvider
```

See the [Pub/Sub Configuration](../core/pubsub-config.md) documentation for more options and providers.

### Self-Hosted Mode (With Backend)

In this mode, AgentBridge connects to your backend via WebSockets:

```javascript
// Example with WebSocket
import { WebSocketProvider } from '@agentbridge/communication-websocket';

const wsProvider = new WebSocketProvider({
  url: 'wss://your-server.com/agent-bridge',
  // Optional authentication
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Use this provider with AgentBridgeProvider
```

See the [WebSocket Configuration](../core/websocket-config.md) documentation for more options.

## Complete Example

Here's a complete example with React that registers both components and functions:

```jsx
import React, { useState } from 'react';
import { AgentBridgeProvider, useAgentComponent, useAgentFunction } from '@agentbridge/react';
import { AblyProvider } from '@agentbridge/provider-ably';

// Create a communication provider
const ablyProvider = new AblyProvider({
  apiKey: 'your-ably-api-key',
});

function Counter() {
  const [count, setCount] = useState(0);
  
  // Register this component with AgentBridge
  useAgentComponent('counter-component', {
    properties: { count },
    actions: {
      increment: () => {
        setCount(count + 1);
        return true;
      },
      decrement: () => {
        setCount(count - 1);
        return true;
      },
      reset: () => {
        setCount(0);
        return true;
      }
    }
  });
  
  return (
    <div>
      <h2>Counter: {count}</h2>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

function Calculator() {
  // Register a function
  useAgentFunction({
    name: 'calculate',
    description: 'Perform a calculation',
    parameters: {
      type: 'object',
      properties: {
        operation: { type: 'string', enum: ['add', 'subtract', 'multiply', 'divide'] },
        a: { type: 'number' },
        b: { type: 'number' }
      },
      required: ['operation', 'a', 'b']
    },
    handler: async (params) => {
      const { operation, a, b } = params;
      
      switch (operation) {
        case 'add':
          return { result: a + b };
        case 'subtract':
          return { result: a - b };
        case 'multiply':
          return { result: a * b };
        case 'divide':
          if (b === 0) {
            throw new Error('Division by zero');
          }
          return { result: a / b };
        default:
          throw new Error('Unknown operation');
      }
    }
  });
  
  return null; // This component doesn't render anything
}

function App() {
  return (
    <AgentBridgeProvider 
      applicationId="your-app-id"
      communicationProvider={ablyProvider}
    >
      <div>
        <h1>AgentBridge Demo</h1>
        <Counter />
        <Calculator />
      </div>
    </AgentBridgeProvider>
  );
}

export default App;
```

## Next Steps

- [React SDK](../web/react/overview.md): Learn more about the React SDK
- [Angular SDK](../web/angular/overview.md): Learn more about the Angular SDK
- [React Native SDK](../mobile/react-native/overview.md): Learn more about the React Native SDK
- [Component Registry](../core/component-registry.md): Learn more about component registration
- [Function Registry](../core/function-registry.md): Learn more about function registration
- [Security Best Practices](../advanced/security.md): Secure your AgentBridge implementation