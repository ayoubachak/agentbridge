import 'dart:math';
import 'mcp/interfaces.dart';

/// Base class for collecting design information from UI components
/// This serves as the abstract base class that different framework implementations will extend
abstract class DesignInfoCollector {
  /// Capture the component tree starting from a root element
  ///
  /// [rootElement] The root element of the UI
  /// Returns a component tree with design information
  ComponentTree captureComponentTree(dynamic rootElement);

  /// Generate a unique ID for a component if it doesn't have one
  ///
  /// Returns a unique ID string
  String generateUniqueId() {
    final random = Random();
    return 'component_${random.nextInt(1000000)}';
  }

  /// Create an empty component tree structure
  ///
  /// Returns an initialized ComponentTree
  ComponentTree createEmptyTree() {
    return ComponentTree(
      rootComponents: [],
      components: {},
      structure: {},
    );
  }

  /// Create a base component info object
  ///
  /// [id] Component ID
  /// [type] Component type
  /// [props] Component properties
  /// [state] Component state
  /// [designInfo] Optional design information
  /// Returns a ComponentInfo object
  ComponentInfo createComponentInfo(
    String id,
    String type,
    Map<String, dynamic> props,
    Map<String, dynamic> state,
    ComponentDesignInfo? designInfo,
  ) {
    return ComponentInfo(
      id: id,
      type: type,
      props: props,
      state: state,
      designInfo: designInfo,
    );
  }

  /// Create default design information object
  ///
  /// Returns a ComponentDesignInfo object with default values
  ComponentDesignInfo createDefaultDesignInfo() {
    return ComponentDesignInfo(
      layout: LayoutInfo(
        children: [],
      ),
      styling: StylingInfo(),
    );
  }

  /// Add a component to the tree
  ///
  /// [tree] The component tree
  /// [component] The component to add
  /// [parentId] Optional parent component ID
  void addComponentToTree(ComponentTree tree, ComponentInfo component,
      [String? parentId]) {
    // Add component to the components map
    tree.components[component.id] = component;

    // Handle parent-child relationship
    if (parentId != null) {
      tree.structure[parentId] = tree.structure[parentId] ?? [];
      tree.structure[parentId]!.add(component.id);

      // Update layout info if available
      final layout = component.designInfo?.layout;
      if (layout != null) {
        // Create a new LayoutInfo with the parent set
        final updatedLayout = LayoutInfo(
          parent: parentId,
          children: layout.children,
          position: layout.position,
          zIndex: layout.zIndex,
        );

        // Create a new ComponentDesignInfo with the updated layout
        final updatedDesignInfo = ComponentDesignInfo(
          layout: updatedLayout,
          styling: component.designInfo!.styling,
          screen: component.designInfo!.screen,
        );

        // Create a new ComponentInfo with the updated design info
        tree.components[component.id] = ComponentInfo(
          id: component.id,
          type: component.type,
          props: component.props,
          state: component.state,
          designInfo: updatedDesignInfo,
        );
      }
    } else {
      // This is a root component
      tree.rootComponents.add(component.id);
    }
  }
}
