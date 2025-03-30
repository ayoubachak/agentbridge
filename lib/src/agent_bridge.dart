import 'dart:async';
import 'mcp/interfaces.dart';
import 'mcp/manager.dart';

/// Main AgentBridge class with optional MCP support for Flutter
class AgentBridge {
  // Existing properties would be here in a real implementation
  dynamic registry; // Registry would be properly typed in real implementation
  MCPManager? _mcpManager;
  ComponentTree? _designInfo;

  /// Singleton instance
  static final AgentBridge _instance = AgentBridge._internal();

  /// Factory constructor to return the singleton instance
  factory AgentBridge() => _instance;

  /// Internal constructor
  AgentBridge._internal() {
    // Initialize existing components
    registry = {}; // Mock registry
  }

  /// Get the singleton instance
  static AgentBridge get instance => _instance;

  /// Initialize MCP support if needed
  void _initializeMCP() {
    // Only initialize if MCP support is needed
    _mcpManager ??= MCPManager();
  }

  /// Register an MCP adapter
  ///
  /// This method is optional and only available if MCP support is enabled
  /// [name] Protocol name
  /// [adapter] The MCP adapter
  void registerMCPAdapter(String name, MCPAdapter adapter) {
    _initializeMCP();
    _mcpManager?.registerAdapter(name, adapter);
  }

  /// Get the schema for registered functions in the format required by a specific MCP
  ///
  /// [protocol] The protocol name
  /// Returns the schema in the protocol's format
  Map<String, dynamic> getMCPSchema(String protocol) {
    if (_mcpManager == null) {
      throw Exception('MCP support not enabled');
    }

    return _mcpManager!.getMCPSchema(protocol);
  }

  /// Handle a function call from an MCP
  ///
  /// [protocol] The protocol name
  /// [call] The function call in the protocol's format
  /// Returns the result in the protocol's format
  Future<Map<String, dynamic>> handleMCPFunctionCall(
      String protocol, Map<String, dynamic> call) async {
    if (_mcpManager == null) {
      throw Exception('MCP support not enabled');
    }

    return _mcpManager!.handleMCPFunctionCall(protocol, call, registry);
  }

  /// Register design information for UI components
  ///
  /// [componentTree] The component tree with design information
  void registerDesignInfo(ComponentTree componentTree) {
    _designInfo = componentTree;
  }

  /// Get the component tree with design information
  ///
  /// Returns the component tree
  ComponentTree? getComponentTree() {
    return _designInfo;
  }

  /// Check if MCP support is enabled
  ///
  /// Returns true if MCP support is enabled
  bool hasMCPSupport() {
    return _mcpManager != null;
  }

  /// Get a list of supported MCP protocols
  ///
  /// Returns array of protocol names
  List<String> getSupportedMCPProtocols() {
    if (_mcpManager == null) {
      return [];
    }

    return _mcpManager!.getSupportedProtocols();
  }

  // Other existing methods would be here in a real implementation
}
