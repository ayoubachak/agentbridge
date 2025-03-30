import { DesignInfoCollector } from '../core/component/design-collector';
import { ComponentTree, ComponentInfo, ComponentDesignInfo } from '../core/mcp/interfaces';

/**
 * Design information collector for React components
 */
export class ReactDesignInfoCollector extends DesignInfoCollector {
  /**
   * Capture the component tree starting from a React element
   * @param rootElement The root React element
   * @returns A component tree with design information
   */
  captureComponentTree(rootElement: any): ComponentTree {
    const tree = this.createEmptyTree();
    
    // Start traversing from the root element
    this.traverseReactComponent(rootElement, tree);
    
    return tree;
  }
  
  /**
   * Recursively traverse a React component tree
   * @param element The current React element
   * @param tree The component tree being built
   * @param parentId Optional parent component ID
   */
  private traverseReactComponent(element: any, tree: ComponentTree, parentId?: string): void {
    // Skip if not a valid element
    if (!element || !element.type) {
      return;
    }
    
    // Extract component information
    const id = element.props?.id || this.generateUniqueId();
    const type = typeof element.type === 'string' 
      ? element.type 
      : (element.type.displayName || element.type.name || 'UnknownComponent');
    
    // Extract props and state
    const props = { ...element.props };
    const state = this.getComponentState(element);
    
    // Create design information
    const designInfo = this.extractDesignInfo(element);
    
    // Create component info
    const componentInfo = this.createComponentInfo(id, type, props, state, designInfo);
    
    // Add to tree
    this.addComponentToTree(tree, componentInfo, parentId);
    
    // Process children
    if (element.props?.children) {
      this.processChildren(element.props.children, tree, id);
    }
  }
  
  /**
   * Process children of a React component
   * @param children The children elements
   * @param tree The component tree
   * @param parentId The parent component ID
   */
  private processChildren(children: any, tree: ComponentTree, parentId: string): void {
    // Handle array of children
    if (Array.isArray(children)) {
      children.forEach(child => {
        if (child) {
          this.traverseReactComponent(child, tree, parentId);
        }
      });
    } 
    // Handle single child
    else if (children && typeof children === 'object') {
      this.traverseReactComponent(children, tree, parentId);
    }
  }
  
  /**
   * Extract component state if available
   * @param element The React element
   * @returns The component state or an empty object
   */
  private getComponentState(element: any): Record<string, any> {
    // This is a simplified version - in a real implementation, 
    // you would use React internals or refs to access actual state
    return {};
  }
  
  /**
   * Extract design information from a React component
   * @param element The React element
   * @returns Component design information
   */
  private extractDesignInfo(element: any): ComponentDesignInfo {
    const designInfo = this.createDefaultDesignInfo();
    
    // Extract layout information
    designInfo.layout = this.extractLayoutInfo(element);
    
    // Extract styling information
    designInfo.styling = this.extractStylingInfo(element);
    
    // Extract screen information if available
    const screenInfo = this.extractScreenInfo(element);
    if (screenInfo) {
      designInfo.screen = screenInfo;
    }
    
    return designInfo;
  }
  
  /**
   * Extract layout information from a React component
   * @param element The React element
   * @returns Layout information
   */
  private extractLayoutInfo(element: any): any {
    // Extract layout related props
    const { style, className } = element.props || {};
    
    // Extract position from style
    const position = style ? this.extractPositionFromStyle(style) : undefined;
    
    return {
      children: [], // Will be populated during tree construction
      position,
      zIndex: style?.zIndex,
    };
  }
  
  /**
   * Extract position information from style object
   * @param style The style object
   * @returns Position information or undefined
   */
  private extractPositionFromStyle(style: any): any | undefined {
    if (!style) return undefined;
    
    // Check if position-related properties exist
    const hasPosition = ['top', 'left', 'width', 'height', 'position'].some(prop => style[prop] !== undefined);
    
    if (!hasPosition) return undefined;
    
    return {
      x: this.parseStyleValue(style.left) || 0,
      y: this.parseStyleValue(style.top) || 0,
      width: this.parseStyleValue(style.width) || 0,
      height: this.parseStyleValue(style.height) || 0,
    };
  }
  
  /**
   * Parse a style value to a number
   * @param value The style value
   * @returns The parsed number or 0
   */
  private parseStyleValue(value: any): number {
    if (value === undefined || value === null) return 0;
    
    // If it's already a number, return it
    if (typeof value === 'number') return value;
    
    // If it's a string, try to parse it
    if (typeof value === 'string') {
      // Remove 'px', '%', etc.
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) return numericValue;
    }
    
    return 0;
  }
  
  /**
   * Extract styling information from a React component
   * @param element The React element
   * @returns Styling information
   */
  private extractStylingInfo(element: any): any {
    const { style, className, theme } = element.props || {};
    
    return {
      theme: theme,
      styleClasses: className ? className.split(' ') : [],
      customStyles: style ? { ...style } : {},
    };
  }
  
  /**
   * Extract screen information from a React component
   * @param element The React element
   * @returns Screen information or undefined
   */
  private extractScreenInfo(element: any): any | undefined {
    // This is a simplified version - in a real implementation,
    // you would check for React Router or similar routing information
    
    // Check if this is a route component
    if (element.type && (
      element.type.name === 'Route' || 
      element.type.displayName === 'Route' ||
      (element.props && element.props.path)
    )) {
      return {
        name: element.props.name || 'Unnamed Route',
        route: element.props.path || element.props.to,
        isActive: false, // Would be determined by router in real implementation
      };
    }
    
    return undefined;
  }
} 