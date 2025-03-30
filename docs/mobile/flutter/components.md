# Flutter Components

This page documents all the UI components available in the AgentBridge Flutter SDK. These components are designed to be easily controlled by AI agents while providing a native Flutter experience.

## Core Components

The AgentBridge Flutter SDK provides several ready-to-use components that can be controlled by AI agents:

### AgentButton

A button component that can be controlled by AI agents.

```dart
AgentButton(
  id: 'submit-button',
  label: 'Submit',
  onPressed: () {
    // Your action here
  },
  style: AgentButtonStyle(
    backgroundColor: Colors.blue,
    textColor: Colors.white,
    borderRadius: 8.0,
    padding: const EdgeInsets.symmetric(
      horizontal: 16.0, 
      vertical: 8.0
    ),
  ),
)
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | String | Unique identifier for the button |
| `label` | String | Text to display on the button |
| `onPressed` | Function | Callback function when button is pressed |
| `style` | AgentButtonStyle | Style configuration for the button |
| `disabled` | bool | Whether the button is disabled |
| `loading` | bool | Whether to show a loading indicator |
| `icon` | Icon | Optional icon to display with the button |
| `iconPosition` | IconPosition | Position of the icon (left or right) |

### AgentTextField

A text field component that can be controlled by AI agents.

```dart
AgentTextField(
  id: 'email-input',
  label: 'Email Address',
  placeholder: 'Enter your email',
  onChanged: (value) {
    // Handle text change
  },
  onSubmitted: (value) {
    // Handle submission
  },
  keyboardType: TextInputType.emailAddress,
  style: AgentTextFieldStyle(
    borderColor: Colors.grey,
    focusedBorderColor: Colors.blue,
    borderRadius: 4.0,
  ),
)
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | String | Unique identifier for the text field |
| `label` | String | Label text for the field |
| `placeholder` | String | Placeholder text when empty |
| `value` | String | Current value of the text field |
| `onChanged` | Function(String) | Callback when text changes |
| `onSubmitted` | Function(String) | Callback when the enter key is pressed |
| `keyboardType` | TextInputType | Type of keyboard to show |
| `obscureText` | bool | Whether to hide the text (for passwords) |
| `maxLines` | int | Maximum number of lines to show |
| `minLines` | int | Minimum number of lines to show |
| `maxLength` | int | Maximum length of the text |
| `enabled` | bool | Whether the text field is enabled |
| `style` | AgentTextFieldStyle | Style configuration for the text field |

### AgentSwitch

A switch component that can be toggled on or off by AI agents.

```dart
AgentSwitch(
  id: 'notifications-switch',
  label: 'Enable Notifications',
  value: notificationsEnabled,
  onChanged: (newValue) {
    setState(() {
      notificationsEnabled = newValue;
    });
  },
  style: AgentSwitchStyle(
    activeColor: Colors.green,
    inactiveColor: Colors.grey,
  ),
)
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | String | Unique identifier for the switch |
| `label` | String | Label text for the switch |
| `value` | bool | Current state of the switch |
| `onChanged` | Function(bool) | Callback when switch value changes |
| `disabled` | bool | Whether the switch is disabled |
| `style` | AgentSwitchStyle | Style configuration for the switch |

### AgentDropdown

A dropdown component that allows selection from a list of options.

```dart
AgentDropdown<String>(
  id: 'country-dropdown',
  label: 'Select Country',
  value: selectedCountry,
  items: countries.map((country) => 
    AgentDropdownItem(
      value: country,
      label: country,
    )
  ).toList(),
  onChanged: (newValue) {
    setState(() {
      selectedCountry = newValue;
    });
  },
  style: AgentDropdownStyle(
    borderColor: Colors.grey,
    borderRadius: 4.0,
  ),
)
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | String | Unique identifier for the dropdown |
| `label` | String | Label text for the dropdown |
| `value` | T | Currently selected value |
| `items` | List<AgentDropdownItem<T>> | List of dropdown items |
| `onChanged` | Function(T) | Callback when selection changes |
| `hint` | String | Hint text when no item is selected |
| `disabled` | bool | Whether the dropdown is disabled |
| `style` | AgentDropdownStyle | Style configuration for the dropdown |

### AgentCheckbox

A checkbox component that can be checked or unchecked by AI agents.

```dart
AgentCheckbox(
  id: 'terms-checkbox',
  label: 'I agree to the terms and conditions',
  value: termsAccepted,
  onChanged: (newValue) {
    setState(() {
      termsAccepted = newValue;
    });
  },
  style: AgentCheckboxStyle(
    activeColor: Colors.blue,
    checkColor: Colors.white,
  ),
)
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | String | Unique identifier for the checkbox |
| `label` | String | Label text for the checkbox |
| `value` | bool | Current state of the checkbox |
| `onChanged` | Function(bool) | Callback when checkbox value changes |
| `disabled` | bool | Whether the checkbox is disabled |
| `style` | AgentCheckboxStyle | Style configuration for the checkbox |

### AgentSlider

A slider component that can be adjusted by AI agents.

```dart
AgentSlider(
  id: 'volume-slider',
  label: 'Volume',
  value: volume,
  min: 0.0,
  max: 100.0,
  divisions: 10,
  onChanged: (newValue) {
    setState(() {
      volume = newValue;
    });
  },
  style: AgentSliderStyle(
    activeColor: Colors.blue,
    inactiveColor: Colors.grey,
  ),
)
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | String | Unique identifier for the slider |
| `label` | String | Label text for the slider |
| `value` | double | Current value of the slider |
| `min` | double | Minimum value of the slider |
| `max` | double | Maximum value of the slider |
| `divisions` | int | Number of discrete divisions |
| `onChanged` | Function(double) | Callback when slider value changes |
| `disabled` | bool | Whether the slider is disabled |
| `style` | AgentSliderStyle | Style configuration for the slider |

## Building Custom Components

You can create custom components that can be controlled by AI agents by using the `AgentComponentMixin`. Here's how to create a custom component:

### Creating a Custom Component

```dart
class CustomAgentCard extends StatefulWidget with AgentComponentMixin {
  final String id;
  final String title;
  final String description;
  final VoidCallback? onTap;
  
  CustomAgentCard({
    required this.id,
    required this.title,
    this.description = '',
    this.onTap,
  }) : super(id: id);
  
  @override
  _CustomAgentCardState createState() => _CustomAgentCardState();
  
  @override
  Map<String, dynamic> getAgentProperties() {
    return {
      'title': title,
      'description': description,
      'canTap': onTap != null,
    };
  }
  
  @override
  List<String> getAgentActions() {
    return ['tap'];
  }
  
  @override
  Future<dynamic> handleAgentAction(String action, Map<String, dynamic> params) async {
    if (action == 'tap' && onTap != null) {
      onTap!();
      return true;
    }
    return false;
  }
}

class _CustomAgentCardState extends State<CustomAgentCard> {
  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: widget.onTap,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.title,
                style: Theme.of(context).textTheme.headline6,
              ),
              if (widget.description.isNotEmpty)
                Text(
                  widget.description,
                  style: Theme.of(context).textTheme.bodyText2,
                ),
            ],
          ),
        ),
      ),
    );
  }
}
```

### Using the Custom Component

```dart
CustomAgentCard(
  id: 'feature-card',
  title: 'Premium Feature',
  description: 'Unlock this feature by upgrading your account',
  onTap: () {
    // Handle tap
  },
)
```

## Component Registration

All components using `AgentComponentMixin` are automatically registered with the AgentBridge registry when they are rendered. This makes them discoverable and controllable by AI agents.

## Best Practices

1. **Unique IDs**: Always provide unique IDs for your components
2. **Descriptive Properties**: Make your component properties descriptive for AI agents
3. **Consistent Actions**: Use consistent action names across similar components
4. **Proper State Management**: Update your component state properly when actions are triggered
5. **Accessibility**: Ensure your components are accessible to all users
6. **Error Handling**: Handle errors gracefully in action handlers

## Next Steps

- Learn about the [AgentBridge Flutter API](../flutter-api.md)
- Explore [Mobile-Specific Features](../mobile-features.md)
- See [Examples](../../examples/flutter-examples.md) of AgentBridge components in action 