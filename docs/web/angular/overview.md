# Angular SDK Overview

The AgentBridge Angular SDK provides components, services, and directives that integrate the AgentBridge framework with Angular applications. This SDK makes it easy to expose application functionality and UI components to AI agents.

## Features

- **Integration with Angular DI**: Uses Angular's dependency injection system for services
- **Reactive State Management**: Observable-based state management for component tracking
- **Angular Forms Integration**: Works with Angular's forms system
- **UI Components**: Ready-to-use Angular components that can be controlled by AI agents
- **Directives**: Directives to easily add AI control to existing components
- **Services**: Angular services to manage the AgentBridge instance and its functionality

## Installation

Install the AgentBridge Angular SDK using npm:

```bash
npm install @agentbridge/core @agentbridge/angular
```

## Basic Setup

To use AgentBridge in your Angular application, add the `AgentBridgeModule` to your app module:

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AgentBridgeModule } from '@agentbridge/angular';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AgentBridgeModule.forRoot()  // Use forRoot() to initialize AgentBridge
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

You can configure AgentBridge by passing options to the `forRoot()` method:

```typescript
AgentBridgeModule.forRoot({
  // Provide custom AgentBridge instance
  bridge: createAgentBridge({ /* options */ }),
  
  // Provide custom adapter
  adapter: new AngularAdapter(/* options */)
})
```

## Using the AgentBridgeService

The `AgentBridgeService` is the main service for interacting with AgentBridge in your Angular components:

```typescript
// app.component.ts
import { Component, OnInit } from '@angular/core';
import { AgentBridgeService } from '@agentbridge/angular';

@Component({
  selector: 'app-root',
  template: `
    <div>
      <h1>My AgentBridge App</h1>
      <button (click)="triggerFunction()">Test Function</button>
    </div>
  `
})
export class AppComponent implements OnInit {
  constructor(private agentBridgeService: AgentBridgeService) {}
  
  ngOnInit() {
    // Register a function
    this.agentBridgeService.registerFunction(
      'greet',
      'Greet a user by name',
      {
        type: 'object',
        properties: {
          name: { type: 'string' }
        },
        required: ['name']
      },
      async ({ name }) => {
        return { message: `Hello, ${name}!` };
      }
    );
  }
  
  triggerFunction() {
    // Call a function
    this.agentBridgeService.callFunction('greet', { name: 'User' })
      .then(result => console.log(result));
  }
}
```

## Using Components

The Angular SDK provides several components that can be controlled by AI agents:

```html
<!-- Example using the agent-button component -->
<agent-button 
  agentId="my-button"
  [disabled]="isDisabled"
  (clicked)="handleButtonClick()">
  Click Me
</agent-button>

<!-- Example using the agent-input component -->
<agent-input
  agentId="my-input"
  [placeholder]="'Enter some text'"
  [(ngModel)]="inputValue">
</agent-input>

<!-- Example using the agent-select component -->
<agent-select
  agentId="my-select"
  [(ngModel)]="selectedValue">
  <option value="option1">Option 1</option>
  <option value="option2">Option 2</option>
  <option value="option3">Option 3</option>
</agent-select>
```

## Using the AgentContainerDirective

You can use the `agentContainer` directive to make any element controllable by AI agents:

```html
<div [agentContainer]="'my-container'" [agentProps]="containerProps">
  <p>This container can be controlled by AI agents.</p>
  <agent-button agentId="my-button">Click Me</agent-button>
</div>
```

## Subscribing to State Changes

You can subscribe to state changes using the `state$` observable from the `AgentBridgeService`:

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AgentBridgeService } from '@agentbridge/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-state-monitor',
  template: `
    <div>
      <h2>Component Registry</h2>
      <pre>{{ componentCount }} components registered</pre>
    </div>
  `
})
export class StateMonitorComponent implements OnInit, OnDestroy {
  private subscription: Subscription | null = null;
  componentCount = 0;
  
  constructor(private agentBridgeService: AgentBridgeService) {}
  
  ngOnInit() {
    this.subscription = this.agentBridgeService.state$.subscribe(state => {
      this.componentCount = state.componentRegistry.size;
    });
  }
  
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
```

## Next Steps

- Learn more about the [Angular components](components.md)
- Learn more about the [Angular services](services.md)
- Explore the [Core API](../../core/overview.md)