import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:agentbridge_flutter/agentbridge.dart';

/// A test wrapper widget that provides an AgentBridgeProvider
class TestAgentBridgeWrapper extends StatelessWidget {
  /// The child widget to wrap
  final Widget child;

  /// Optional bridge instance
  final AgentBridge? bridge;

  /// Optional adapter instance
  final FlutterAdapter? adapter;

  /// Create a new test wrapper
  const TestAgentBridgeWrapper({
    Key? key,
    required this.child,
    this.bridge,
    this.adapter,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        body: AgentBridgeProvider(
          bridge: bridge,
          adapter: adapter,
          child: child,
        ),
      ),
    );
  }
}

/// Create a mock component registry with predefined components
FlutterAdapter createMockAdapter() {
  final bridge = AgentBridge();
  final adapter = FlutterAdapter(bridge: bridge);

  // Register some test components
  adapter.registerComponent('test-button', 'button', {
    'label': 'Test Button',
    'enabled': true,
  });

  adapter.registerComponent('test-input', 'textField', {
    'placeholder': 'Enter text',
    'value': '',
  });

  // Register a test function
  bridge.registerFunction(
    name: 'testFunction',
    description: 'A test function',
    handler: (params, context) async {
      return {'status': 'success', 'message': 'Test function executed'};
    },
  );

  return adapter;
}

/// Helper to validate component registration
Future<void> validateComponentRegistration({
  required WidgetTester tester,
  required String componentId,
  required String componentType,
  required Widget child,
}) async {
  bool didRegister = false;

  // Create a widget that checks for component registration
  await tester.pumpWidget(
    MaterialApp(
      home: AgentBridgeProvider(
        child: Builder(
          builder: (context) {
            // After build, run the check
            WidgetsBinding.instance.addPostFrameCallback((_) {
              final adapter = context.adapter();
              final component = adapter.getComponent(componentId);
              didRegister =
                  component != null && component.type == componentType;
            });

            return child;
          },
        ),
      ),
    ),
  );

  // Wait for the next frame
  await tester.pump();

  // Check if registration worked
  expect(didRegister, isTrue,
      reason: 'Component $componentId was not registered properly');
}
