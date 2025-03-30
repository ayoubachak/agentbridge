import 'package:flutter_test/flutter_test.dart';
import 'package:agentbridge_flutter/agentbridge.dart';

void main() {
  group('FlutterAdapter', () {
    late AgentBridge agentBridge;
    late FlutterAdapter adapter;

    setUp(() {
      agentBridge = AgentBridge();
      adapter = FlutterAdapter(bridge: agentBridge);
    });

    test('should initialize correctly', () {
      expect(adapter, isNotNull);
      expect(adapter.isInitialized, isTrue);
    });

    test('should register and unregister components', () {
      // Register a component
      adapter.registerComponent('test-button', 'button', {
        'label': 'Test Button',
        'enabled': true,
      });

      // Verify it was registered
      final component = adapter.getComponent('test-button');
      expect(component, isNotNull);
      expect(component?.id, equals('test-button'));
      expect(component?.type, equals('button'));
      expect(component?.props['label'], equals('Test Button'));
      expect(component?.props['enabled'], isTrue);

      // Unregister the component
      adapter.unregisterComponent('test-button');

      // Verify it's gone
      final removedComponent = adapter.getComponent('test-button');
      expect(removedComponent, isNull);
    });

    test('should update component state', () {
      // Register a component
      adapter.registerComponent('test-input', 'textField', {
        'placeholder': 'Enter value',
      });

      // Update state
      adapter.updateComponentState('test-input', {
        'value': 'Hello World',
        'isFocused': true,
      });

      // Verify state was updated
      final component = adapter.getComponent('test-input');
      expect(component?.state['value'], equals('Hello World'));
      expect(component?.state['isFocused'], isTrue);
    });

    test('should call functions', () async {
      // Register a function
      agentBridge.registerFunction(
        name: 'greet',
        description: 'Greet someone',
        handler: (params, context) async {
          final name = params['name'] as String? ?? 'Anonymous';
          return 'Hello, $name!';
        },
      );

      // Call the function
      final result = await adapter.callFunction(
        'greet',
        {'name': 'World'},
      );

      // Verify the result
      expect(result.success, isTrue);
      expect(result.data, equals('Hello, World!'));
    });
  });
}
