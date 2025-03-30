# Flutter SDK Overview

The AgentBridge Flutter SDK provides widgets, services, and utilities that integrate the AgentBridge framework with Flutter applications. This SDK makes it easy to expose application functionality and UI components to AI agents in a mobile environment.

## Features

- **Flutter Integration**: Seamless integration with Flutter's widget system
- **State Management**: Uses Flutter's state management for component tracking
- **UI Widgets**: Ready-to-use Flutter widgets that can be controlled by AI agents
- **Mobile-Specific Functions**: Functions tailored for mobile applications (vibration, sensors, etc.)
- **Provider Integration**: Works with Provider for dependency injection
- **Utilities**: Helper classes and mixins for easy integration

## Installation

Add AgentBridge to your Flutter application by adding it to your `pubspec.yaml` file:

```yaml
dependencies:
  agentbridge: ^0.1.0
```

Then run:

```bash
flutter pub get
```

## Basic Setup

To use AgentBridge in your Flutter application, wrap your app with the `AgentBridgeProvider`:

```dart
import 'package:flutter/material.dart';
import 'package:agentbridge/agentbridge.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Create an AgentBridge instance
    final bridge = AgentBridge();
    
    return MaterialApp(
      title: 'AgentBridge Demo',
      home: AgentBridgeProvider(
        bridge: bridge,
        child: MyHomePage(),
      ),
    );
  }
}
```

## Registering Functions

You can register functions that AI agents can call using the `AgentBridge` instance:

```dart
import 'package:flutter/material.dart';
import 'package:agentbridge/agentbridge.dart';

class MyHomePage extends StatefulWidget {
  const MyHomePage({Key? key}) : super(key: key);

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  @override
  void initState() {
    super.initState();
    
    // Get the AgentBridge instance from the provider
    final bridge = context.agentBridge();
    
    // Register a function
    bridge.registerFunction(
      name: 'getDeviceInfo',
      description: 'Get information about the device',
      handler: (params, context) async {
        return {
          'platform': Theme.of(context).platform.toString(),
          'screenSize': {
            'width': MediaQuery.of(context).size.width,
            'height': MediaQuery.of(context).size.height,
          },
          'timestamp': DateTime.now().toIso8601String(),
        };
      },
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AgentBridge Demo'),
      ),
      body: Center(
        child: Text('AgentBridge Flutter Demo'),
      ),
    );
  }
}
```

## Using AgentBridge Widgets

The Flutter SDK provides several widgets that can be controlled by AI agents:

```dart
import 'package:flutter/material.dart';
import 'package:agentbridge/agentbridge.dart';

class MyUIPage extends StatefulWidget {
  const MyUIPage({Key? key}) : super(key: key);

  @override
  _MyUIPageState createState() => _MyUIPageState();
}

class _MyUIPageState extends State<MyUIPage> {
  int _counter = 0;
  String _inputValue = '';
  bool _switchValue = false;
  
  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AgentBridge Widgets'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Using AgentButton
            AgentButton(
              agentId: 'counter-button',
              onPressed: _incrementCounter,
              child: Text('Increment: $_counter'),
            ),
            
            // Using AgentTextField
            AgentTextField(
              agentId: 'text-input',
              initialValue: _inputValue,
              hintText: 'Enter some text',
              onChanged: (value) {
                setState(() {
                  _inputValue = value;
                });
              },
            ),
            
            // Using AgentSwitch
            AgentSwitch(
              agentId: 'toggle-switch',
              initialValue: _switchValue,
              onChanged: (value) {
                setState(() {
                  _switchValue = value;
                });
              },
            ),
            
            // Using AgentDropdown
            AgentDropdown<String>(
              agentId: 'dropdown',
              initialValue: 'option1',
              items: [
                DropdownMenuItem(
                  value: 'option1',
                  child: Text('Option 1'),
                ),
                DropdownMenuItem(
                  value: 'option2',
                  child: Text('Option 2'),
                ),
                DropdownMenuItem(
                  value: 'option3',
                  child: Text('Option 3'),
                ),
              ],
              onChanged: (value) {
                print('Selected: $value');
              },
            ),
          ],
        ),
      ),
    );
  }
}
```

## Using the AgentComponentMixin

For more complex widgets, you can use the `AgentComponentMixin` to create your own components that can be controlled by AI agents:

```dart
import 'package:flutter/material.dart';
import 'package:agentbridge/agentbridge.dart';

class MyCustomWidget extends StatefulWidget {
  final String agentId;
  final String title;
  
  const MyCustomWidget({
    Key? key,
    required this.agentId,
    required this.title,
  }) : super(key: key);
  
  @override
  _MyCustomWidgetState createState() => _MyCustomWidgetState();
}

class _MyCustomWidgetState extends State<MyCustomWidget> with AgentComponentMixin {
  bool _expanded = false;
  
  @override
  String get agentId => widget.agentId;
  
  @override
  String get agentType => 'custom-widget';
  
  @override
  Map<String, dynamic> get agentProps => {
    'title': widget.title,
    'expanded': _expanded,
  };
  
  void _toggleExpanded() {
    setState(() {
      _expanded = !_expanded;
    });
    
    // Update the component state
    updateAgentState({
      'expanded': _expanded,
      'lastToggled': DateTime.now().toIso8601String(),
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(
        children: [
          ListTile(
            title: Text(widget.title),
            trailing: IconButton(
              icon: Icon(_expanded ? Icons.expand_less : Icons.expand_more),
              onPressed: _toggleExpanded,
            ),
          ),
          if (_expanded)
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text('Expanded content here'),
            ),
        ],
      ),
    );
  }
}
```

## Calling Functions

You can call functions registered with AgentBridge from your Flutter code:

```dart
import 'package:flutter/material.dart';
import 'package:agentbridge/agentbridge.dart';

class FunctionCallPage extends StatefulWidget {
  const FunctionCallPage({Key? key}) : super(key: key);

  @override
  _FunctionCallPageState createState() => _FunctionCallPageState();
}

class _FunctionCallPageState extends State<FunctionCallPage> {
  String _result = 'No result yet';
  
  Future<void> _callFunction() async {
    try {
      // Get the adapter from the context
      final adapter = context.adapter();
      
      // Call a function
      final result = await adapter.callFunction(
        'getDeviceInfo',
        {},
      );
      
      setState(() {
        _result = result.data.toString();
      });
    } catch (e) {
      setState(() {
        _result = 'Error: $e';
      });
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Function Call Demo'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              onPressed: _callFunction,
              child: const Text('Call Function'),
            ),
            const SizedBox(height: 20),
            Text('Result: $_result'),
          ],
        ),
      ),
    );
  }
}
```

## Mobile-Specific Features

The Flutter SDK provides mobile-specific features that are not available in the web SDKs:

```dart
import 'package:flutter/material.dart';
import 'package:agentbridge/agentbridge.dart';

class MobileFeaturesPage extends StatefulWidget {
  const MobileFeaturesPage({Key? key}) : super(key: key);

  @override
  _MobileFeaturesPageState createState() => _MobileFeaturesPageState();
}

class _MobileFeaturesPageState extends State<MobileFeaturesPage> {
  @override
  void initState() {
    super.initState();
    
    // Get the AgentBridge instance from the provider
    final bridge = context.agentBridge();
    
    // Register mobile-specific functions
    bridge.registerFunction(
      name: 'vibrate',
      description: 'Make the device vibrate',
      handler: (params, context) async {
        // In a real implementation, we would use HapticFeedback or Vibration plugin
        print('Vibrating device...');
        return { 'success': true };
      },
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mobile Features'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              onPressed: () {
                context.callFunction('vibrate', {});
              },
              child: const Text('Vibrate Device'),
            ),
          ],
        ),
      ),
    );
  }
}
```

## Next Steps

- Learn more about the [Flutter components](components.md)
- Explore the [Core API](../../core/overview.md)
- Learn about [authentication and permissions](../../advanced/authentication.md) 