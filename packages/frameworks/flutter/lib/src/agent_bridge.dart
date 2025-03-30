import 'dart:async';

import 'package:uuid/uuid.dart';

/// Function handler type
typedef FunctionHandler = Future<dynamic> Function(
  Map<String, dynamic> params,
  Map<String, dynamic> context,
);

/// Core AgentBridge class for Flutter
class AgentBridge {
  /// Registered functions
  final Map<String, _Function> _functions = {};

  /// Create a new AgentBridge instance
  AgentBridge();

  /// Register a function with AgentBridge
  void registerFunction({
    required String name,
    required String description,
    required FunctionHandler handler,
    Map<String, dynamic> options = const {},
  }) {
    if (_functions.containsKey(name)) {
      throw Exception('Function with name "$name" is already registered');
    }

    _functions[name] = _Function(
      name: name,
      description: description,
      handler: handler,
      options: options,
    );
  }

  /// Unregister a function by name
  void unregisterFunction(String name) {
    _functions.remove(name);
  }

  /// Call a function by name
  Future<Map<String, dynamic>> callFunction({
    required String name,
    required Map<String, dynamic> params,
    Map<String, dynamic> context = const {},
  }) async {
    final startTime = DateTime.now();
    final requestId = const Uuid().v4();

    try {
      // Get function implementation
      final func = _functions[name];
      if (func == null) {
        return _createErrorResult(
          'FUNCTION_NOT_FOUND',
          'Function "$name" not found',
          startTime,
        );
      }

      // Check authorization if needed
      final authLevel = func.options['authLevel'] as String?;
      if (authLevel != null && authLevel != 'public') {
        final user = context['user'] as Map<String, dynamic>?;
        if (user == null) {
          return _createErrorResult(
            'UNAUTHORIZED',
            'Authentication required',
            startTime,
          );
        }

        if (authLevel == 'admin') {
          final roles = user['roles'] as List<String>?;
          if (roles == null || !roles.contains('admin')) {
            return _createErrorResult(
              'FORBIDDEN',
              'Admin privileges required',
              startTime,
            );
          }
        }
      }

      // Build execution context
      final executionContext = {
        ...context,
        'request': {
          'id': requestId,
          'timestamp': startTime.toIso8601String(),
          'ip': context['ip'],
        },
      };

      // Execute function
      final result = await func.handler(params, executionContext);

      // Return successful result
      return _createSuccessResult(
        result,
        startTime,
      );
    } catch (e) {
      // Return error result
      return _createErrorResult(
        'EXECUTION_ERROR',
        'Error executing function: ${e.toString()}',
        startTime,
      );
    }
  }

  /// Create a success result
  Map<String, dynamic> _createSuccessResult(
    dynamic data,
    DateTime startTime,
  ) {
    final endTime = DateTime.now();
    final durationMs = endTime.difference(startTime).inMilliseconds;

    return {
      'success': true,
      'data': data,
      'meta': {
        'durationMs': durationMs,
        'startedAt': startTime.toIso8601String(),
        'completedAt': endTime.toIso8601String(),
      },
    };
  }

  /// Create an error result
  Map<String, dynamic> _createErrorResult(
    String code,
    String message,
    DateTime startTime, [
    dynamic details,
  ]) {
    final endTime = DateTime.now();
    final durationMs = endTime.difference(startTime).inMilliseconds;

    return {
      'success': false,
      'error': {
        'code': code,
        'message': message,
        if (details != null) 'details': details,
      },
      'meta': {
        'durationMs': durationMs,
        'startedAt': startTime.toIso8601String(),
        'completedAt': endTime.toIso8601String(),
      },
    };
  }

  /// Get all registered functions
  List<Map<String, dynamic>> getFunctionDefinitions() {
    return _functions.values.map((func) => func.toJson()).toList();
  }

  /// Query functions that match certain criteria
  List<Map<String, dynamic>> queryFunctions({
    List<String>? tags,
    String? authLevel,
  }) {
    return _functions.values
        .where((func) {
          // Filter by auth level if specified
          if (authLevel != null) {
            final funcAuthLevel =
                func.options['authLevel'] as String? ?? 'public';
            if (funcAuthLevel != authLevel) {
              return false;
            }
          }

          // Filter by tags if specified
          if (tags != null && tags.isNotEmpty) {
            final funcTags = func.options['tags'] as List<String>? ?? [];
            if (funcTags.isEmpty) {
              return false;
            }

            // Check if any of the query tags match the function tags
            return tags.any((tag) => funcTags.contains(tag));
          }

          return true;
        })
        .map((func) => func.toJson())
        .toList();
  }
}

/// Function implementation
class _Function {
  /// Function name
  final String name;

  /// Function description
  final String description;

  /// Function handler
  final FunctionHandler handler;

  /// Additional options
  final Map<String, dynamic> options;

  /// Create a new Function
  _Function({
    required this.name,
    required this.description,
    required this.handler,
    this.options = const {},
  });

  /// Convert to a JSON representation
  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'description': description,
      'options': options,
    };
  }
}
