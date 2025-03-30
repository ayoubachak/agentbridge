# Flutter API Reference

This page provides detailed API reference for the AgentBridge Flutter SDK.

## Core Classes

### AgentBridge

The main class for interacting with AgentBridge in Flutter applications.

```dart
class AgentBridge {
  /// Singleton instance
  static final AgentBridge instance = AgentBridge._();
  
  /// Private constructor for singleton
  AgentBridge._();
  
  /// Initialize with configuration
  Future<void> initialize({
    required AgentBridgeConfig config,
  }) async {
    // Initialization logic
  }
  
  /// Register a function that can be called by AI agents
  void registerFunction({
    required String name,
    required String description,
    required Map<String, dynamic> parameters,
    required Future<dynamic> Function(Map<String, dynamic>) handler,
  }) {
    // Registration logic
  }
  
  /// Execute a function by name with parameters
  Future<dynamic> executeFunction(
    String name,
    Map<String, dynamic> params,
  ) async {
    // Execution logic
  }
  
  /// Register a UI component
  void registerComponent(ComponentDefinition component) {
    // Component registration logic
  }
  
  /// Register design information
  void registerDesignInfo(Map<String, dynamic> designInfo) {
    // Design info registration logic
  }
  
  /// Register an MCP adapter
  void registerMCPAdapter(String type, MCPAdapter adapter) {
    // MCP adapter registration logic
  }
  
  /// Get schema for a specific MCP type
  Map<String, dynamic> getMCPSchema(String type) {
    // Schema retrieval logic
  }
  
  /// Handle an MCP function call
  Future<dynamic> handleMCPFunctionCall(
    String type,
    Map<String, dynamic> functionCall,
  ) async {
    // Function call handling logic
  }
}
```

### AgentBridgeConfig

Configuration for the AgentBridge instance.

```dart
class AgentBridgeConfig {
  /// App ID for the AgentBridge service
  final String appId;
  
  /// API key for authentication
  final String apiKey;
  
  /// Environment to use (development, production)
  final String environment;
  
  /// Whether to enable debug logging
  final bool debug;
  
  /// Custom endpoint for AgentBridge service
  final String? endpoint;
  
  AgentBridgeConfig({
    required this.appId,
    required this.apiKey,
    this.environment = 'production',
    this.debug = false,
    this.endpoint,
  });
}
```

### ComponentDefinition

Defines a UI component for registration with AgentBridge.

```dart
class ComponentDefinition {
  /// Unique identifier for the component
  final String id;
  
  /// Type of component (button, textfield, etc.)
  final String type;
  
  /// Properties of the component
  final Map<String, dynamic> properties;
  
  /// Actions supported by the component
  final List<String> actions;
  
  /// Additional metadata about the component
  final Map<String, dynamic>? metadata;
  
  /// IDs of child components
  final List<String>? children;
  
  ComponentDefinition({
    required this.id,
    required this.type,
    required this.properties,
    required this.actions,
    this.metadata,
    this.children,
  });
  
  /// Convert to JSON representation
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'properties': properties,
      'actions': actions,
      if (metadata != null) 'metadata': metadata,
      if (children != null) 'children': children,
    };
  }
}
```

## Mixins

### AgentComponentMixin

Mixin for Flutter widgets to make them automatically register with AgentBridge.

```dart
mixin AgentComponentMixin on StatefulWidget {
  /// Get the component definition for this widget
  ComponentDefinition getComponentDefinition();
  
  @override
  State<StatefulWidget> createState() {
    // Create state and handle registration
  }
}
```

## Design Collection

### FlutterDesignCollector

Collects design information from Flutter widgets.

```dart
class FlutterDesignCollector {
  /// Configuration options for design collection
  final CaptureOptions captureOptions;
  
  FlutterDesignCollector({
    this.captureOptions = const CaptureOptions(),
  });
  
  /// Capture design information from the current context
  Map<String, dynamic> captureDesignInfo(BuildContext context) {
    // Capture logic
    return {};
  }
  
  /// Enable or disable debug mode
  void setDebugMode(bool enabled) {
    // Debug mode logic
  }
  
  /// Visualize component boundaries (debug only)
  void visualizeComponents(BuildContext context) {
    // Visualization logic
  }
}
```

### CaptureOptions

Options for design information capture.

```dart
class CaptureOptions {
  /// Whether to include styling information
  final bool includeStyles;
  
  /// Whether to include disabled components
  final bool includeDisabledComponents;
  
  /// Whether to include hidden components
  final bool includeHiddenComponents;
  
  /// Whether to include position information
  final bool includePositions;
  
  /// Maximum depth of component tree to capture
  final int maxDepth;
  
  /// Whether to capture screenshots (if available)
  final bool captureScreenshots;
  
  const CaptureOptions({
    this.includeStyles = true,
    this.includeDisabledComponents = true,
    this.includeHiddenComponents = false,
    this.includePositions = true,
    this.maxDepth = 10,
    this.captureScreenshots = false,
  });
}
```

## MCP Support

### MCPAdapter

Interface for Model Context Protocol adapters.

```dart
abstract class MCPAdapter {
  /// Convert function definition to MCP schema
  Map<String, dynamic> convertToMCPSchema(Map<String, dynamic> functionDef);
  
  /// Convert MCP call to AgentBridge format
  Map<String, dynamic> convertFromMCPCall(Map<String, dynamic> mcpCall);
  
  /// Map context to MCP format
  Map<String, dynamic> mapContext(Map<String, dynamic> context);
  
  /// Map response to MCP format
  Map<String, dynamic> mapResponse(Map<String, dynamic> response);
  
  /// Get schema for all functions
  Map<String, dynamic> getFunctionSchema();
}
```

### MCPManager

Manages MCP adapters for AgentBridge.

```dart
class MCPManager {
  /// Register an adapter for a specific MCP type
  void registerAdapter(String type, MCPAdapter adapter) {
    // Registration logic
  }
  
  /// Get schema for a specific MCP type
  Map<String, dynamic> getSchema(String type) {
    // Schema retrieval logic
  }
  
  /// Handle function call from a specific MCP type
  Future<dynamic> handleFunctionCall(
    String type,
    Map<String, dynamic> functionCall,
  ) async {
    // Function call handling logic
  }
  
  /// Set global context for all MCP interactions
  void setGlobalContext(Map<String, dynamic> context) {
    // Context setting logic
  }
}
```

## Utility Classes

### FunctionRegistry

Manages function registrations for AgentBridge.

```dart
class FunctionRegistry {
  /// Register a function
  void registerFunction({
    required String name,
    required String description,
    required Map<String, dynamic> parameters,
    required Future<dynamic> Function(Map<String, dynamic>) handler,
  }) {
    // Registration logic
  }
  
  /// Get function by name
  Map<String, dynamic>? getFunction(String name) {
    // Retrieval logic
  }
  
  /// Get all registered functions
  List<Map<String, dynamic>> getAllFunctions() {
    // Retrieval logic
  }
  
  /// Execute a function by name with parameters
  Future<dynamic> executeFunction(
    String name,
    Map<String, dynamic> params,
  ) async {
    // Execution logic
  }
}
```

### ComponentRegistry

Manages component registrations for AgentBridge.

```dart
class ComponentRegistry {
  /// Register a component
  void registerComponent(ComponentDefinition component) {
    // Registration logic
  }
  
  /// Update a component
  void updateComponent(String id, Map<String, dynamic> updates) {
    // Update logic
  }
  
  /// Unregister a component
  void unregisterComponent(String id) {
    // Unregistration logic
  }
  
  /// Get all registered components
  List<ComponentDefinition> getAllComponents() {
    // Retrieval logic
  }
  
  /// Get component by ID
  ComponentDefinition? getComponent(String id) {
    // Retrieval logic
  }
}
```

For detailed usage examples, refer to the [Flutter Components](flutter/components.md) guide and the [Mobile Features](mobile-features.md) overview. 