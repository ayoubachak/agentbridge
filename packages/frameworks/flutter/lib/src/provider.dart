import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'agent_bridge.dart';
import 'adapter.dart';

/// Provider widget for AgentBridge in Flutter applications
class AgentBridgeProvider extends StatefulWidget {
  /// Child widget
  final Widget child;

  /// Optional custom AgentBridge instance
  final AgentBridge? bridge;

  /// Optional custom adapter
  final FlutterAdapter? adapter;

  /// Create a new AgentBridgeProvider
  const AgentBridgeProvider({
    Key? key,
    required this.child,
    this.bridge,
    this.adapter,
  }) : super(key: key);

  @override
  _AgentBridgeProviderState createState() => _AgentBridgeProviderState();
}

class _AgentBridgeProviderState extends State<AgentBridgeProvider> {
  late AgentBridge _bridge;
  late FlutterAdapter _adapter;

  @override
  void initState() {
    super.initState();

    // Initialize with provided instances or create new ones
    _bridge = widget.bridge ?? AgentBridge();
    _adapter = widget.adapter ?? FlutterAdapter(bridge: _bridge);
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<AgentBridge>.value(value: _bridge),
        ChangeNotifierProvider<FlutterAdapter>.value(value: _adapter),
      ],
      child: widget.child,
    );
  }
}

/// Extension method for easily accessing AgentBridge in widgets
extension AgentBridgeContext on BuildContext {
  /// Get the AgentBridge instance
  AgentBridge agentBridge() => Provider.of<AgentBridge>(this, listen: false);

  /// Get the FlutterAdapter instance
  FlutterAdapter adapter() => Provider.of<FlutterAdapter>(this, listen: false);

  /// Register a component with AgentBridge
  void registerComponent(String id, String type,
      [Map<String, dynamic> props = const {}]) {
    adapter().registerComponent(id, type, props);
  }

  /// Unregister a component with AgentBridge
  void unregisterComponent(String id) {
    adapter().unregisterComponent(id);
  }

  /// Update a component's state
  void updateComponentState(String id, Map<String, dynamic> state) {
    adapter().updateComponentState(id, state);
  }

  /// Call a function registered with AgentBridge
  Future<FunctionCallResult> callFunction(
    String name,
    Map<String, dynamic> params, [
    Map<String, dynamic> context = const {},
  ]) {
    return adapter().callFunction(name, params, context);
  }
}
