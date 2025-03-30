import 'dart:async';
import 'interfaces.dart';

/// Manages Model Context Protocol adapters for Flutter
class MCPManager {
  /// Map of protocol names to adapters
  final Map<String, MCPAdapter> _adapters = {};

  /// Register an MCP adapter
  ///
  /// [name] The name of the protocol (e.g., 'openai', 'anthropic')
  /// [adapter] The adapter implementation
  void registerAdapter(String name, MCPAdapter adapter) {
    _adapters[name.toLowerCase()] = adapter;
  }

  /// Get an MCP adapter by name
  ///
  /// [name] The name of the protocol
  /// Returns the adapter for the specified protocol
  /// Throws an exception if the adapter is not found
  MCPAdapter getAdapter(String name) {
    final adapter = _adapters[name.toLowerCase()];
    if (adapter == null) {
      throw Exception("MCP adapter '$name' not found");
    }
    return adapter;
  }

  /// Get the schema for all registered functions in the format required by a specific protocol
  ///
  /// [protocol] The name of the protocol
  /// Returns the schema in the protocol's format
  Map<String, dynamic> getMCPSchema(String protocol) {
    final adapter = getAdapter(protocol);
    return adapter.getFunctionSchema();
  }

  /// Handle a function call from an MCP
  ///
  /// [protocol] The name of the protocol
  /// [mcpCall] The function call in the protocol's format
  /// [registry] The function registry to execute the function
  /// Returns the result in the protocol's format
  Future<Map<String, dynamic>> handleMCPFunctionCall(
      String protocol, Map<String, dynamic> mcpCall, dynamic registry) async {
    final adapter = getAdapter(protocol);

    // Convert the MCP call to an AgentBridge function call request
    final request = adapter.convertFromMCPCall(mcpCall);

    // Execute the function
    // Note: This implementation assumes that the registry provides a method to execute functions
    // The actual implementation will depend on the AgentBridge core structure
    final result = await registry.executeFunction(
        request['name'], request['params'], request['context']);

    // Convert the result back to the MCP format
    return adapter.mapResponse(result);
  }

  /// Get a list of supported protocols
  ///
  /// Returns array of protocol names
  List<String> getSupportedProtocols() {
    return _adapters.keys.toList();
  }
}
