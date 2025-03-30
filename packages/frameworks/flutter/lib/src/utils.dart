import 'dart:async';
import 'package:flutter/widgets.dart';
import 'package:provider/provider.dart';

import 'agent_bridge.dart';
import 'adapter.dart';

/// Create a new AgentBridge instance with default configuration
AgentBridge createAgentBridge() {
  return AgentBridge();
}

/// Mixin for tracking component lifecycle and automatically registering with AgentBridge
mixin AgentComponentMixin<T extends StatefulWidget> on State<T> {
  /// Unique ID for the component
  String get agentId;

  /// Component type
  String get agentType;

  /// Additional properties to expose to the AI agent
  Map<String, dynamic> get agentProps => {};

  /// Get the FlutterAdapter instance
  FlutterAdapter? _getAdapter() {
    try {
      return Provider.of<FlutterAdapter>(context, listen: false);
    } catch (e) {
      debugPrint('Error getting adapter: $e');
      return null;
    }
  }

  @override
  void initState() {
    super.initState();

    // Register the component with AgentBridge
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final adapter = _getAdapter();
      if (adapter != null) {
        adapter.registerComponent(agentId, agentType, agentProps);
      }
    });
  }

  @override
  void dispose() {
    // Unregister the component with AgentBridge
    final adapter = _getAdapter();
    if (adapter != null) {
      adapter.unregisterComponent(agentId);
    }

    super.dispose();
  }

  /// Update the component's state
  void updateAgentState(Map<String, dynamic> state) {
    final adapter = _getAdapter();
    if (adapter != null) {
      adapter.updateComponentState(agentId, state);
    }
  }
}

/// Interface for components that can be controlled by AI agents
abstract class AgentComponent {
  /// Unique ID for the component
  String get agentId;

  /// Component type
  String get agentType;

  /// Additional properties to expose to the AI agent
  Map<String, dynamic> get agentProps;
}

/// Debounce utility for limiting how often a function is called
class Debouncer {
  /// Duration to wait before calling the function
  final Duration delay;

  /// Timer for the debounce
  Timer? _timer;

  /// Create a new Debouncer
  Debouncer({required this.delay});

  /// Call the function after the delay
  void run(void Function() action) {
    _timer?.cancel();
    _timer = Timer(delay, action);
  }

  /// Cancel the debounce
  void cancel() {
    _timer?.cancel();
  }
}
