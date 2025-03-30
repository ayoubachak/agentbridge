# @agentbridge/angular

Angular SDK for AgentBridge framework to connect your Angular applications with AI agents.

## Installation

```bash
npm install @agentbridge/angular @agentbridge/core
```

## Usage

### Setup

Import the `AgentBridgeModule` in your main module:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AgentBridgeModule } from '@agentbridge/angular';
import { AblyProvider } from '@agentbridge/provider-ably';

import { AppComponent } from './app.component';

// Initialize a communication provider
const ablyProvider = new AblyProvider({
  apiKey: 'your-ably-api-key'
});

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AgentBridgeModule.forRoot({
      communicationProvider: ablyProvider,
      debug: true
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### Registering Components

There are two ways to register components:

#### 1. Using the Decorator approach

```typescript
import { Component } from '@angular/core';
import { RegisterComponent } from '@agentbridge/angular';

@RegisterComponent({
  name: 'counter',
  description: 'A simple counter component',
  props: {
    count: 0,
    label: 'Counter'
  }
})
@Component({
  selector: 'app-counter',
  template: `
    <div>
      <h3>{{ label }}</h3>
      <p>Count: {{ count }}</p>
      <button (click)="increment()">Increment</button>
    </div>
  `
})
export class CounterComponent {
  count = 0;
  label = 'Counter';

  increment() {
    this.count++;
  }
}
```

#### 2. Using the Service directly

```typescript
import { Component, OnInit } from '@angular/core';
import { AgentBridgeService } from '@agentbridge/angular';

@Component({
  selector: 'app-message',
  template: `
    <div>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
    </div>
  `
})
export class MessageComponent implements OnInit {
  title = 'Message';
  message = 'Hello World';

  constructor(private agentBridge: AgentBridgeService) {}

  ngOnInit() {
    this.agentBridge.registerComponent({
      id: 'message-component',
      name: 'message',
      description: 'A message display component',
      props: {
        title: this.title,
        message: this.message
      },
      component: this
    });
  }

  updateMessage(newMessage: string) {
    this.message = newMessage;
  }
}
```

### Registering Functions

Use the `RegisterFunction` decorator or the service directly:

```typescript
import { Injectable } from '@angular/core';
import { RegisterFunction } from '@agentbridge/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedIn = false;
  private username = '';

  @RegisterFunction({
    name: 'login',
    description: 'Log in a user',
    parameters: {
      username: {
        type: 'string',
        description: 'Username to log in with'
      },
      password: {
        type: 'string',
        description: 'Password for authentication'
      }
    },
    returnType: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          description: 'Whether login was successful'
        },
        message: {
          type: 'string',
          description: 'Result message'
        }
      }
    }
  })
  login(params: { username: string; password: string }) {
    // In a real app, you would authenticate against a backend
    if (params.username && params.password) {
      this.isLoggedIn = true;
      this.username = params.username;
      return { success: true, message: 'Login successful' };
    }
    return { success: false, message: 'Invalid credentials' };
  }
}
```

## API Reference

### AgentBridgeModule

The main module to import in your Angular application.

- `forRoot(config: AgentBridgeModuleConfig)` - Configure the module with your communication provider

### AgentBridgeService

Service to interact with AgentBridge directly.

- `registerComponent(component: ComponentDefinition)` - Register a component
- `registerFunction(func: FunctionDefinition)` - Register a function
- `getInstance()` - Get the underlying AgentBridge instance
- `isConnected$` - Observable for connection status
- `components$` - Observable for registered components
- `functions$` - Observable for registered functions

### Decorators

- `RegisterComponent(definition)` - Decorator for registering Angular components
- `RegisterFunction(definition)` - Decorator for registering methods as exposed functions

## License

MIT 