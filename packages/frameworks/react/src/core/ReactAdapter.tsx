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
  private registeredWithCore = new Set<string>(); // Track what's registered with core

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
   * Registers a new component with both the adapter and AgentBridge core
   * @param component React component reference (can be null)
   * @param definition Component definition
   * @param handlers Component handlers (update and actions)
   */
  registerComponent(
    component: any,
    definition: ComponentDefinition,
    handlers: {
      updateHandler?: (properties: any, context: any) => Promise<void>;
      [key: string]: any;
    }
  ): void {
    if (!this.initialized || !this.bridge) {
      warn(`Cannot register component ${definition.id} - adapter not initialized`);
      return;
    }

    const componentId = definition.id;

    // Store in local registry for React-specific tracking
    const componentData: ComponentData = {
      id: componentId,
      type: definition.componentType,
      definition,
      ...handlers
    };

    if (this.componentRegistry.has(componentId)) {
      debug(`Updating existing component: ${componentId}`);
    } else {
      debug(`Registering new component: ${componentId}`);
    }

    this.componentRegistry.set(componentId, componentData);
    this.updateRegistry();

    // Register with AgentBridge core (this triggers capability broadcast)
    // First, unregister if already registered (allows hot-reload/re-registration)
    if (this.registeredWithCore.has(componentId) && this.bridge) {
      try {
        this.bridge.unregisterComponent(componentId);
        this.registeredWithCore.delete(componentId);
        debug(`Pre-unregistered component ${componentId} before re-registration`);
      } catch (err) {
        // Ignore unregister errors
      }
    }

    try {
      // Build actions with handlers included
      const actionsWithHandlers: Record<string, {
        description: string;
        parameters?: any;
        handler: (params: any, context: any) => Promise<any>;
      }> = {};

      if (definition.actions) {
        for (const [actionName, actionDef] of Object.entries(definition.actions)) {
          if (handlers[actionName]) {
            actionsWithHandlers[actionName] = {
              description: actionDef.description,
              parameters: actionDef.parameters, // Already processed by processComponentDefinition
              handler: handlers[actionName]
            };
          }
        }
      }

      // Ensure properties has a describe method (should be processed already)
      const properties = definition.properties;
      if (properties && typeof properties === 'object' && !('describe' in properties)) {
        warn(`Properties for ${componentId} not properly processed - should have describe method`);
      }

      this.bridge.registerComponent(
        componentId,
        definition.description || `Component: ${definition.componentType}`,
        definition.componentType,
        {
          properties: definition.properties,
          actions: actionsWithHandlers,
          updateHandler: handlers.updateHandler,
          authLevel: definition.authLevel,
          tags: definition.tags,
          path: definition.path
        }
      );

      this.registeredWithCore.add(componentId);
      debug(`Component ${componentId} registered with AgentBridge core`);
    } catch (err) {
      error(`Error registering component ${componentId} with core:`, err);
    }
  }

  /**
   * Unregisters a component from both adapter and core
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

      // Unregister from core
      if (this.registeredWithCore.has(id) && this.bridge) {
        try {
          this.bridge.unregisterComponent(id);
          this.registeredWithCore.delete(id);
          debug(`Component ${id} unregistered from AgentBridge core`);
        } catch (err) {
          error(`Error unregistering component ${id} from core:`, err);
        }
      }
    } else {
      debug(`Cannot unregister component ${id} - not found`);
    }
  }

  /**
   * Updates component state
   * @param id Component ID
   * @param update State update function or object
   * @deprecated Components manage their own state. This is for legacy support only.
   */
  updateComponentState(id: string, update: any): void {
    const component = this.componentRegistry.get(id);
    
    if (!component) {
      debug(`Component ${id} not found for state update - this is normal`);
      return;
    }

    // Components manage their own state in React
    // This method exists for API compatibility but does nothing
    // State updates happen through action handlers which return the new state
    debug(`State update requested for ${id} - delegating to component's own state management`);
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