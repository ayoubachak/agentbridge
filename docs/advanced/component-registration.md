# Component Registration

This guide explains how to register UI components with AgentBridge to make them discoverable and controllable by AI agents.

## Basic Component Registration

Components need to be registered with AgentBridge to make them available for AI agent interaction.

### JavaScript/TypeScript

```typescript
import { AgentBridge } from '@agentbridge/core';

const agentBridge = new AgentBridge();

// Register a component manually
agentBridge.registerComponent({
  id: 'submit-button',
  type: 'button',
  properties: {
    label: 'Submit',
    disabled: false
  },
  actions: ['click'],
  metadata: {
    section: 'form',
    importance: 'high'
  }
});
```

### Flutter

```dart
import 'package:agentbridge/agentbridge.dart';

void registerComponents() {
  final agentBridge = AgentBridge.instance;
  
  // Register a component manually
  agentBridge.registerComponent(
    ComponentDefinition(
      id: 'submit-button',
      type: 'button',
      properties: {
        'label': 'Submit',
        'disabled': false
      },
      actions: ['click'],
      metadata: {
        'section': 'form',
        'importance': 'high'
      }
    )
  );
}
```

## Automatic Component Registration

AgentBridge provides mixins and wrappers for automatic component registration.

### React

```jsx
import { AgentComponent } from '@agentbridge/react';

// Using the AgentComponent HOC
const SubmitButton = AgentComponent({
  id: 'submit-button',
  type: 'button',
  actions: ['click'],
})(
  ({ onClick, label, disabled }) => (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )
);

// Usage
<SubmitButton 
  label="Submit" 
  disabled={false} 
  onClick={() => handleSubmit()} 
/>
```

### Flutter

```dart
import 'package:agentbridge/agentbridge.dart';

// Using the AgentComponentMixin
class CustomButton extends StatefulWidget with AgentComponentMixin {
  final String id;
  final String label;
  final bool disabled;
  final VoidCallback? onPressed;
  
  CustomButton({
    required this.id,
    required this.label,
    this.disabled = false,
    this.onPressed,
  }) : super(key: ValueKey(id));
  
  @override
  ComponentDefinition getComponentDefinition() {
    return ComponentDefinition(
      id: id,
      type: 'button',
      properties: {
        'label': label,
        'disabled': disabled,
      },
      actions: ['click'],
    );
  }
  
  @override
  State<CustomButton> createState() => _CustomButtonState();
}

class _CustomButtonState extends State<CustomButton> {
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: widget.disabled ? null : widget.onPressed,
      child: Text(widget.label),
    );
  }
}
```

## Component Properties

Components have several key properties:

| Property | Description |
|----------|-------------|
| `id` | Unique identifier for the component |
| `type` | Type of component (button, input, etc.) |
| `properties` | Current state and configuration of the component |
| `actions` | Supported actions the component can perform |
| `metadata` | Additional information about the component |
| `children` | IDs of child components (if applicable) |

## Hierarchical Components

Components can be organized in a hierarchical structure:

```typescript
// Register a parent container
agentBridge.registerComponent({
  id: 'signup-form',
  type: 'form',
  properties: {
    title: 'Sign Up'
  },
  children: ['email-input', 'password-input', 'signup-button']
});

// Register child components
agentBridge.registerComponent({
  id: 'email-input',
  type: 'textfield',
  properties: {
    label: 'Email',
    value: '',
    required: true
  },
  actions: ['input']
});

agentBridge.registerComponent({
  id: 'password-input',
  type: 'textfield',
  properties: {
    label: 'Password',
    value: '',
    required: true,
    secure: true
  },
  actions: ['input']
});

agentBridge.registerComponent({
  id: 'signup-button',
  type: 'button',
  properties: {
    label: 'Sign Up',
    disabled: true
  },
  actions: ['click']
});
```

## Dynamic Component Updates

Keep component registrations up-to-date when properties change:

```typescript
// JavaScript/TypeScript
function updateButtonState(isDisabled) {
  // Update component in registry
  agentBridge.updateComponent('submit-button', {
    properties: {
      disabled: isDisabled
    }
  });
}

// React with hook
import { useAgentComponent } from '@agentbridge/react';

function SubmitButton({ isDisabled, onClick }) {
  // Automatically updates component in registry when props change
  useAgentComponent('submit-button', {
    type: 'button',
    properties: {
      disabled: isDisabled,
      label: 'Submit'
    },
    actions: ['click']
  });
  
  return (
    <button disabled={isDisabled} onClick={onClick}>
      Submit
    </button>
  );
}
```

## Handling Component Actions

Register action handlers for components:

```typescript
// Register action handler
agentBridge.registerActionHandler('submit-button', 'click', async () => {
  // Handle button click
  await submitForm();
  return { success: true };
});

// Or register handler during component registration
agentBridge.registerComponent({
  id: 'submit-button',
  type: 'button',
  properties: {
    label: 'Submit'
  },
  actions: ['click'],
  handlers: {
    click: async () => {
      await submitForm();
      return { success: true };
    }
  }
});
```

## Component Metadata

Add metadata to improve AI agent understanding:

```typescript
agentBridge.registerComponent({
  id: 'submit-button',
  type: 'button',
  properties: {
    label: 'Submit'
  },
  actions: ['click'],
  metadata: {
    description: 'Submits the form data to the server',
    importance: 'high',
    section: 'checkout-form',
    purpose: 'finalize-transaction',
    visibleToUser: true,
    accessibilityLabel: 'Submit payment information',
    position: {
      x: 150,
      y: 300
    }
  }
});
```

## Unregistering Components

Remove components when they're no longer available:

```typescript
// Remove a single component
agentBridge.unregisterComponent('submit-button');

// Remove multiple components
agentBridge.unregisterComponents(['email-input', 'password-input']);

// Clear all components
agentBridge.clearComponents();
```

## Best Practices

1. **Use Unique IDs**: Ensure component IDs are unique and descriptive
2. **Keep Components Updated**: Update component properties when they change
3. **Provide Detailed Metadata**: Include descriptive information in metadata
4. **Organize Hierarchically**: Use parent-child relationships for related components
5. **Clean Up When Done**: Unregister components when they're removed from the UI

## Related Guides

For more information about component interaction and design information collection, see:
- [Design Information Collection](design-info.md)
- [Advanced MCP Usage](mcp-advanced.md) 