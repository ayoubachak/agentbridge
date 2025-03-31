# Directives

The AgentBridge Angular SDK provides directives to easily integrate AI agent capabilities into your Angular applications.

## AgentBridgeComponentDirective

The `AgentBridgeComponentDirective` allows you to mark any component as controllable by AI agents.

```typescript
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <div agentBridgeComponent="counter-1" [agentBridgeProperties]="counterProps">
      <h2>Counter: {{ count }}</h2>
      <button (click)="increment()">+</button>
      <button (click)="decrement()">-</button>
      <button (click)="reset()">Reset</button>
    </div>
  `
})
export class CounterComponent implements OnInit {
  count = 0;
  
  // Define properties for the agent bridge
  counterProps = {
    count: this.count,
    isEven: this.count % 2 === 0,
    isPositive: this.count > 0
  };
  
  // Register handlers for actions
  @AgentBridgeAction('increment')
  increment() {
    this.count++;
    this.updateProps();
    return { success: true, message: 'Incremented counter' };
  }
  
  @AgentBridgeAction('decrement')
  decrement() {
    this.count--;
    this.updateProps();
    return { success: true, message: 'Decremented counter' };
  }
  
  @AgentBridgeAction('reset')
  reset() {
    this.count = 0;
    this.updateProps();
    return { success: true, message: 'Reset counter' };
  }
  
  // Update the properties when the count changes
  private updateProps() {
    this.counterProps = {
      count: this.count,
      isEven: this.count % 2 === 0,
      isPositive: this.count > 0
    };
  }
}
```

### Usage

```html
<!-- Basic usage -->
<div agentBridgeComponent="my-component-id"></div>

<!-- With properties and options -->
<div 
  agentBridgeComponent="my-component-id" 
  [agentBridgeProperties]="componentProps"
  [agentBridgeOptions]="componentOptions">
</div>
```

### Directive Options

| Option | Type | Description |
|--------|------|-------------|
| `agentBridgeComponent` | string | Unique ID for the component |
| `agentBridgeProperties` | object | Properties to expose to AI agents |
| `agentBridgeOptions` | object | Additional options for registration |

### AgentBridgeOptions Interface

```typescript
interface AgentBridgeOptions {
  componentType?: string; // Type of component (e.g., 'button', 'counter')
  name?: string; // Display name for the component
  description?: string; // Description of the component's purpose
  tags?: string[]; // Tags for categorizing the component
}
```

## AgentBridgeFunctionDirective

The `AgentBridgeFunctionDirective` allows you to mark a method as callable by AI agents.

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-weather',
  template: `
    <div>
      <h2>Weather Service</h2>
      <button (click)="getWeather('New York')">Get Weather for New York</button>
      <div *ngIf="weather">
        <h3>{{ weather.location }}</h3>
        <p>Temperature: {{ weather.temperature }}°C</p>
        <p>Conditions: {{ weather.conditions }}</p>
      </div>
    </div>
  `
})
export class WeatherComponent {
  weather: any;
  
  @AgentBridgeFunction({
    name: 'getWeather',
    description: 'Get weather information for a location',
    parameters: {
      type: 'object',
      properties: {
        location: { 
          type: 'string',
          description: 'City name'
        },
        units: { 
          type: 'string',
          enum: ['metric', 'imperial'],
          default: 'metric',
          description: 'Temperature units'
        }
      },
      required: ['location']
    }
  })
  getWeather(location: string, units: string = 'metric') {
    // In a real app, you would call a weather API
    this.weather = {
      location,
      temperature: 22,
      conditions: 'Sunny',
      units
    };
    return this.weather;
  }
}
``` 