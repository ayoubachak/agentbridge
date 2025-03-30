import 'dart:convert';
import 'interfaces.dart';

/// OpenAI MCP adapter implementation for Flutter
class OpenAIMCPAdapter implements MCPAdapter {
  /// Registry to access function definitions
  final dynamic registry;

  /// Constructor
  OpenAIMCPAdapter(this.registry);

  @override
  Map<String, dynamic> convertToMCPSchema(Map<String, dynamic> functionDef) {
    return {
      'name': functionDef['name'],
      'description': functionDef['description'] ?? '',
      'parameters': _convertTypeToOpenAISchema(functionDef['parameters']),
    };
  }

  @override
  Map<String, dynamic> convertFromMCPCall(Map<String, dynamic> mcpCall) {
    // Parse arguments from JSON string if needed
    final args = mcpCall['arguments'] is String
        ? jsonDecode(mcpCall['arguments'])
        : mcpCall['arguments'];

    return {
      'name': mcpCall['name'],
      'params': args,
      'context': {}, // Context will be filled in by AgentBridge
    };
  }

  @override
  Map<String, dynamic> mapContext(Map<String, dynamic> context) {
    // OpenAI doesn't have a specific context format
    // This is a placeholder for future extensions
    return {};
  }

  @override
  Map<String, dynamic> mapResponse(Map<String, dynamic> response) {
    // Convert to a format that OpenAI can understand
    // For now, just return the response as JSON
    return {
      'content': jsonEncode(response),
    };
  }

  @override
  Map<String, dynamic> getFunctionSchema() {
    // Get all registered functions from the registry
    final functions = registry.getAllFunctions();

    // Convert each function to OpenAI schema
    final openAIFunctions = functions
        .map<Map<String, dynamic>>((func) => convertToMCPSchema(func))
        .toList();

    // Return in the format expected by OpenAI
    return {
      'tools': openAIFunctions
          .map((func) => {
                'type': 'function',
                'function': func,
              })
          .toList(),
    };
  }

  /// Convert AgentBridge type to OpenAI parameter schema
  Map<String, dynamic> _convertTypeToOpenAISchema(Map<String, dynamic>? type) {
    if (type == null) {
      return {'type': 'object', 'properties': {}};
    }

    switch (type['type']) {
      case 'string':
        return {
          'type': 'string',
          'description': type['description'],
          'enum': type['enum'],
        };

      case 'number':
      case 'integer':
        return {
          'type': type['type'],
          'description': type['description'],
          'minimum': type['min'],
          'maximum': type['max'],
        };

      case 'boolean':
        return {
          'type': 'boolean',
          'description': type['description'],
        };

      case 'array':
        return {
          'type': 'array',
          'description': type['description'],
          'items': type['items'] != null
              ? _convertTypeToOpenAISchema(type['items'])
              : {'type': 'string'},
        };

      case 'object':
      default:
        final properties = <String, dynamic>{};
        final required = <String>[];

        // Convert properties
        if (type['properties'] != null) {
          (type['properties'] as Map<String, dynamic>).forEach((key, propType) {
            properties[key] = _convertTypeToOpenAISchema(propType);

            // Add to required list if necessary
            if (propType['required'] == true) {
              required.add(key);
            }
          });
        }

        // Get required fields from the required array if present
        if (type['required'] != null && type['required'] is List) {
          for (final field in type['required']) {
            if (field is String && !required.contains(field)) {
              required.add(field);
            }
          }
        }

        return {
          'type': 'object',
          'description': type['description'],
          'properties': properties,
          'required': required.isNotEmpty ? required : null,
        };
    }
  }
}
