# React Native Components

This page documents all the UI components available in the AgentBridge React Native SDK. These components are designed to be easily controlled by AI agents while providing a native mobile experience.

## Core Components

The AgentBridge React Native SDK provides several ready-to-use components that can be controlled by AI agents:

### AgentButton

A button component that can be controlled by AI agents.

```jsx
import { AgentButton } from '@agentbridge/react-native';

function MyComponent() {
  return (
    <AgentButton
      id="submit-button"
      label="Submit"
      onPress={() => {
        // Your action here
      }}
      style={{
        backgroundColor: '#4285F4',
        borderRadius: 8,
        padding: 12,
      }}
      textStyle={{
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
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
| `onPress` | function | Callback function when button is pressed |
| `style` | object | Style object for the button container |
| `textStyle` | object | Style object for the button text |
| `disabled` | boolean | Whether the button is disabled |
| `loading` | boolean | Whether to show a loading indicator |
| `icon` | string \| ReactNode | Icon to display with the button |
| `iconPosition` | 'left' \| 'right' | Position of the icon |

### AgentTextField

A text field component that can be controlled by AI agents.

```jsx
import { AgentTextField } from '@agentbridge/react-native';
import { useState } from 'react';

function MyComponent() {
  const [value, setValue] = useState('');

  return (
    <AgentTextField
      id="email-input"
      label="Email Address"
      placeholder="Enter your email"
      value={value}
      onChangeText={setValue}
      onSubmitEditing={() => {
        // Handle submission
      }}
      keyboardType="email-address"
      style={{
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
      }}
      labelStyle={{
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
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
| `onChangeText` | function | Callback when text changes |
| `onSubmitEditing` | function | Callback when the return key is pressed |
| `keyboardType` | string | Type of keyboard to display |
| `secureTextEntry` | boolean | Whether to hide the text (for passwords) |
| `style` | object | Style object for the text input |
| `labelStyle` | object | Style object for the label |
| `disabled` | boolean | Whether the text field is disabled |
| `error` | string | Error message to display |
| `maxLength` | number | Maximum length of the text |
| `multiline` | boolean | Whether to allow multiple lines of text |
| `numberOfLines` | number | Number of lines to display (for multiline) |
| `autoFocus` | boolean | Whether to auto-focus the input |

### AgentSwitch

A switch component that can be toggled on or off by AI agents.

```jsx
import { AgentSwitch } from '@agentbridge/react-native';
import { useState } from 'react';

function MyComponent() {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <AgentSwitch
      id="notifications-switch"
      label="Enable Notifications"
      value={isEnabled}
      onValueChange={setIsEnabled}
      disabled={false}
      style={{
        marginVertical: 10,
      }}
      trackColor={{ false: '#767577', true: '#81b0ff' }}
      thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
    />
  );
}
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | string | Unique identifier for the switch |
| `label` | string | Label text for the switch |
| `value` | boolean | Current state of the switch |
| `onValueChange` | function | Callback when switch value changes |
| `disabled` | boolean | Whether the switch is disabled |
| `style` | object | Style object for the container |
| `labelStyle` | object | Style object for the label |
| `trackColor` | object | Colors for the track ({ false: string, true: string }) |
| `thumbColor` | string | Color of the foreground switch grip |
| `labelPosition` | 'left' \| 'right' | Position of the label |

### AgentDropdown

A dropdown component that allows selection from a list of options.

```jsx
import { AgentDropdown } from '@agentbridge/react-native';
import { useState } from 'react';

function MyComponent() {
  const [selected, setSelected] = useState('');

  const items = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'mx', label: 'Mexico' },
  ];

  return (
    <AgentDropdown
      id="country-dropdown"
      label="Select Country"
      value={selected}
      items={items}
      onValueChange={(value) => setSelected(value)}
      placeholder="Choose a country"
      disabled={false}
      style={{
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
      }}
      labelStyle={{
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
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
| `items` | array | Array of items (objects with value and label) |
| `onValueChange` | function | Callback when selection changes |
| `placeholder` | string | Placeholder text when no item is selected |
| `disabled` | boolean | Whether the dropdown is disabled |
| `style` | object | Style object for the dropdown |
| `labelStyle` | object | Style object for the label |
| `dropdownStyle` | object | Style object for the dropdown menu |
| `error` | string | Error message to display |

### AgentCheckbox

A checkbox component that can be checked or unchecked by AI agents.

```jsx
import { AgentCheckbox } from '@agentbridge/react-native';
import { useState } from 'react';

function MyComponent() {
  const [checked, setChecked] = useState(false);

  return (
    <AgentCheckbox
      id="terms-checkbox"
      label="I agree to the terms and conditions"
      value={checked}
      onValueChange={setChecked}
      disabled={false}
      style={{
        marginVertical: 10,
      }}
      checkboxColor="#4285F4"
    />
  );
}
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | string | Unique identifier for the checkbox |
| `label` | string | Label text for the checkbox |
| `value` | boolean | Current state of the checkbox |
| `onValueChange` | function | Callback when checkbox value changes |
| `disabled` | boolean | Whether the checkbox is disabled |
| `style` | object | Style object for the container |
| `labelStyle` | object | Style object for the label |
| `checkboxColor` | string | Color of the checkbox when checked |

### AgentSlider

A slider component that can be adjusted by AI agents.

```jsx
import { AgentSlider } from '@agentbridge/react-native';
import { useState } from 'react';

function MyComponent() {
  const [value, setValue] = useState(50);

  return (
    <AgentSlider
      id="volume-slider"
      label="Volume"
      value={value}
      onValueChange={setValue}
      minimumValue={0}
      maximumValue={100}
      step={1}
      disabled={false}
      style={{
        marginVertical: 15,
      }}
      labelStyle={{
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
      }}
      minimumTrackTintColor="#4285F4"
      maximumTrackTintColor="#ddd"
      thumbTintColor="white"
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
| `onValueChange` | function | Callback when slider value changes |
| `minimumValue` | number | Minimum value of the slider |
| `maximumValue` | number | Maximum value of the slider |
| `step` | number | Step increment value |
| `disabled` | boolean | Whether the slider is disabled |
| `style` | object | Style object for the container |
| `labelStyle` | object | Style object for the label |
| `minimumTrackTintColor` | string | Color of the track to the left of the thumb |
| `maximumTrackTintColor` | string | Color of the track to the right of the thumb |
| `thumbTintColor` | string | Color of the thumb |
| `showValue` | boolean | Whether to show the current value |

## Mobile-Specific Components

AgentBridge provides additional components specific to mobile applications:

### AgentTouchable

A touchable component that can be tapped by AI agents.

```jsx
import { AgentTouchable } from '@agentbridge/react-native';

function MyComponent() {
  return (
    <AgentTouchable
      id="card-touchable"
      onPress={() => {
        // Handle press
      }}
      style={{
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Card Title</Text>
      <Text style={{ marginTop: 8 }}>Card description text goes here</Text>
    </AgentTouchable>
  );
}
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | string | Unique identifier for the touchable area |
| `onPress` | function | Callback when pressed |
| `onLongPress` | function | Callback when long pressed |
| `style` | object | Style object for the touchable area |
| `disabled` | boolean | Whether the touchable is disabled |
| `activeOpacity` | number | Opacity when pressed (0-1) |
| `pressEffect` | 'opacity' \| 'highlight' \| 'none' | Type of press effect |

### AgentFlatList

A list component that can be scrolled and controlled by AI agents.

```jsx
import { AgentFlatList } from '@agentbridge/react-native';
import { useState } from 'react';

function MyComponent() {
  const [items, setItems] = useState([
    { id: '1', title: 'Item 1' },
    { id: '2', title: 'Item 2' },
    { id: '3', title: 'Item 3' },
  ]);

  const renderItem = ({ item }) => (
    <AgentTouchable
      id={`item-${item.id}`}
      onPress={() => console.log(`Pressed item ${item.id}`)}
      style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}
    >
      <Text>{item.title}</Text>
    </AgentTouchable>
  );

  return (
    <AgentFlatList
      id="my-list"
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      style={{ flex: 1 }}
      onRefresh={() => {
        // Handle refresh
      }}
      refreshing={false}
    />
  );
}
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | string | Unique identifier for the list |
| `data` | array | Array of data items to render |
| `renderItem` | function | Function to render each item |
| `keyExtractor` | function | Function to extract a key for each item |
| `style` | object | Style object for the list |
| `onRefresh` | function | Callback when pull-to-refresh is triggered |
| `refreshing` | boolean | Whether the list is currently refreshing |
| `onEndReached` | function | Callback when end of list is reached |
| `onEndReachedThreshold` | number | How far from the end to trigger onEndReached |
| `horizontal` | boolean | Whether the list should render horizontally |

## Building Custom Components

You can create custom components that can be controlled by AI agents by using the `withAgentComponent` higher-order component (HOC) or the `useAgentComponent` hook.

### Using the HOC

```jsx
import { withAgentComponent } from '@agentbridge/react-native';
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

function CustomCard({ id, title, description, onTap, isAgentControlled, registerAgentAction }) {
  const [isPressed, setIsPressed] = useState(false);
  
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
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 200);
        if (onTap) onTap();
      }}
      style={[
        styles.card,
        isPressed && styles.cardPressed
      ]}
    >
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPressed: {
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
});

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
import { useAgentComponent } from '@agentbridge/react-native';
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function CustomCard({ id, title, description, onTap }) {
  const [isPressed, setIsPressed] = useState(false);
  
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
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 200);
        if (onTap) onTap();
      }}
      style={[
        styles.card,
        isPressed && styles.cardPressed
      ]}
    >
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPressed: {
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
});
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

## Component Provider

Wrap your application with the `AgentBridgeProvider` to enable agent control:

```jsx
import { AgentBridgeProvider } from '@agentbridge/react-native';

export default function App() {
  return (
    <AgentBridgeProvider apiKey="your-api-key">
      {/* Your application components */}
      <YourComponent />
    </AgentBridgeProvider>
  );
}
```

## Mobile-Specific Features

AgentBridge for React Native provides access to device-specific features:

### Device Vibration

```jsx
import { useAgentBridge } from '@agentbridge/react-native';

function MyComponent() {
  const { registerFunction } = useAgentBridge();
  
  // Register a function to trigger device vibration
  useEffect(() => {
    registerFunction('vibrate', (pattern = 'default') => {
      switch (pattern) {
        case 'short':
          Vibration.vibrate(10);
          break;
        case 'long':
          Vibration.vibrate(500);
          break;
        case 'double':
          Vibration.vibrate([0, 100, 50, 100]);
          break;
        default:
          Vibration.vibrate(100);
      }
      return true;
    });
  }, [registerFunction]);
  
  return (
    // Component content
  );
}
```

### Accessing Device Information

```jsx
import { useAgentBridge } from '@agentbridge/react-native';
import DeviceInfo from 'react-native-device-info';

function MyComponent() {
  const { registerFunction } = useAgentBridge();
  
  // Register a function to get device information
  useEffect(() => {
    registerFunction('getDeviceInfo', async () => {
      return {
        model: DeviceInfo.getModel(),
        brand: DeviceInfo.getBrand(),
        systemVersion: DeviceInfo.getSystemVersion(),
        isTablet: DeviceInfo.isTablet(),
        batteryLevel: await DeviceInfo.getBatteryLevel(),
      };
    });
  }, [registerFunction]);
  
  return (
    // Component content
  );
}
```

## Best Practices

1. **Unique IDs**: Always provide unique IDs for your components
2. **Descriptive Properties**: Make your component properties descriptive for AI agents
3. **Consistent Actions**: Use consistent action names across similar components
4. **Platform Considerations**: Account for platform differences (iOS vs Android)
5. **Performance**: Optimize component rendering to ensure smooth performance
6. **Accessibility**: Ensure your components work with screen readers and other accessibility tools
7. **Error Handling**: Handle errors gracefully in action handlers
8. **TypeScript**: Use TypeScript for better type checking and developer experience

## Next Steps

- Learn about [React Native Hooks](./hooks.md) provided by AgentBridge
- Explore [Mobile SDK Features](../mobile-features.md)
- See [Examples](../../examples/react-native-examples.md) of AgentBridge components in action 