import { ComponentImplementation, ComponentRegistry } from './types';

/**
 * In-memory registry for UI components
 * 
 * Stores component implementations in memory and provides methods to register,
 * unregister, retrieve, and query components.
 */
export class InMemoryComponentRegistry implements ComponentRegistry {
  /** Map of component ID to component implementation */
  private components: Map<string, ComponentImplementation> = new Map();
  
  /**
   * Register a component
   * @param component The component implementation to register
   */
  register(component: ComponentImplementation): void {
    if (!component.definition.id) {
      throw new Error('Component ID is required');
    }
    
    if (this.components.has(component.definition.id)) {
      throw new Error(`Component with ID '${component.definition.id}' is already registered`);
    }
    
    this.components.set(component.definition.id, component);
  }
  
  /**
   * Unregister a component by ID
   * @param id The ID of the component to unregister
   */
  unregister(id: string): void {
    this.components.delete(id);
  }
  
  /**
   * Get a component by ID
   * @param id The ID of the component to retrieve
   * @returns The component implementation, or undefined if not found
   */
  get(id: string): ComponentImplementation | undefined {
    return this.components.get(id);
  }
  
  /**
   * List all registered components
   * @returns Array of all registered component implementations
   */
  list(): ComponentImplementation[] {
    return Array.from(this.components.values());
  }
  
  /**
   * Query components that match certain criteria
   * @param options Query options
   * @returns Array of component implementations that match the criteria
   */
  query(options: {
    componentType?: string;
    tags?: string[];
    authLevel?: 'public' | 'user' | 'admin';
    path?: string;
  }): ComponentImplementation[] {
    return this.list().filter(component => {
      // Check component type
      if (options.componentType && component.definition.componentType !== options.componentType) {
        return false;
      }
      
      // Check auth level
      if (options.authLevel) {
        const componentAuthLevel = component.definition.authLevel || 'public';
        if (componentAuthLevel !== options.authLevel) {
          return false;
        }
      }
      
      // Check tags (if any tag matches)
      if (options.tags && options.tags.length > 0) {
        const componentTags = component.definition.tags || [];
        if (!options.tags.some(tag => componentTags.includes(tag))) {
          return false;
        }
      }
      
      // Check path (can be prefix match)
      if (options.path && component.definition.path) {
        if (!component.definition.path.startsWith(options.path)) {
          return false;
        }
      }
      
      return true;
    });
  }
} 