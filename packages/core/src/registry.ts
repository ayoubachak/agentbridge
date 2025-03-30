import { FunctionImplementation, FunctionRegistry } from './types';

/**
 * In-memory implementation of the Function Registry
 */
export class InMemoryFunctionRegistry implements FunctionRegistry {
  private functions: Map<string, FunctionImplementation> = new Map();

  /**
   * Register a new function
   * @param func The function implementation to register
   * @throws Error if a function with the same name is already registered
   */
  register(func: FunctionImplementation): void {
    if (this.functions.has(func.definition.name)) {
      throw new Error(`Function with name '${func.definition.name}' is already registered`);
    }
    this.functions.set(func.definition.name, func);
  }

  /**
   * Unregister a function by name
   * @param name The name of the function to unregister
   */
  unregister(name: string): void {
    this.functions.delete(name);
  }

  /**
   * Get a function by name
   * @param name The name of the function to retrieve
   * @returns The function implementation or undefined if not found
   */
  get(name: string): FunctionImplementation | undefined {
    return this.functions.get(name);
  }

  /**
   * List all registered functions
   * @returns Array of all registered function implementations
   */
  list(): FunctionImplementation[] {
    return Array.from(this.functions.values());
  }

  /**
   * Query functions that match certain criteria
   * @param options Query options including tags and authLevel
   * @returns Array of function implementations that match the criteria
   */
  query(options: { tags?: string[]; authLevel?: 'public' | 'user' | 'admin' }): FunctionImplementation[] {
    return this.list().filter((func) => {
      // Filter by auth level if specified
      if (options.authLevel && func.definition.authLevel) {
        if (func.definition.authLevel !== options.authLevel) {
          return false;
        }
      }

      // Filter by tags if specified
      if (options.tags && options.tags.length > 0) {
        if (!func.definition.tags || func.definition.tags.length === 0) {
          return false;
        }
        
        // Check if any of the query tags match the function tags
        return options.tags.some(tag => func.definition.tags?.includes(tag));
      }

      return true;
    });
  }
} 