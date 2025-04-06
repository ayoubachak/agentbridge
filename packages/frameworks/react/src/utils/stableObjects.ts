/**
 * Utilities for creating stable objects that don't cause unnecessary re-renders
 */
import { debug } from './debug';

/**
 * Interface for a stable reference container
 */
export interface StableRef<T> {
  /**
   * Get the current value
   */
  current: T;
  
  /**
   * Update the value and return a boolean indicating if it changed
   * @param newValue New value
   * @returns True if the value changed
   */
  update(newValue: T): boolean;
}

/**
 * Create a stable reference that maintains identity unless the value needs to change
 * @param initialValue Initial value
 * @returns A stable reference object
 */
export function createStableRef<T>(initialValue: T): StableRef<T> {
  let internalValue = initialValue;
  
  const ref: StableRef<T> = {
    get current() {
      return internalValue;
    },
    
    update(newValue: T) {
      // Simple equality check for primitives
      if (newValue === internalValue) {
        return false;
      }
      
      // For objects, perform a shallow comparison
      if (
        typeof newValue === 'object' && 
        newValue !== null && 
        typeof internalValue === 'object' && 
        internalValue !== null
      ) {
        const areEqual = shallowEqual(newValue, internalValue);
        
        if (areEqual) {
          return false;
        }
      }
      
      // Value is different, update it
      internalValue = newValue;
      return true;
    }
  };
  
  return ref;
}

/**
 * Check if two objects are shallowly equal
 * @param a First object
 * @param b Second object
 * @returns True if the objects have the same keys and values
 */
function shallowEqual(a: any, b: any): boolean {
  if (a === b) {
    return true;
  }
  
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false;
  }
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) {
    return false;
  }
  
  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    
    if (!Object.prototype.hasOwnProperty.call(b, key) || a[key] !== b[key]) {
      return false;
    }
  }
  
  return true;
}

/**
 * Create a stable registry that can be updated while maintaining reference identity when possible
 * @returns A stable registry
 */
export function createStableRegistry() {
  const registryMap = new Map();
  
  // Create a proxy that wraps the Map to maintain stable references
  const stableRegistry = {
    /**
     * Get all entries in the registry
     */
    entries: () => Array.from(registryMap.entries()),
    
    /**
     * Get a component by ID from the registry
     * @param id Component ID
     */
    get: (id: string) => registryMap.get(id),
    
    /**
     * Set a component in the registry
     * @param id Component ID
     * @param value Component value
     */
    set: (id: string, value: any) => {
      registryMap.set(id, value);
      return stableRegistry;
    },
    
    /**
     * Check if the registry has a component with the given ID
     * @param id Component ID
     */
    has: (id: string) => registryMap.has(id),
    
    /**
     * Delete a component from the registry
     * @param id Component ID
     */
    delete: (id: string) => registryMap.delete(id),
    
    /**
     * Clear the registry
     */
    clear: () => registryMap.clear(),
    
    /**
     * Get the size of the registry
     */
    get size() {
      return registryMap.size;
    },
    
    /**
     * Update the registry with a new Map while maintaining stable references
     * @param newMap New registry Map
     */
    update: (newMap: Map<string, any>) => {
      debug(`Updating registry with ${newMap.size} components`);
      
      // Remove entries that no longer exist
      for (const id of registryMap.keys()) {
        if (!newMap.has(id)) {
          registryMap.delete(id);
        }
      }
      
      // Update or add new entries
      for (const [id, component] of newMap.entries()) {
        registryMap.set(id, component);
      }
      
      return stableRegistry;
    }
  };
  
  return stableRegistry;
} 