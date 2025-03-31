# React Native Components

The AgentBridge React Native SDK provides components and utilities for integrating AI agent control into your mobile applications.

## Higher-Order Component (HOC)

### withAgentBridge

The `withAgentBridge` higher-order component (HOC) makes it easy to register class components with AgentBridge, making them controllable by AI agents.

```jsx
import React, { Component } from 'react';
import { View, Text, Button } from 'react-native';
import { withAgentBridge } from '@agentbridge/react-native';

class Counter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
    };
  }
  
  increment = () => {
    this.setState(prevState => ({
      count: prevState.count + 1
    }));
  };
  
  decrement = () => {
    this.setState(prevState => ({
      count: prevState.count - 1
    }));
  };
  
  reset = () => {
    this.setState({ count: 0 });
  };
  
  render() {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, marginBottom: 20 }}>
          Count: {this.state.count}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Button title="Increment" onPress={this.increment} />
          <Button title="Decrement" onPress={this.decrement} />
          <Button title="Reset" onPress={this.reset} />
        </View>
      </View>
    );
  }
}

// Wrap the component with withAgentBridge
export default withAgentBridge({
  id: 'counter-component',
  componentType: 'counter',
  name: 'Counter Component',
  description: 'A counter that can be incremented, decremented, or reset',
  properties: (props, state) => ({
    count: state.count,
    isEven: state.count % 2 === 0,
    isPositive: state.count > 0,
  }),
  actions: {
    increment: {
      description: 'Increase the counter by 1',
      handler: (component) => {
        component.increment();
        return { 
          success: true, 
          message: 'Counter incremented',
          newValue: component.state.count
        };
      }
    },
    decrement: {
      description: 'Decrease the counter by 1',
      handler: (component) => {
        component.decrement();
        return { 
          success: true, 
          message: 'Counter decremented',
          newValue: component.state.count
        };
      }
    },
    reset: {
      description: 'Reset the counter to 0',
      handler: (component) => {
        component.reset();
        return { 
          success: true, 
          message: 'Counter reset',
          newValue: 0
        };
      }
    }
  }
})(Counter);
```

### HOC Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `id` | string | Unique identifier for the component |
| `componentType` | string | Type of component (e.g., 'counter', 'input', etc.) |
| `name` | string | Display name for the component |
| `description` | string | Description of what the component does |
| `properties` | function | Function that returns component properties from props and state |
| `actions` | object | Object mapping action names to action handlers |
| `tags` | string[] | Optional tags for categorizing the component |

## Pre-built Components

### AgentButton

A button component that can be controlled by AI agents.

```jsx
import { AgentButton } from '@agentbridge/react-native';
import { useRegisterComponent } from '@agentbridge/react-native';

function MyScreen() {
  const handlePress = () => {
    console.log('Button pressed');
  };
  
  const { updateState } = useRegisterComponent({
    id: 'submit-button',
    componentType: 'button',
    name: 'Submit Button',
    description: 'A button for submitting the form',
    properties: {
      label: 'Submit',
      disabled: false
    },
    actions: {
      press: {
        description: 'Press the button',
        handler: () => {
          handlePress();
          return { success: true, message: 'Button pressed' };
        }
      }
    }
  });
  
  return (
    <AgentButton
      title="Submit"
      onPress={handlePress}
      disabled={false}
    />
  );
}
```

### AgentTextInput

A text input component that can be controlled by AI agents.

```jsx
import React, { useState } from 'react';
import { AgentTextInput } from '@agentbridge/react-native';
import { useRegisterComponent } from '@agentbridge/react-native';

function FormField() {
  const [text, setText] = useState('');
  
  const { updateState } = useRegisterComponent({
    id: 'username-input',
    componentType: 'text-input',
    name: 'Username Input',
    description: 'An input field for entering a username',
    properties: {
      value: text,
      placeholder: 'Enter username',
      isValid: text.length >= 3,
      isEmpty: text.length === 0
    },
    actions: {
      type: {
        description: 'Type text into the input',
        handler: (value) => {
          setText(value);
          return { 
            success: true, 
            message: 'Text entered',
            newValue: value
          };
        }
      },
      clear: {
        description: 'Clear the input field',
        handler: () => {
          setText('');
          return { 
            success: true, 
            message: 'Input cleared',
            newValue: ''
          };
        }
      }
    }
  });
  
  // Update state when text changes
  useEffect(() => {
    updateState({
      value: text,
      isValid: text.length >= 3,
      isEmpty: text.length === 0
    });
  }, [text, updateState]);
  
  return (
    <AgentTextInput
      value={text}
      onChangeText={setText}
      placeholder="Enter username"
    />
  );
}
```

## Creating Custom Components

You can create your own custom AgentBridge-aware components using the hooks or HOCs provided by the SDK.

### Function Component with useRegisterComponent

```jsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRegisterComponent } from '@agentbridge/react-native';

function CustomToggle({ id }) {
  const [isOn, setIsOn] = useState(false);
  
  const { updateState } = useRegisterComponent({
    id,
    componentType: 'toggle',
    name: 'Custom Toggle',
    description: 'A custom toggle component',
    properties: {
      isOn,
      label: isOn ? 'ON' : 'OFF'
    },
    actions: {
      toggle: {
        description: 'Toggle the switch',
        handler: () => {
          setIsOn(prev => !prev);
          return { 
            success: true, 
            message: `Toggled to ${!isOn ? 'ON' : 'OFF'}`,
            newValue: !isOn
          };
        }
      },
      turnOn: {
        description: 'Turn the switch on',
        handler: () => {
          setIsOn(true);
          return { 
            success: true, 
            message: 'Turned ON',
            newValue: true
          };
        }
      },
      turnOff: {
        description: 'Turn the switch off',
        handler: () => {
          setIsOn(false);
          return { 
            success: true, 
            message: 'Turned OFF',
            newValue: false
          };
        }
      }
    }
  });
  
  // Update state when isOn changes
  useEffect(() => {
    updateState({
      isOn,
      label: isOn ? 'ON' : 'OFF'
    });
  }, [isOn, updateState]);
  
  return (
    <TouchableOpacity 
      style={[styles.toggle, isOn ? styles.toggleOn : styles.toggleOff]} 
      onPress={() => setIsOn(prev => !prev)}
    >
      <Text style={styles.label}>{isOn ? 'ON' : 'OFF'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toggle: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  toggleOn: {
    backgroundColor: '#4CD964',
  },
  toggleOff: {
    backgroundColor: '#8E8E93',
  },
  label: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CustomToggle;
```

## Best Practices

1. **Unique IDs**: Always use unique IDs for components
2. **Clear Descriptions**: Provide descriptive names and descriptions for components and actions
3. **Meaningful Properties**: Expose properties that are useful for AI agents
4. **Error Handling**: Include error handling in action handlers
5. **Performance**: Be mindful of performance in mobile environments

## Next Steps

- [Learn about React Native hooks](hooks.md)
- [View React Native examples](../../examples/react-native-examples.md)
- [Read about component registration](../../advanced/component-registration.md) 