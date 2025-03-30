import { ComponentTree, ComponentInfo, ComponentDesignInfo, LayoutInfo, StylingInfo, ScreenInfo } from '../mcp/interfaces';

/**
 * Base class for collecting design information from UI components
 * This serves as the abstract base class that different framework implementations will extend
 */
export abstract class DesignInfoCollector {
  /**
   * Capture the component tree starting from a root element
   * @param rootElement The root element of the UI
   * @returns A component tree with design information
   */
  abstract captureComponentTree(rootElement: any): ComponentTree;
  
  /**
   * Generate a unique ID for a component if it doesn't have one
   * @returns A unique ID string
   */
  protected generateUniqueId(): string {
    return 'component_' + Math.random().toString(36).substr(2, 9);
  }
  
  /**
   * Create an empty component tree structure
   * @returns An initialized ComponentTree
   */
  protected createEmptyTree(): ComponentTree {
    return {
      rootComponents: [],
      components: new Map<string, ComponentInfo>(),
      structure: {},
    };
  }
  
  /**
   * Create a base component info object
   * @param id Component ID
   * @param type Component type
   * @param props Component properties
   * @param state Component state
   * @param designInfo Optional design information
   * @returns A ComponentInfo object
   */
  protected createComponentInfo(
    id: string,
    type: string,
    props: Record<string, any>,
    state: Record<string, any>,
    designInfo?: ComponentDesignInfo
  ): ComponentInfo {
    return {
      id,
      type,
      props,
      state,
      designInfo,
    };
  }
  
  /**
   * Create default design information object
   * @returns A ComponentDesignInfo object with default values
   */
  protected createDefaultDesignInfo(): ComponentDesignInfo {
    return {
      layout: {
        children: [],
      },
      styling: {},
    };
  }
  
  /**
   * Add a component to the tree
   * @param tree The component tree
   * @param component The component to add
   * @param parentId Optional parent component ID
   */
  protected addComponentToTree(
    tree: ComponentTree,
    component: ComponentInfo,
    parentId?: string
  ): void {
    // Add component to the components map
    tree.components.set(component.id, component);
    
    // Handle parent-child relationship
    if (parentId) {
      if (!tree.structure[parentId]) {
        tree.structure[parentId] = [];
      }
      tree.structure[parentId].push(component.id);
      
      // Update the component's layout info with parent reference
      if (component.designInfo?.layout) {
        component.designInfo.layout.parent = parentId;
      }
    } else {
      // This is a root component
      tree.rootComponents.push(component.id);
    }
  }
} 