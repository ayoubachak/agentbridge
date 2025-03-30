# Angular Components

This page documents all the UI components available in the AgentBridge Angular SDK. These components are designed to be easily controlled by AI agents while providing a seamless integration with Angular applications.

## Core Components

The AgentBridge Angular SDK provides several ready-to-use components that can be controlled by AI agents:

### AgentButton

A button component that can be controlled by AI agents.

```html
<agent-button
  id="submit-button"
  label="Submit"
  (click)="handleClick()"
  [disabled]="isSubmitting"
  [loading]="isSubmitting"
  [style]="{
    backgroundColor: '#4285F4',
    color: 'white',
    borderRadius: '4px',
    padding: '8px 16px'
  }"
  icon="arrow-right"
  iconPosition="right">
</agent-button>
```

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-my-component',
  templateUrl: './my-component.component.html',
})
export class MyComponent {
  isSubmitting = false;

  handleClick() {
    this.isSubmitting = true;
    // Your action here
    setTimeout(() => {
      this.isSubmitting = false;
    }, 1000);
  }
}
```

#### Inputs

| Input | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the button |
| `label` | string | Text to display on the button |
| `disabled` | boolean | Whether the button is disabled |
| `loading` | boolean | Whether to show a loading indicator |
| `style` | object | Inline styles for the button |
| `class` | string | CSS class names to apply |
| `icon` | string | Icon to display with the button |
| `iconPosition` | 'left' \| 'right' | Position of the icon |

#### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `click` | EventEmitter<void> | Emitted when button is clicked |

### AgentTextField

A text field component that can be controlled by AI agents.

```html
<agent-text-field
  id="email-input"
  label="Email Address"
  placeholder="Enter your email"
  [(ngModel)]="email"
  (submitted)="handleSubmit()"
  type="email"
  [style]="{
    borderColor: '#ddd',
    borderRadius: '4px',
    padding: '8px'
  }">
</agent-text-field>
```

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-my-component',
  templateUrl: './my-component.component.html',
})
export class MyComponent {
  email = '';

  handleSubmit() {
    console.log('Submitted email:', this.email);
    // Handle submission
  }
}
```

#### Inputs

| Input | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the text field |
| `label` | string | Label text for the field |
| `placeholder` | string | Placeholder text when empty |
| `value` | string | Current value of the text field |
| `type` | string | Input type (text, email, password, etc.) |
| `disabled` | boolean | Whether the text field is disabled |
| `style` | object | Inline styles for the text field |
| `class` | string | CSS class names to apply |
| `error` | string | Error message to display |
| `maxLength` | number | Maximum length of the text |
| `rows` | number | Number of rows (for textarea) |
| `autoFocus` | boolean | Whether to auto-focus the input |

#### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `valueChange` | EventEmitter<string> | Emitted when text changes |
| `submitted` | EventEmitter<string> | Emitted when the enter key is pressed |
| `blurred` | EventEmitter<FocusEvent> | Emitted when the input loses focus |

### AgentSwitch

A switch component that can be toggled on or off by AI agents.

```html
<agent-switch
  id="notifications-switch"
  label="Enable Notifications"
  [(ngModel)]="notificationsEnabled"
  [disabled]="false"
  [style]="{
    activeColor: '#4CAF50',
    inactiveColor: '#ccc'
  }">
</agent-switch>
```

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-my-component',
  templateUrl: './my-component.component.html',
})
export class MyComponent {
  notificationsEnabled = false;
}
```

#### Inputs

| Input | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the switch |
| `label` | string | Label text for the switch |
| `checked` | boolean | Current state of the switch |
| `disabled` | boolean | Whether the switch is disabled |
| `style` | object | Inline styles for the switch |
| `class` | string | CSS class names to apply |
| `labelPosition` | 'left' \| 'right' | Position of the label |

#### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `checkedChange` | EventEmitter<boolean> | Emitted when switch value changes |

### AgentDropdown

A dropdown component that allows selection from a list of options.

```html
<agent-dropdown
  id="country-dropdown"
  label="Select Country"
  [(ngModel)]="selectedCountry"
  [options]="countries"
  placeholder="Choose a country"
  [disabled]="false"
  [style]="{
    borderColor: '#ddd',
    borderRadius: '4px'
  }">
</agent-dropdown>
```

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-my-component',
  templateUrl: './my-component.component.html',
})
export class MyComponent {
  selectedCountry = '';
  
  countries = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'mx', label: 'Mexico' }
  ];
}
```

#### Inputs

| Input | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the dropdown |
| `label` | string | Label text for the dropdown |
| `value` | any | Currently selected value |
| `options` | Array<{value: any, label: string}> | Array of options |
| `placeholder` | string | Placeholder text when no option is selected |
| `disabled` | boolean | Whether the dropdown is disabled |
| `style` | object | Inline styles for the dropdown |
| `class` | string | CSS class names to apply |
| `error` | string | Error message to display |
| `multiple` | boolean | Whether multiple options can be selected |
| `clearable` | boolean | Whether the selection can be cleared |

#### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `valueChange` | EventEmitter<any> | Emitted when selection changes |
| `opened` | EventEmitter<void> | Emitted when dropdown is opened |
| `closed` | EventEmitter<void> | Emitted when dropdown is closed |

### AgentCheckbox

A checkbox component that can be checked or unchecked by AI agents.

```html
<agent-checkbox
  id="terms-checkbox"
  label="I agree to the terms and conditions"
  [(ngModel)]="termsAccepted"
  [disabled]="false"
  [style]="{
    accentColor: '#4285F4'
  }">
</agent-checkbox>
```

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-my-component',
  templateUrl: './my-component.component.html',
})
export class MyComponent {
  termsAccepted = false;
}
```

#### Inputs

| Input | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the checkbox |
| `label` | string | Label text for the checkbox |
| `checked` | boolean | Current state of the checkbox |
| `disabled` | boolean | Whether the checkbox is disabled |
| `style` | object | Inline styles for the checkbox |
| `class` | string | CSS class names to apply |
| `indeterminate` | boolean | Whether to show indeterminate state |
| `error` | string | Error message to display |

#### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `checkedChange` | EventEmitter<boolean> | Emitted when checkbox value changes |

### AgentSlider

A slider component that can be adjusted by AI agents.

```html
<agent-slider
  id="volume-slider"
  label="Volume"
  [(ngModel)]="volume"
  [min]="0"
  [max]="100"
  [step]="1"
  [disabled]="false"
  [style]="{
    activeColor: '#4285F4',
    inactiveColor: '#ddd',
    thumbColor: 'white'
  }">
</agent-slider>
```

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-my-component',
  templateUrl: './my-component.component.html',
})
export class MyComponent {
  volume = 50;
}
```

#### Inputs

| Input | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the slider |
| `label` | string | Label text for the slider |
| `value` | number | Current value of the slider |
| `min` | number | Minimum value of the slider |
| `max` | number | Maximum value of the slider |
| `step` | number | Step increment value |
| `disabled` | boolean | Whether the slider is disabled |
| `style` | object | Inline styles for the slider |
| `class` | string | CSS class names to apply |
| `showValue` | boolean | Whether to show the current value |
| `orientation` | 'horizontal' \| 'vertical' | Orientation of the slider |

#### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `valueChange` | EventEmitter<number> | Emitted when slider value changes |

## Building Custom Components

You can create custom components that can be controlled by AI agents by using the `AgentComponentDirective` or by extending the `BaseAgentComponent` class.

### Using AgentComponentDirective

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AgentComponentDirective } from '@agentbridge/angular';

@Component({
  selector: 'app-custom-card',
  template: `
    <div class="custom-card" 
         [ngClass]="{'hovered': isHovered}"
         (click)="handleTap()"
         (mouseenter)="isHovered = true"
         (mouseleave)="isHovered = false"
         [style]="getCardStyle()">
      <h3>{{ title }}</h3>
      <p *ngIf="description">{{ description }}</p>
    </div>
  `,
  styles: [`
    .custom-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 16px;
      transition: all 0.2s;
    }
    .custom-card.hovered {
      background-color: #f9f9f9;
    }
  `],
})
export class CustomCardComponent {
  @Input() id!: string;
  @Input() title!: string;
  @Input() description: string = '';
  @Output() tap = new EventEmitter<void>();
  
  isHovered = false;
  
  constructor(private agentComponent: AgentComponentDirective) {
    // Register the component with AgentBridge
    this.agentComponent.registerComponent(this.id, {
      // Properties exposed to the AI agent
      getProperties: () => ({
        title: this.title,
        description: this.description,
        canTap: this.tap.observers.length > 0,
      }),
      // Actions that can be performed by the AI agent
      actions: {
        tap: () => {
          this.handleTap();
          return true;
        }
      }
    });
  }
  
  handleTap() {
    if (this.tap.observers.length > 0) {
      this.tap.emit();
    }
  }
  
  getCardStyle() {
    return {
      cursor: this.tap.observers.length > 0 ? 'pointer' : 'default',
    };
  }
}
```

### Extending BaseAgentComponent

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BaseAgentComponent } from '@agentbridge/angular';

@Component({
  selector: 'app-custom-card',
  template: `
    <div class="custom-card" 
         [ngClass]="{'hovered': isHovered}"
         (click)="handleTap()"
         (mouseenter)="isHovered = true"
         (mouseleave)="isHovered = false"
         [style]="getCardStyle()">
      <h3>{{ title }}</h3>
      <p *ngIf="description">{{ description }}</p>
    </div>
  `,
  styles: [`
    .custom-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 16px;
      transition: all 0.2s;
    }
    .custom-card.hovered {
      background-color: #f9f9f9;
    }
  `],
})
export class CustomCardComponent extends BaseAgentComponent {
  @Input() title!: string;
  @Input() description: string = '';
  @Output() tap = new EventEmitter<void>();
  
  isHovered = false;
  
  // Override the getAgentProperties method from BaseAgentComponent
  getAgentProperties() {
    return {
      title: this.title,
      description: this.description,
      canTap: this.tap.observers.length > 0,
    };
  }
  
  // Override the getAgentActions method from BaseAgentComponent
  getAgentActions() {
    return ['tap'];
  }
  
  // Override the handleAgentAction method from BaseAgentComponent
  handleAgentAction(action: string, params: any) {
    if (action === 'tap') {
      this.handleTap();
      return true;
    }
    return false;
  }
  
  handleTap() {
    if (this.tap.observers.length > 0) {
      this.tap.emit();
    }
  }
  
  getCardStyle() {
    return {
      cursor: this.tap.observers.length > 0 ? 'pointer' : 'default',
    };
  }
}
```

### Using the Custom Component

```html
<app-custom-card
  id="feature-card"
  title="Premium Feature"
  description="Unlock this feature by upgrading your account"
  (tap)="handleCardTap()">
</app-custom-card>
```

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-my-component',
  templateUrl: './my-component.component.html',
})
export class MyComponent {
  handleCardTap() {
    console.log('Card tapped');
    // Handle tap
  }
}
```

## AgentBridge Module

To use AgentBridge components in your Angular application, you need to import the `AgentBridgeModule` in your app module:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AgentBridgeModule } from '@agentbridge/angular';

import { AppComponent } from './app.component';
import { MyComponent } from './my-component.component';
import { CustomCardComponent } from './custom-card.component';

@NgModule({
  declarations: [
    AppComponent,
    MyComponent,
    CustomCardComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AgentBridgeModule.forRoot({
      apiKey: 'your-api-key',
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## Best Practices

1. **Unique IDs**: Always provide unique IDs for your components
2. **Descriptive Properties**: Make your component properties descriptive for AI agents
3. **Consistent Actions**: Use consistent action names across similar components
4. **NgModel Integration**: Use Angular's FormsModule and ngModel for easy two-way binding
5. **Angular Change Detection**: Respect Angular's change detection cycle when handling agent actions
6. **Accessibility**: Ensure your components adhere to accessibility standards
7. **Typed Interfaces**: Use TypeScript interfaces for better type checking and developer experience
8. **Lazy Loading**: Consider the impact of AgentBridge components on bundle size and lazy loading

## Next Steps

- Learn about [Angular Services](./services.md) provided by AgentBridge
- Explore [Web SDK Features](../web-features.md)
- See [Examples](../../examples/angular-examples.md) of AgentBridge components in action 