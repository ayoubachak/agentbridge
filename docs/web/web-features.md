# Web Features

This page documents the web-specific features available in AgentBridge for both React and Angular frameworks.

## Cross-Framework Features

The following features are available across all supported web frameworks:

### UI Components

AgentBridge provides web framework-specific UI components that follow modern web design principles while maintaining a consistent API for AI agent interactions:

- Buttons and action elements
- Input fields and form controls
- Selection components (dropdown, select)
- Toggle components (checkbox, switch)
- List views and collection components
- Card and container elements
- Navigation components
- Modal and dialog components

### DOM Integration

AgentBridge provides seamless integration with the DOM:

```typescript
// JavaScript/TypeScript
import { DOMCapabilities } from '@agentbridge/core';

// Find elements in the DOM
const elements = DOMCapabilities.queryElements('button.primary');

// Create and append elements
const newElement = DOMCapabilities.createElement('div', {
  className: 'custom-container',
  innerText: 'Created by AgentBridge'
});
document.body.appendChild(newElement);

// Add event listeners
DOMCapabilities.addEventListenerToElements('button.action', 'click', (event) => {
  // Handle click event
});
```

### Web Storage

Access and manage web storage with a consistent API:

```typescript
// JavaScript/TypeScript
import { StorageManager } from '@agentbridge/core';

// Local storage
StorageManager.local.set('user-preferences', { theme: 'dark' });
const preferences = StorageManager.local.get('user-preferences');

// Session storage
StorageManager.session.set('session-data', { lastPage: '/dashboard' });
const sessionData = StorageManager.session.get('session-data');

// Clear storage
StorageManager.local.remove('user-preferences');
StorageManager.session.clear();
```

### Responsive Design Support

Utilities for creating responsive web applications:

```typescript
// JavaScript/TypeScript
import { ResponsiveManager } from '@agentbridge/core';

// Get current viewport information
const viewport = ResponsiveManager.getViewport();

// Register a breakpoint listener
const unsubscribe = ResponsiveManager.addBreakpointListener({
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920
}, (breakpoint) => {
  console.log(`Current breakpoint: ${breakpoint}`);
});

// Unsubscribe when done
unsubscribe();

// Check if the current viewport matches a media query
const isMobile = ResponsiveManager.matches('(max-width: 600px)');
```

## React-Specific Features

Features specific to the React framework:

### React Hooks

A comprehensive set of hooks for integrating with AgentBridge:

```tsx
import { 
  useAgentComponent, 
  useAgentState, 
  useAgentAction 
} from '@agentbridge/react';

function CustomComponent() {
  // Register component with AgentBridge
  useAgentComponent('custom-component', {
    type: 'container',
    properties: {
      title: 'My Component'
    }
  });
  
  // State managed by AgentBridge
  const [count, setCount] = useAgentState('counter', 0);
  
  // Action registered with AgentBridge
  const incrementCounter = useAgentAction('increment-counter', () => {
    setCount(prev => prev + 1);
    return { success: true, newCount: count + 1 };
  });
  
  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={incrementCounter}>Increment</button>
    </div>
  );
}
```

For more details on React hooks, see the [React Hooks](react/hooks.md) documentation.

### React Context Integration

AgentBridge integrates with React Context:

```tsx
import { AgentBridgeProvider, useAgentBridge } from '@agentbridge/react';

function App() {
  return (
    <AgentBridgeProvider config={{ appId: 'your-app-id' }}>
      <MainContent />
    </AgentBridgeProvider>
  );
}

function MainContent() {
  // Access AgentBridge instance anywhere in the component tree
  const agentBridge = useAgentBridge();
  
  return (
    <div>
      {/* Application content */}
    </div>
  );
}
```

### Server Components Support

Integration with React Server Components:

```tsx
// server-component.tsx
import { registerServerComponent } from '@agentbridge/react/server';

async function ProductList() {
  // Fetch data on the server
  const products = await fetchProducts();
  
  // Register component metadata with AgentBridge
  registerServerComponent('product-list', {
    type: 'list',
    properties: {
      itemCount: products.length
    }
  });
  
  return (
    <div>
      {products.map(product => (
        <ProductItem key={product.id} product={product} />
      ))}
    </div>
  );
}
```

## Angular-Specific Features

Features specific to the Angular framework:

### Angular Directives

Custom directives for integrating with AgentBridge:

```typescript
// TypeScript with Angular components
import { Component } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <div>
      <h2>Count: {{ count }}</h2>
      <button abButton="increment-button" (click)="increment()">Increment</button>
      <button abButton="reset-button" (click)="reset()">Reset</button>
    </div>
  `
})
export class CounterComponent {
  count = 0;
  
  constructor(private agentBridge: AgentBridgeService) {
    // Register component with AgentBridge
    this.agentBridge.registerComponent({
      id: 'counter-component',
      type: 'counter',
      properties: {
        count: this.count
      },
      actions: ['increment', 'reset']
    });
    
    // Register functions
    this.agentBridge.registerFunction({
      name: 'incrementCounter',
      description: 'Increment the counter value',
      parameters: {},
      handler: () => this.increment()
    });
    
    this.agentBridge.registerFunction({
      name: 'resetCounter',
      description: 'Reset the counter to zero',
      parameters: {},
      handler: () => this.reset()
    });
  }
  
  increment() {
    this.count++;
    this.updateComponent();
    return { success: true, newCount: this.count };
  }
  
  reset() {
    this.count = 0;
    this.updateComponent();
    return { success: true };
  }
  
  private updateComponent() {
    // Update component properties in AgentBridge
    this.agentBridge.updateComponent('counter-component', {
      properties: {
        count: this.count
      }
    });
  }
}
```

### Angular Services

Angular services for AgentBridge integration:

```typescript
// agent-bridge.service.ts
import { Injectable } from '@angular/core';
import { AgentBridge } from '@agentbridge/core';

@Injectable({
  providedIn: 'root'
})
export class AgentBridgeService {
  private agentBridge: AgentBridge;
  
  constructor() {
    this.agentBridge = new AgentBridge();
    this.agentBridge.initialize({
      appId: 'your-app-id',
      apiKey: 'your-api-key'
    });
  }
  
  registerComponent(component: any) {
    return this.agentBridge.registerComponent(component);
  }
  
  updateComponent(id: string, updates: any) {
    return this.agentBridge.updateComponent(id, updates);
  }
  
  registerFunction(func: any) {
    return this.agentBridge.registerFunction(func);
  }
  
  executeFunction(name: string, params: any) {
    return this.agentBridge.executeFunction(name, params);
  }
}
```

### Angular Change Detection Integration

Automatic integration with Angular's change detection:

```typescript
// change-detection.service.ts
import { Injectable, NgZone } from '@angular/core';
import { AgentBridgeService } from './agent-bridge.service';

@Injectable({
  providedIn: 'root'
})
export class ChangeDetectionService {
  constructor(
    private agentBridge: AgentBridgeService,
    private ngZone: NgZone
  ) {
    // Wrap function executions with NgZone
    this.agentBridge.setFunctionWrapper((handler) => {
      return (...args: any[]) => {
        return new Promise((resolve, reject) => {
          this.ngZone.run(() => {
            Promise.resolve(handler(...args))
              .then(resolve)
              .catch(reject);
          });
        });
      };
    });
  }
}
```

## Web APIs Integration

AgentBridge provides integration with common web APIs:

### Fetch API

A wrapper around the Fetch API:

```typescript
// JavaScript/TypeScript
import { NetworkManager } from '@agentbridge/core';

// Simple GET request
const data = await NetworkManager.get('https://api.example.com/data');

// POST request with JSON body
const response = await NetworkManager.post('https://api.example.com/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// Advanced request with custom options
const result = await NetworkManager.request('https://api.example.com/data', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  },
  body: JSON.stringify({ status: 'active' }),
  timeout: 5000
});
```

### Web Workers

Integration with Web Workers:

```typescript
// JavaScript/TypeScript
import { WorkerManager } from '@agentbridge/core';

// Create a worker from a function
const worker = WorkerManager.createWorker((input) => {
  // This code runs in a web worker
  const result = performHeavyCalculation(input);
  return result;
});

// Execute work in the worker
const result = await worker.execute({ data: [1, 2, 3, 4, 5] });

// Terminate the worker when done
worker.terminate();
```

### Web Sockets

Simplified Web Sockets API:

```typescript
// JavaScript/TypeScript
import { WebSocketManager } from '@agentbridge/core';

// Create a WebSocket connection
const socket = WebSocketManager.connect('wss://example.com/socket');

// Add event listeners
socket.onMessage((data) => {
  console.log('Received:', data);
});

socket.onError((error) => {
  console.error('Socket error:', error);
});

// Send messages
socket.send({ type: 'greeting', content: 'Hello, server!' });

// Close the connection when done
socket.close();
```

## PWA Support

Features for Progressive Web App support:

### Service Worker Management

Simplified management of service workers:

```typescript
// JavaScript/TypeScript
import { ServiceWorkerManager } from '@agentbridge/core';

// Register a service worker
ServiceWorkerManager.register('/service-worker.js')
  .then(registration => {
    console.log('Service worker registered:', registration);
  })
  .catch(error => {
    console.error('Service worker registration failed:', error);
  });

// Check for updates
ServiceWorkerManager.checkForUpdates();

// Add update listeners
ServiceWorkerManager.onUpdate(() => {
  // Show update notification to user
  showUpdateNotification();
});
```

### Offline Detection

Monitor and react to connectivity changes:

```typescript
// JavaScript/TypeScript
import { ConnectivityMonitor } from '@agentbridge/core';

// Check current status
const isOnline = ConnectivityMonitor.isOnline();

// Add listeners
ConnectivityMonitor.onStatusChange((status) => {
  if (status.online) {
    showOnlineNotification();
  } else {
    showOfflineNotification();
  }
});

// Start monitoring
ConnectivityMonitor.startMonitoring({
  checkInterval: 30000, // milliseconds
  pingURL: 'https://example.com/ping'
});
```

### App Installation

Simplify the PWA installation process:

```typescript
// JavaScript/TypeScript
import { InstallationManager } from '@agentbridge/core';

// Check if the app is installable
const canInstall = InstallationManager.canInstall();

// Show the installation prompt
if (canInstall) {
  InstallationManager.promptInstallation()
    .then(result => {
      if (result.outcome === 'accepted') {
        console.log('App installation started');
      } else {
        console.log('App installation declined');
      }
    })
    .catch(error => {
      console.error('Installation error:', error);
    });
}
```

## Best Practices

### Performance Optimization

1. **Use Lazy Loading**: Import AgentBridge components and modules only when needed
2. **Minimize State Updates**: Batch state updates to reduce re-renders
3. **Virtualize Long Lists**: Use virtualization for long lists of items
4. **Implement Code Splitting**: Split your bundle into smaller chunks
5. **Use Web Workers**: Offload heavy computation to web workers

### Accessibility

1. **Semantic HTML**: Use semantic HTML elements and ARIA attributes
2. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
3. **Screen Reader Support**: Provide descriptive labels and alt text
4. **Color Contrast**: Maintain appropriate color contrast ratios
5. **Focus Management**: Implement proper focus management for modals and dialogs

### Security Considerations

1. **Input Validation**: Validate all inputs, especially those from AI agents
2. **Content Security Policy**: Implement a Content Security Policy
3. **HTTPS**: Always use HTTPS for your application
4. **Sensitive Data Handling**: Don't expose sensitive data in component definitions
5. **Secure Storage**: Use secure storage practices for sensitive information

For detailed examples of web components, refer to the framework-specific guides:
- [React Components](react/components.md)
- [Angular Components](angular/components.md) 