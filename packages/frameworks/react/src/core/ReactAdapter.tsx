/**
 * Core React adapter for AgentBridge
 * 
 * This adapter implements the core functionality for integrating React components with AgentBridge.
 * It handles component registration, state management, and event processing.
 */
import * as React from 'react';
import { AgentBridge, ComponentDefinition } from '@agentbridge/core';
import { debug, error, info, warn } from '../utils/debug';
import { 
  ComponentData, 
  ReactAdapterConfiguration,
  UpdateRegistryFunction
} from './types';
import * as z from 'zod';

/**
 * React adapter for AgentBridge
 * Manages integration between React components and AgentBridge
 */
export class ReactAdapter {
  private bridge: AgentBridge | null = null;
  private componentRegistry = new Map<string, ComponentData>();
  private config: ReactAdapterConfiguration;
  private contextUpdater: UpdateRegistryFunction | null = null;
  private initialized = false;

  /**
   * Creates a new ReactAdapter instance
   * @param config Adapter configuration options
   */
  constructor(config: ReactAdapterConfiguration = {}) {
    this.config = {
      debug: false,
      ...config
    };

    // Enable debug logging if configured
    if (this.config.debug) {
      debug('ReactAdapter initialized with debug enabled');
    }
  }

  /**
   * Initialize the adapter with an AgentBridge instance
   * @param bridge AgentBridge instance
   */
  initialize(bridge: AgentBridge): void {
    if (this.initialized) {
      warn('ReactAdapter already initialized');
      return;
    }

    if (!bridge) {
      throw new Error('AgentBridge instance is required for initialization');
    }

    this.bridge = bridge;
    this.initialized = true;
    
    // Register built-in functions for manipulating React components
    this.registerAgentFunctions();
    
    info('ReactAdapter initialized successfully');
  }

  /**
   * Sets a callback function to update React context when component registry changes
   * @param updater Function to update context with new registry
   */
  setContextUpdater(updater: UpdateRegistryFunction): void {
    this.contextUpdater = updater;
  }

  /**
   * Updates component registry and notifies context updater
   */
  updateRegistry(): void {
    if (this.contextUpdater) {
      try {
        this.contextUpdater(this.componentRegistry);
      } catch (err) {
        error('Error updating component registry in context', err);
      }
    }
  }

  /**
   * Checks if the adapter has been initialized
   * @returns True if initialized, false otherwise
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Gets the component registry
   * @returns Map of registered components
   */
  getComponents(): Map<string, ComponentData> {
    return this.componentRegistry;
  }

  /**
   * Gets a specific component by ID
   * @param id Component ID
   * @returns Component data or undefined if not found
   */
  getComponent(id: string): ComponentData | undefined {
    return this.componentRegistry.get(id);
  }

  /**
   * Registers a new component
   * @param id Component ID
   * @param data Component data
   */
  registerComponent(id: string, data: ComponentData): void {
    if (!this.initialized) {
      warn(`Cannot register component ${id} - adapter not initialized`);
      return;
    }

    if (this.componentRegistry.has(id)) {
      debug(`Updating existing component: ${id}`);
    } else {
      debug(`Registering new component: ${id}`);
    }

    this.componentRegistry.set(id, data);
    this.updateRegistry();
  }

  /**
   * Unregisters a component
   * @param id Component ID
   */
  unregisterComponent(id: string): void {
    if (!this.initialized) {
      warn(`Cannot unregister component ${id} - adapter not initialized`);
      return;
    }

    if (this.componentRegistry.has(id)) {
      debug(`Unregistering component: ${id}`);
      this.componentRegistry.delete(id);
      this.updateRegistry();
    } else {
      debug(`Cannot unregister component ${id} - not found`);
    }
  }

  /**
   * Updates component state
   * @param id Component ID
   * @param update State update function or object
   */
  updateComponentState(id: string, update: any): void {
    const component = this.componentRegistry.get(id);
    
    if (!component) {
      warn(`Cannot update component ${id} - not found`);
      return;
    }

    try {
      if (typeof component.setState === 'function') {
        // If setState is a function, call it with the update
        component.setState(update);
      } else if (component.state !== undefined) {
        // If we have a state object but no setState, merge the updates
        if (typeof update === 'function') {
          component.state = update(component.state);
        } else {
          component.state = {
            ...component.state,
            ...update
          };
        }
        
        // Notify of registry updates
        this.updateRegistry();
      } else {
        warn(`Component ${id} does not have a valid state mechanism`);
      }
    } catch (err) {
      error(`Error updating state for component ${id}`, err);
    }
  }

  /**
   * Registers built-in agent functions for manipulating React components
   */
  private registerAgentFunctions(): void {
    if (!this.bridge) {
      error('Cannot register agent functions - bridge not initialized');
      return;
    }

    try {
      // Register function to get component data
      this.bridge.registerFunction(
        'getComponent', 
        'Gets information about a registered component',
        z.object({ id: z.string() }),
        async (params) => {
          const component = this.getComponent(params.id);
          return component ? { success: true, data: component } : { success: false, error: 'Component not found' };
        }
      );

      // Register function to list all components
      this.bridge.registerFunction(
        'listComponents',
        'Lists all registered components',
        z.object({}),
        async () => {
          const components = Array.from(this.componentRegistry.entries())
            .map(([id, data]) => ({
              id,
              type: data.type || 'unknown',
              props: data.props || {}
            }));
          
          return {
            success: true,
            components
          };
        }
      );

      // Register function to update component state
      this.bridge.registerFunction(
        'updateComponentState',
        'Updates the state of a registered component',
        z.object({ 
          id: z.string(),
          state: z.record(z.any())
        }),
        async (params) => {
          try {
            this.updateComponentState(params.id, params.state);
            return { success: true };
          } catch (err) {
            return { 
              success: false, 
              error: err instanceof Error ? err.message : 'Unknown error' 
            };
          }
        }
      );

      debug('Agent functions registered successfully');
    } catch (err) {
      error('Error registering agent functions', err);
    }
  }

  /**
   * Cleans up resources used by the adapter
   */
  dispose(): void {
    if (this.bridge) {
      // Unregister any functions or resources as needed
      try {
        this.bridge.unregisterFunction('getComponent');
        this.bridge.unregisterFunction('listComponents');
        this.bridge.unregisterFunction('updateComponentState');
      } catch (err) {
        error('Error unregistering agent functions during disposal', err);
      }
    }

    this.componentRegistry.clear();
    this.contextUpdater = null;
    this.initialized = false;
    this.bridge = null;
    
    info('ReactAdapter disposed');
  }
} 