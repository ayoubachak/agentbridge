/**
 * Browser-compatible EventEmitter implementation
 * 
 * A lightweight event emitter for browser environments that doesn't depend on Node.js
 */

export type EventListener = (...args: any[]) => void;

export class EventEmitter {
  private events: Map<string, EventListener[]> = new Map();
  
  /**
   * Register an event listener
   * @param event Event name
   * @param listener Listener function
   */
  on(event: string, listener: EventListener): this {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    const listeners = this.events.get(event)!;
    listeners.push(listener);
    
    return this;
  }
  
  /**
   * Register a one-time event listener
   * @param event Event name
   * @param listener Listener function
   */
  once(event: string, listener: EventListener): this {
    const onceWrapper: EventListener = (...args: any[]) => {
      this.off(event, onceWrapper);
      listener(...args);
    };
    
    return this.on(event, onceWrapper);
  }
  
  /**
   * Remove an event listener
   * @param event Event name
   * @param listener Listener function to remove
   */
  off(event: string, listener: EventListener): this {
    const listeners = this.events.get(event);
    
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
      
      // Clean up empty listener arrays
      if (listeners.length === 0) {
        this.events.delete(event);
      }
    }
    
    return this;
  }
  
  /**
   * Emit an event
   * @param event Event name
   * @param args Arguments to pass to listeners
   */
  emit(event: string, ...args: any[]): boolean {
    const listeners = this.events.get(event);
    
    if (!listeners || listeners.length === 0) {
      return false;
    }
    
    // Call all listeners with the provided arguments
    listeners.forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        // Log error but don't stop other listeners from executing
        console.error(`Error in event listener for '${event}':`, error);
      }
    });
    
    return true;
  }
  
  /**
   * Remove all listeners for a specific event or all events
   * @param event Optional event name. If not provided, removes all listeners for all events
   */
  removeAllListeners(event?: string): this {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    
    return this;
  }
  
  /**
   * Get the number of listeners for a specific event
   * @param event Event name
   */
  listenerCount(event: string): number {
    const listeners = this.events.get(event);
    return listeners ? listeners.length : 0;
  }
  
  /**
   * Get all listeners for a specific event
   * @param event Event name
   */
  listeners(event: string): EventListener[] {
    const listeners = this.events.get(event);
    return listeners ? [...listeners] : [];
  }
  
  /**
   * Get all event names that have listeners
   */
  eventNames(): string[] {
    return Array.from(this.events.keys());
  }
}

