# Services

This page is under construction. It will contain documentation about Services in the Angular section.

## Coming Soon

Check back soon for detailed documentation on this topic.

The AgentBridge Angular SDK provides various services to integrate AI agent capabilities into your Angular applications.

## AgentBridgeService

The `AgentBridgeService` is the main service that provides integration with the AgentBridge framework.

```typescript
import { Injectable } from '@angular/core';
import { AgentBridgeService } from '@agentbridge/angular';
import { ExecutionContext } from '@agentbridge/core';

@Injectable()
export class MyComponent implements OnInit, OnDestroy {
  constructor(private agentBridge: AgentBridgeService) {}

  ngOnInit() {
    // Register a component
    this.agentBridge.registerComponent({
      id: 'my-component-1',
      componentType: 'button',
      name: 'Submit Button',
      description: 'A button that submits the form',
      properties: {
        label: 'Submit',
        disabled: false
      }
    }, this, { // handlers
      click: () => {
        // Handle click
        return { success: true };
      }
    });

    // Register a function
    this.agentBridge.registerFunction({
      name: 'getWeatherData',
      description: 'Get current weather data for a location',
      parameters: {
        type: 'object',
        properties: {
          location: { 
            type: 'string',
            description: 'City name or postal code'
          }
        },
        required: ['location']
      }
    }, (params: any, context: ExecutionContext) => {
      // Function implementation
      return Promise.resolve({ temp: 72, condition: 'sunny' });
    });
  }

  ngOnDestroy() {
    // Unregister the component when the Angular component is destroyed
    this.agentBridge.unregisterComponent('my-component-1');
  }

  // Update component state
  updateButtonState(disabled: boolean) {
    this.agentBridge.updateComponentState('my-component-1', {
      disabled
    });
  }
}
```

### Service Methods

The `AgentBridgeService` provides the following methods:

#### Component Management

- `registerComponent(componentDefinition, instance, handlers)`: Register a component with AgentBridge
- `unregisterComponent(id)`: Unregister a component by ID
- `updateComponentState(id, newState)`: Update component state

#### Function Management

- `registerFunction(definition, handler)`: Register a function with AgentBridge 
- `callFunction(name, params)`: Call a registered function

### Using with AngularAdapter

The `AgentBridgeService` uses an `AngularAdapter` internally to manage the registration and state of components. The adapter handles Angular-specific concerns such as change detection and component lifecycle.

## Other Services

### AgentAuthService

Handles authentication and authorization for AI agents.

```typescript
import { Injectable } from '@angular/core';
import { AgentAuthService } from '@agentbridge/angular';

@Injectable()
export class MyAuthComponent {
  constructor(private authService: AgentAuthService) {}

  checkAccess() {
    const hasAccess = this.authService.hasPermission('read:users');
    // Use the result
  }
}
```
