/// Model Context Protocols (MCPs) Interfaces for Flutter
/// These interfaces define the contracts for MCP integration in AgentBridge.

/// Base interface for MCP adapters
abstract class MCPAdapter {
  /// Convert an AgentBridge function definition to an MCP schema
  Map<String, dynamic> convertToMCPSchema(Map<String, dynamic> functionDef);

  /// Convert an MCP function call to an AgentBridge function call request
  Map<String, dynamic> convertFromMCPCall(Map<String, dynamic> mcpCall);

  /// Map AgentBridge context to MCP context
  Map<String, dynamic> mapContext(Map<String, dynamic> context);

  /// Map AgentBridge function call result to MCP response
  Map<String, dynamic> mapResponse(Map<String, dynamic> response);

  /// Get the complete function schema for all registered functions
  Map<String, dynamic> getFunctionSchema();
}

/// Layout information for a component
class LayoutInfo {
  final String? parent;
  final List<String> children;
  final PositionInfo? position;
  final int? zIndex;

  LayoutInfo({
    this.parent,
    required this.children,
    this.position,
    this.zIndex,
  });

  Map<String, dynamic> toMap() {
    return {
      'parent': parent,
      'children': children,
      'position': position?.toMap(),
      'zIndex': zIndex,
    };
  }
}

/// Position information for a component
class PositionInfo {
  final double x;
  final double y;
  final double width;
  final double height;

  PositionInfo({
    required this.x,
    required this.y,
    required this.width,
    required this.height,
  });

  Map<String, dynamic> toMap() {
    return {
      'x': x,
      'y': y,
      'width': width,
      'height': height,
    };
  }
}

/// Styling information for a component
class StylingInfo {
  final String? theme;
  final List<String>? styleClasses;
  final Map<String, dynamic>? customStyles;

  StylingInfo({
    this.theme,
    this.styleClasses,
    this.customStyles,
  });

  Map<String, dynamic> toMap() {
    return {
      'theme': theme,
      'styleClasses': styleClasses,
      'customStyles': customStyles,
    };
  }
}

/// Screen/route information for a component
class ScreenInfo {
  final String name;
  final String? route;
  final bool isActive;

  ScreenInfo({
    required this.name,
    this.route,
    required this.isActive,
  });

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'route': route,
      'isActive': isActive,
    };
  }
}

/// Component design information
class ComponentDesignInfo {
  final LayoutInfo layout;
  final StylingInfo styling;
  final ScreenInfo? screen;

  ComponentDesignInfo({
    required this.layout,
    required this.styling,
    this.screen,
  });

  Map<String, dynamic> toMap() {
    return {
      'layout': layout.toMap(),
      'styling': styling.toMap(),
      'screen': screen?.toMap(),
    };
  }
}

/// Information about a component
class ComponentInfo {
  final String id;
  final String type;
  final Map<String, dynamic> props;
  final Map<String, dynamic> state;
  final ComponentDesignInfo? designInfo;

  ComponentInfo({
    required this.id,
    required this.type,
    required this.props,
    required this.state,
    this.designInfo,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'type': type,
      'props': props,
      'state': state,
      'designInfo': designInfo?.toMap(),
    };
  }
}

/// Component tree information
class ComponentTree {
  final List<String> rootComponents;
  final Map<String, ComponentInfo> components;
  final Map<String, List<String>> structure; // parent ID -> child IDs

  ComponentTree({
    required this.rootComponents,
    required this.components,
    required this.structure,
  });

  Map<String, dynamic> toMap() {
    final componentsMap = <String, Map<String, dynamic>>{};
    components.forEach((key, value) {
      componentsMap[key] = value.toMap();
    });

    return {
      'rootComponents': rootComponents,
      'components': componentsMap,
      'structure': structure,
    };
  }
}
