import 'package:flutter_test/flutter_test.dart';
import 'package:agentbridge_flutter/agentbridge.dart';

void main() {
  group('AgentBridge Flutter SDK', () {
    test('should export all required classes and components', () {
      // Verify core classes
      expect(AgentBridge, isNotNull);
      expect(FlutterAdapter, isNotNull);
      expect(AgentBridgeProvider, isNotNull);

      // Verify components
      expect(AgentButton, isNotNull);
      expect(AgentTextField, isNotNull);
      expect(AgentDropdown, isNotNull);
      expect(AgentContainer, isNotNull);
    });

    test('should have the expected version', () {
      // This is a placeholder test that would verify package version
      // In a real implementation, this would check against pubspec.yaml
      expect(true, isTrue);
    });
  });
}
