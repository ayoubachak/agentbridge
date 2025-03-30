import 'package:flutter_test/flutter_test.dart';
import 'package:agentbridge_flutter/agentbridge.dart';

void main() {
  group('AgentBridge', () {
    late AgentBridge agentBridge;

    setUp(() {
      agentBridge = AgentBridge();
    });

    test('should initialize correctly', () {
      expect(agentBridge, isNotNull);
    });

    test('should register and unregister functions', () {
      // Register a test function
      agentBridge.registerFunction(
        name: 'testFunction',
        description: 'A test function',
        handler: (params, context) async {
          return {'success': true};
        },
      );

      // Get function definitions
      final functions = agentBridge.getFunctionDefinitions();
      expect(functions, isNotEmpty);
      expect(functions.first['name'], equals('testFunction'));
      expect(functions.first['description'], equals('A test function'));

      // Unregister the function
      agentBridge.unregisterFunction('testFunction');

      // Verify it's gone
      final updatedFunctions = agentBridge.getFunctionDefinitions();
      expect(updatedFunctions, isEmpty);
    });

    test('should call functions and return results', () async {
      // Register a test function
      agentBridge.registerFunction(
        name: 'add',
        description: 'Add two numbers',
        handler: (params, context) async {
          final a = params['a'] as int? ?? 0;
          final b = params['b'] as int? ?? 0;
          return a + b;
        },
      );

      // Call the function
      final result = await agentBridge.callFunction(
        name: 'add',
        params: {'a': 2, 'b': 3},
      );

      // Verify the result
      expect(result['success'], isTrue);
      expect(result['data'], equals(5));
      expect(result['meta'], contains('durationMs'));
    });

    test('should handle function call errors', () async {
      // Call a non-existent function
      final result = await agentBridge.callFunction(
        name: 'nonExistentFunction',
        params: {},
      );

      // Verify the error
      expect(result['success'], isFalse);
      expect(result['error']['code'], equals('FUNCTION_NOT_FOUND'));
    });
  });
}
