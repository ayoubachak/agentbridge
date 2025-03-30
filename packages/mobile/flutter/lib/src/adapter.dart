import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';

import 'agent_bridge.dart';

/// Information about a component registered with AgentBridge
class ComponentInfo {
  /// Unique identifier for the component
  final String id;

  /// Type of the component (e.g., 'button', 'textField')
  final String type;

  /// Additional properties for the component
  final Map<String, dynamic> props;

  /// Current state of the component
  Map<String, dynamic> state;

  /// Create a new ComponentInfo
  ComponentInfo({
    required this.id,
    required this.type,
    this.props = const {},
    this.state = const {},
  });

  /// Convert to a JSON representation
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'props': props,
      'state': state,
    };
  }
}

/// Result of a function call
class FunctionCallResult {
  /// Whether the function call was successful
  final bool success;

  /// Result data if successful
  final dynamic data;

  /// Error information if unsuccessful
  final Map<String, dynamic>? error;

  /// Execution metadata
  final Map<String, dynamic> meta;

  /// Create a new FunctionCallResult
  FunctionCallResult({
    required this.success,
    this.data,
    this.error,
    required this.meta,
  });

  /// Create a successful result
  factory FunctionCallResult.success(dynamic data) {
    final now = DateTime.now();
    return FunctionCallResult(
      success: true,
      data: data,
      meta: {
        'durationMs': 0,
        'startedAt': now.toIso8601String(),
        'completedAt': now.toIso8601String(),
      },
    );
  }

  /// Create an error result
  factory FunctionCallResult.error(String code, String message,
      [dynamic details]) {
    final now = DateTime.now();
    return FunctionCallResult(
      success: false,
      error: {
        'code': code,
        'message': message,
        if (details != null) 'details': details,
      },
      meta: {
        'durationMs': 0,
        'startedAt': now.toIso8601String(),
        'completedAt': now.toIso8601String(),
      },
    );
  }

  /// Convert to a JSON representation
  Map<String, dynamic> toJson() {
    return {
      'success': success,
      if (data != null) 'data': data,
      if (error != null) 'error': error,
      'meta': meta,
    };
  }
}

/// Adapter for integrating AgentBridge with Flutter applications
class FlutterAdapter extends ChangeNotifier {
  /// AgentBridge instance
  final AgentBridge bridge;

  /// Registered components
  final Map<String, ComponentInfo> _components = {};

  /// Whether the adapter has been initialized
  bool _isInitialized = false;

  /// Create a new FlutterAdapter
  FlutterAdapter({required this.bridge}) {
    _initialize();
  }

  /// Whether the adapter has been initialized
  bool get isInitialized => _isInitialized;

  /// Initialize the adapter with the bridge
  void _initialize() {
    _registerBuiltInFunctions();
    _isInitialized = true;
    notifyListeners();
  }

  /// Register built-in functions
  void _registerBuiltInFunctions() {
    // Function to get device information
    bridge.registerFunction(
      name: 'getDeviceInfo',
      description: 'Get information about the device',
      handler: (params, context) async {
        return {
          'platform': defaultTargetPlatform.toString(),
          'timestamp': DateTime.now().toIso8601String(),
        };
      },
    );

    // Function to get all registered components
    bridge.registerFunction(
      name: 'getComponents',
      description: 'Get all registered components',
      handler: (params, context) async {
        return _components.values.map((info) => info.toJson()).toList();
      },
    );

    // Function to update a component's state
    bridge.registerFunction(
      name: 'updateComponentState',
      description: 'Update the state of a UI component',
      handler: (params, context) async {
        final componentId = params['componentId'] as String?;
        final state = params['state'] as Map<String, dynamic>?;

        if (componentId == null || state == null) {
          return FunctionCallResult.error(
            'INVALID_PARAMETERS',
            'Missing required parameters: componentId and state',
          );
        }

        if (!_components.containsKey(componentId)) {
          return FunctionCallResult.error(
            'COMPONENT_NOT_FOUND',
            'Component with ID "$componentId" not found',
          );
        }

        updateComponentState(componentId, state);
        return FunctionCallResult.success({'success': true});
      },
    );

    // Function to trigger events on components
    bridge.registerFunction(
      name: 'triggerComponentEvent',
      description: 'Trigger an event on a UI component',
      handler: (params, context) async {
        final componentId = params['componentId'] as String?;
        final event = params['event'] as String?;
        final payload = params['payload'] as Map<String, dynamic>?;

        if (componentId == null || event == null) {
          return FunctionCallResult.error(
            'INVALID_PARAMETERS',
            'Missing required parameters: componentId and event',
          );
        }

        if (!_components.containsKey(componentId)) {
          return FunctionCallResult.error(
            'COMPONENT_NOT_FOUND',
            'Component with ID "$componentId" not found',
          );
        }

        // Trigger the event
        final updatedState = {
          ..._components[componentId]!.state,
          'lastEvent': {
            'type': event,
            'payload': payload,
            'timestamp': DateTime.now().toIso8601String(),
          },
        };

        updateComponentState(componentId, updatedState);

        return FunctionCallResult.success({
          'success': true,
          'componentId': componentId,
          'event': event,
        });
      },
    );

    // Mobile-specific functions
    bridge.registerFunction(
      name: 'vibrate',
      description: 'Make the device vibrate',
      handler: (params, context) async {
        // In a real implementation, we would use Flutter's HapticFeedback or Vibration plugin
        debugPrint('Vibrating device...');
        return FunctionCallResult.success({'success': true});
      },
      options: {
        'authLevel': 'user',
        'tags': ['device', 'haptic']
      },
    );
  }

  /// Register a component with AgentBridge
  void registerComponent(String id, String type,
      [Map<String, dynamic> props = const {}]) {
    if (_components.containsKey(id)) {
      debugPrint(
          'Component with ID "$id" is already registered. It will be overwritten.');
    }

    _components[id] = ComponentInfo(
      id: id,
      type: type,
      props: props,
      state: {},
    );

    notifyListeners();
  }

  /// Unregister a component
  void unregisterComponent(String id) {
    _components.remove(id);
    notifyListeners();
  }

  /// Update a component's state
  void updateComponentState(String id, Map<String, dynamic> state) {
    if (!_components.containsKey(id)) {
      debugPrint('Cannot update state: Component with ID "$id" not found');
      return;
    }

    _components[id]!.state = {
      ..._components[id]!.state,
      ...state,
    };

    notifyListeners();
  }

  /// Get a component by ID
  ComponentInfo? getComponent(String id) {
    return _components[id];
  }

  /// Get all registered components
  List<ComponentInfo> getAllComponents() {
    return _components.values.toList();
  }

  /// Call a function registered with AgentBridge
  Future<FunctionCallResult> callFunction(
    String name,
    Map<String, dynamic> params, [
    Map<String, dynamic> context = const {},
  ]) async {
    try {
      final result = await bridge.callFunction(
        name: name,
        params: params,
        context: context,
      );

      return FunctionCallResult(
        success: result['success'] as bool,
        data: result['data'],
        error: result['error'] as Map<String, dynamic>?,
        meta: result['meta'] as Map<String, dynamic>,
      );
    } catch (e) {
      return FunctionCallResult.error(
        'EXECUTION_ERROR',
        'Error executing function: ${e.toString()}',
      );
    }
  }
}
