# React Components

This page documents all the UI components available in the AgentBridge React SDK. These components are designed to be easily controlled by AI agents while providing a seamless React experience.

## Core Components

The AgentBridge React SDK provides several ready-to-use components that can be controlled by AI agents:

### AgentButton

A button component that can be controlled by AI agents.

```jsx
import { AgentButton } from '@agentbridge/react';

function MyComponent() {
  return (
    <AgentButton
      id="submit-button"
      label="Submit"
      onClick={() => {
        // Your action here
      }}
      style={{
        backgroundColor: '#4285F4',
        color: 'white',
        borderRadius: '4px',
        padding: '8px 16px',
      }}
      disabled={false}
      loading={false}
      icon="arrow-right"
      iconPosition="right"
    />
  );
}
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | string | Unique identifier for the button |
| `label` | string | Text to display on the button |
| `onClick` | function | Callback function when button is clicked |
| `style` | object | Inline styles for the button |
| `className` | string | CSS class names to apply |
| `disabled` | boolean | Whether the button is disabled |
| `loading` | boolean | Whether to show a loading indicator |
| `icon` | string \| ReactNode | Icon to display with the button |
| `iconPosition` | 'left' \| 'right' | Position of the icon |

### AgentTextField

A text field component that can be controlled by AI agents.

```jsx
import { AgentTextField } from '@agentbridge/react';

function MyComponent() {
  const [value, setValue] = useState('');

  return (
    <AgentTextField
      id="email-input"
      label="Email Address"
      placeholder="Enter your email"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onSubmit={(value) => {
        // Handle submission
      }}
      type="email"
      style={{
        borderColor: '#ddd',
        borderRadius: '4px',
        padding: '8px',
      }}
    />
  );
}
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | string | Unique identifier for the text field |
| `label` | string | Label text for the field |
| `placeholder` | string | Placeholder text when empty |
| `value` | string | Current value of the text field |
| `onChange` | function | Callback when text changes |
| `onSubmit` | function | Callback when form is submitted |
| `type` | string | Input type (text, email, password, etc.) |
| `style` | object | Inline styles for the text field |
| `className` | string | CSS class names to apply |
| `disabled` | boolean | Whether the text field is disabled |
| `error` | string | Error message to display |
| `maxLength` | number | Maximum length of the text |
| `rows` | number | Number of rows (for textarea) |
| `autoFocus` | boolean | Whether to auto-focus the input |

### AgentSwitch

A switch component that can be toggled on or off by AI agents.

```jsx
import { AgentSwitch } from '@agentbridge/react';

function MyComponent() {
  const [checked, setChecked] = useState(false);

  return (
    <AgentSwitch
      id="notifications-switch"
      label="Enable Notifications"
      checked={checked}
      onChange={(value) => setChecked(value)}
      disabled={false}
      style={{
        activeColor: '#4CAF50',
        inactiveColor: '#ccc',
      }}
    />
  );
}
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | string | Unique identifier for the switch |
| `label` | string | Label text for the switch |
| `checked` | boolean | Current state of the switch |
| `onChange` | function | Callback when switch value changes |
| `disabled` | boolean | Whether the switch is disabled |
| `style` | object | Inline styles for the switch |
| `className` | string | CSS class names to apply |
| `labelPosition` | 'left' \| 'right' | Position of the label |

### AgentDropdown

A dropdown component that allows selection from a list of options.

```jsx
import { AgentDropdown } from '@agentbridge/react';

function MyComponent() {
  const [selected, setSelected] = useState('');

  const options = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'mx', label: 'Mexico' },
  ];

  return (
    <AgentDropdown
      id="country-dropdown"
      label="Select Country"
      value={selected}
      options={options}
      onChange={(value) => setSelected(value)}
      placeholder="Choose a country"
      disabled={false}
      style={{
        borderColor: '#ddd',
        borderRadius: '4px',
      }}
    />
  );
}
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | string | Unique identifier for the dropdown |
| `label` | string | Label text for the dropdown |
| `value` | any | Currently selected value |
| `options` | array | Array of options (objects with value and label) |
| `onChange` | function | Callback when selection changes |
| `placeholder` | string | Placeholder text when no option is selected |
| `disabled` | boolean | Whether the dropdown is disabled |
| `style` | object | Inline styles for the dropdown |
| `className` | string | CSS class names to apply |
| `error` | string | Error message to display |
| `isMulti` | boolean | Whether multiple options can be selected |
| `isClearable` | boolean | Whether the selection can be cleared |

### AgentCheckbox

A checkbox component that can be checked or unchecked by AI agents.

```jsx
import { AgentCheckbox } from '@agentbridge/react';

function MyComponent() {
  const [checked, setChecked] = useState(false);

  return (
    <AgentCheckbox
      id="terms-checkbox"
      label="I agree to the terms and conditions"
      checked={checked}
      onChange={(value) => setChecked(value)}
      disabled={false}
      style={{
        accentColor: '#4285F4',
      }}
    />
  );
}
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | string | Unique identifier for the checkbox |
| `label` | string | Label text for the checkbox |
| `checked` | boolean | Current state of the checkbox |
| `onChange` | function | Callback when checkbox value changes |
| `disabled` | boolean | Whether the checkbox is disabled |
| `style` | object | Inline styles for the checkbox |
| `className` | string | CSS class names to apply |
| `indeterminate` | boolean | Whether to show indeterminate state |
| `error` | string | Error message to display |

### AgentSlider

A slider component that can be adjusted by AI agents.

```jsx
import { AgentSlider } from '@agentbridge/react';

function MyComponent() {
  const [value, setValue] = useState(50);

  return (
    <AgentSlider
      id="volume-slider"
      label="Volume"
      value={value}
      min={0}
      max={100}
      step={1}
      onChange={(value) => setValue(value)}
      disabled={false}
      style={{
        activeColor: '#4285F4',
        inactiveColor: '#ddd',
        thumbColor: 'white',
      }}
    />
  );
}
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | string | Unique identifier for the slider |
| `label` | string | Label text for the slider |
| `value` | number | Current value of the slider |
| `min` | number | Minimum value of the slider |
| `max` | number | Maximum value of the slider |
| `step` | number | Step increment value |
| `onChange` | function | Callback when slider value changes |
| `disabled` | boolean | Whether the slider is disabled |
| `style` | object | Inline styles for the slider |
| `className` | string | CSS class names to apply |
| `showValue` | boolean | Whether to show the current value |
| `orientation` | 'horizontal' \| 'vertical' | Orientation of the slider |

## Building Custom Components

You can create custom components that can be controlled by AI agents by using the `withAgentComponent` higher-order component (HOC) or the `useAgentComponent` hook.

### Using the HOC

```jsx
import { withAgentComponent } from '@agentbridge/react';
import { useState } from 'react';

function CustomCard({ id, title, description, onTap, isAgentControlled, registerAgentAction }) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Register actions for the AI agent
  useState(() => {
    if (isAgentControlled) {
      registerAgentAction('tap', () => {
        if (onTap) onTap();
        return true;
      });
    }
  }, [isAgentControlled, registerAgentAction, onTap]);
  
  return (
    <div 
      className={`custom-card ${isHovered ? 'hovered' : ''}`}
      onClick={onTap}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        cursor: onTap ? 'pointer' : 'default',
        transition: 'all 0.2s',
        backgroundColor: isHovered ? '#f9f9f9' : 'white',
      }}
    >
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
}

// Wrap the component with the agent HOC
export default withAgentComponent(CustomCard, {
  // Properties exposed to the AI agent
  getAgentProperties: (props) => ({
    title: props.title,
    description: props.description,
    canTap: !!props.onTap,
  }),
  // Actions that can be performed by the AI agent
  agentActions: ['tap'],
});
```

### Using the Hook

```jsx
import { useAgentComponent } from '@agentbridge/react';
import { useState } from 'react';

export default function CustomCard({ id, title, description, onTap }) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Use the hook to make the component controllable by AI agents
  const { registerAgentAction } = useAgentComponent(id, {
    // Properties exposed to the AI agent
    properties: {
      title,
      description,
      canTap: !!onTap,
    },
    // Actions that can be performed by the AI agent
    actions: {
      tap: () => {
        if (onTap) onTap();
        return true;
      },
    },
  });
  
  return (
    <div 
      className={`custom-card ${isHovered ? 'hovered' : ''}`}
      onClick={onTap}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        cursor: onTap ? 'pointer' : 'default',
        transition: 'all 0.2s',
        backgroundColor: isHovered ? '#f9f9f9' : 'white',
      }}
    >
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
}
```

### Using the Custom Component

```jsx
import CustomCard from './CustomCard';

function MyComponent() {
  return (
    <CustomCard
      id="feature-card"
      title="Premium Feature"
      description="Unlock this feature by upgrading your account"
      onTap={() => {
        // Handle tap
        console.log('Card tapped');
      }}
    />
  );
}
```

## Component Context Provider

Wrap your application or component tree with the `AgentBridgeProvider` to enable agent control:

```jsx
import { AgentBridgeProvider } from '@agentbridge/react';

function App() {
  return (
    <AgentBridgeProvider apiKey="your-api-key">
      {/* Your application components */}
      <YourComponent />
    </AgentBridgeProvider>
  );
}
```

## Best Practices

1. **Unique IDs**: Always provide unique IDs for your components
2. **Descriptive Properties**: Make your component properties descriptive for AI agents
3. **Consistent Actions**: Use consistent action names across similar components
4. **State Management**: Use React state management patterns (useState, useReducer, or context) to manage component state
5. **Accessibility**: Ensure your components adhere to accessibility standards (WAI-ARIA)
6. **Error Handling**: Handle errors gracefully in action handlers
7. **TypeScript**: Use TypeScript for better type checking and developer experience

## Next Steps

- Learn about [React Hooks](./hooks.md) provided by AgentBridge
- Explore [Web SDK Features](../web-features.md)
- See [Examples](../../examples/react-examples.md) of AgentBridge components in action 