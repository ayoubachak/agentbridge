/**
 * Hook for registering React components with AgentBridge
 */
import * as React from 'react';
import { FC, useEffect, useId, useMemo, useRef, useState } from 'react';
import { ComponentDefinition } from '@agentbridge/core';
import { 
  useAgentBridgeContext, 
  getAgentBridgeContext,
  setGlobalContextValue 
} from '../core/context';
import { AgentComponentOptions, UseAgentComponentResult } from '../core/types';
import { debug, error, info, warn } from '../utils/debug';
import { AgentBridgeError, ErrorCode } from '../utils/errors';
import { processComponentDefinition } from '../utils/schema';

// Counter for generating IDs when useId is not available (fallback for React version conflicts)
let componentIdCounter = 0;

/**
 * Generate a unique ID for components as a fallback when useId fails
 * @param prefix Prefix for the ID
 * @returns A unique ID string
 */
function generateFallbackId(prefix = 'component'): string {
  componentIdCounter += 1;
  return `${prefix}-fallback-${componentIdCounter}`;
}

/**
 * Types of specific state operations that need handling
 */
function updateState<S extends Record<string, any>>(state: S, newState: Partial<S>): S {
  // Create a new object to store the updated state
  const updatedState = { ...state };
  
  // Update properties from newState
  for (const key in newState) {
    if (Object.prototype.hasOwnProperty.call(newState, key)) {
      // Safe way to update state without directly indexing generic type
      Object.assign(updatedState, { [key]: newState[key] });
    }
  }
  
  return updatedState;
}

/**
 * Hook for registering a React component with AgentBridge
 * 
 * This hook allows a component to register itself with AgentBridge,
 * making it available to AI agents for interaction.
 * 
 * @param options Component registration options
 * @returns Tools for managing the agent component
 */
export function useAgentComponent<P = any, S extends Record<string, any> = Record<string, any>>(
  options: AgentComponentOptions<P, S>
): UseAgentComponentResult<S> {
  // Safely try to use hooks with robust fallbacks
  try {
    return useAgentComponentWithHooks(options);
  } catch (err) {
    // Fallback to a non-hook implementation if hooks fail
    debug('React hooks failed in useAgentComponent, using fallback mechanism', err);
    return useAgentComponentFallback(options);
  }
}

/**
 * Implementation of useAgentComponent using React hooks
 * @internal
 */
function useAgentComponentWithHooks<P = any, S extends Record<string, any> = Record<string, any>>(
  options: AgentComponentOptions<P, S>
): UseAgentComponentResult<S> {
  const { 
    componentId: providedId,
    componentType,
    description,
    properties,
    actions,
    path,
    tags,
    authLevel,
    initialState,
    onStateChange,
    onAction
  } = options;
  
  // Get adapter and initialization status
  const { adapter, initialized } = useAgentBridgeContext();
  
  // Generate a stable ID if not provided
  const generatedId = useId();
  const componentId = providedId || `${componentType || 'component'}-${generatedId}`;
  
  // Create a stable state reference
  const [state, setState] = useState<S>(initialState || {} as S);
  const stateRef = useRef<S>(state);
  
  // Update the ref when state changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  // Create action handlers
  const actionHandlers = useMemo(() => {
    const handlers: Record<string, Function> = {};
    
    if (actions) {
      for (const [actionName, actionDef] of Object.entries(actions)) {
        handlers[actionName] = async (params: any, context: any) => {
          debug(`Handling action ${actionName} for component ${componentId}`, params);
          
          try {
            // Call the custom action handler if provided
            if (onAction) {
              const result = await onAction(actionName, params, context);
              
              if (result !== undefined) {
                return result;
              }
            }
            
            // Call the specific action handler if provided
            if (actionDef.handler) {
              return await actionDef.handler(params, stateRef.current, context);
            }
            
            // No handler found
            warn(`No handler found for action ${actionName} on component ${componentId}`);
            return { success: false, error: 'Action handler not implemented' };
          } catch (err) {
            error(`Error handling action ${actionName} for component ${componentId}:`, err);
            return { 
              success: false, 
              error: err instanceof Error ? err.message : String(err)
            };
          }
        };
      }
    }
    
    return handlers;
  }, [componentId, actions, onAction]);
  
  // Create update handler
  const updateHandler = useMemo(() => {
    return async (updates: Partial<S>, context: any) => {
      debug(`Update handler called for component ${componentId}`, updates);
      
      try {
        // Update the state
        setState(prevState => ({ ...prevState, ...updates }));
        
        // Call the custom state change handler if provided
        if (onStateChange) {
          await onStateChange(updates, stateRef.current, context);
        }
        
        return { success: true };
      } catch (err) {
        error(`Error updating state for component ${componentId}:`, err);
        return { 
          success: false, 
          error: err instanceof Error ? err.message : String(err)
        };
      }
    };
  }, [componentId, onStateChange]);
  
  // Create component definition
  const componentDefinition = useMemo((): ComponentDefinition => {
    return {
      id: componentId,
      componentType: componentType || 'react-component',
      description: description || `React component: ${componentType || 'Component'}`,
      properties: properties as any,
      actions: actions ? Object.entries(actions).reduce((acc, [name, action]) => {
        acc[name] = {
          description: action.description,
          parameters: action.parameters
        };
        return acc;
      }, {} as Record<string, any>) : undefined,
      path,
      tags: [...(tags || []), 'react'],
      authLevel
    } as ComponentDefinition;
  }, [
    componentId, componentType, description, 
    properties, actions, path, tags, authLevel
  ]);
  
  // Process the definition for schema compatibility
  const processedDefinition = useMemo(() => {
    return processComponentDefinition(componentDefinition);
  }, [componentDefinition]);
  
  // Register the component when the adapter is initialized
  useEffect(() => {
    if (!initialized || !adapter) {
      return;
    }
    
    try {
      info(`Registering component ${componentId} with AgentBridge`);
      
      // Register with the adapter
      adapter.registerComponent(
        null, // No actual component reference needed in React
        processedDefinition,
        { ...actionHandlers, updateHandler }
      );
      
      debug(`Component ${componentId} registered successfully`);
      
      // Clean up on unmount
      return () => {
        info(`Unregistering component ${componentId}`);
        adapter.unregisterComponent(componentId);
      };
    } catch (err) {
      error(`Error registering component ${componentId}:`, err);
      throw new AgentBridgeError(
        `Failed to register component ${componentId}: ${err instanceof Error ? err.message : String(err)}`,
        ErrorCode.COMPONENT_REGISTRATION_FAILED,
        err instanceof Error ? err : undefined
      );
    }
  }, [
    initialized, adapter, componentId, 
    processedDefinition, actionHandlers, updateHandler
  ]);
  
  // Update state function that also notifies the adapter
  const updateState = (newState: Partial<S>) => {
    debug(`Setting state for component ${componentId}`, newState);
    
    // Update local state
    setState(prevState => {
      const combinedState = { ...prevState, ...newState };
      
      // Update adapter if initialized
      if (initialized && adapter) {
        try {
          adapter.updateComponentState(componentId, newState);
        } catch (err) {
          error(`Error updating component state in adapter:`, err);
        }
      }
      
      return combinedState;
    });
  };
  
  // Create result
  return useMemo(() => ({
    id: componentId,
    state,
    updateState
  }), [componentId, state, initialized, adapter]);
}

/**
 * Class-based implementation as a fallback when hooks fail
 * @internal
 */
function useAgentComponentFallback<P = any, S extends Record<string, any> = Record<string, any>>(
  options: AgentComponentOptions<P, S>
): UseAgentComponentResult<S> {
  const { 
    componentId: providedId,
    componentType,
    description,
    properties,
    actions,
    path,
    tags,
    authLevel,
    initialState,
    onStateChange,
    onAction
  } = options;
  
  // Get adapter and initialization status from global context
  const { adapter, initialized } = getAgentBridgeContext();
  
  // Generate an ID manually
  const componentId = providedId || generateFallbackId(componentType);
  
  // Initialize state
  const state: S = initialState ? { ...initialState } : {} as S;
  
  // Define action handlers
  const actionHandlers: Record<string, Function> = {};
  
  if (actions) {
    for (const [actionName, actionDef] of Object.entries(actions)) {
      actionHandlers[actionName] = async (params: any, context: any) => {
        debug(`Handling action ${actionName} for component ${componentId}`, params);
        
        try {
          // Call the custom action handler if provided
          if (onAction) {
            const result = await onAction(actionName, params, context);
            
            if (result !== undefined) {
              return result;
            }
          }
          
          // Call the specific action handler if provided
          if (actionDef.handler) {
            return await actionDef.handler(params, state, context);
          }
          
          // No handler found
          warn(`No handler found for action ${actionName} on component ${componentId}`);
          return { success: false, error: 'Action handler not implemented' };
        } catch (err) {
          error(`Error handling action ${actionName} for component ${componentId}:`, err);
          return { 
            success: false, 
            error: err instanceof Error ? err.message : String(err)
          };
        }
      };
    }
  }
  
  // Create update handler
  const updateHandler = async (updates: Partial<S>, context: any) => {
    debug(`Update handler called for component ${componentId}`, updates);
    
    try {
      // Create a new merged state manually 
      const newMergedState = { ...state };
      // Update properties from updates with proper type checking
      for (const key in updates) {
        if (Object.prototype.hasOwnProperty.call(updates, key)) {
          const value = updates[key];
          if (value !== undefined) {
            // Safe assignment with type assertion to avoid undefined
            newMergedState[key] = value as any;
          }
        }
      }
      
      // Call the custom state change handler if provided
      if (onStateChange) {
        await onStateChange(updates, newMergedState, context);
      }
      
      return { success: true };
    } catch (err) {
      error(`Error updating state for component ${componentId}:`, err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : String(err)
      };
    }
  };
  
  // Create component definition
  const componentDefinition: ComponentDefinition = {
    id: componentId,
    componentType: componentType || 'react-component',
    description: description || `React component: ${componentType || 'Component'}`,
    properties: properties as any,
    actions: actions ? Object.entries(actions).reduce((acc, [name, action]) => {
      acc[name] = {
        description: action.description,
        parameters: action.parameters
      };
      return acc;
    }, {} as Record<string, any>) : undefined,
    path,
    tags: [...(tags || []), 'react'],
    authLevel
  } as ComponentDefinition;
  
  // Process the definition for schema compatibility
  const processedDefinition = processComponentDefinition(componentDefinition);
  
  // Register with adapter if initialized
  if (initialized && adapter) {
    try {
      info(`Registering component ${componentId} with AgentBridge (fallback mode)`);
      
      // Register with the adapter
      adapter.registerComponent(
        null, // No actual component reference needed in React
        processedDefinition,
        { ...actionHandlers, updateHandler }
      );
      
      debug(`Component ${componentId} registered successfully (fallback mode)`);
      
      // Add cleanup handler to window unload to ensure component gets unregistered
      if (typeof window !== 'undefined') {
        window.addEventListener('unload', () => {
          if (adapter) {
            info(`Unregistering component ${componentId} (fallback mode)`);
            adapter.unregisterComponent(componentId);
          }
        });
      }
    } catch (err) {
      error(`Error registering component ${componentId} (fallback mode):`, err);
      // Continue anyway since this is fallback mode
    }
  }
  
  // Update state function that also notifies the adapter
  const updateState = (newState: Partial<S>) => {
    debug(`Setting state for component ${componentId} (fallback mode)`, newState);
    
    // Create a new merged state
    const updatedState = { ...state, ...newState };
    
    // Update the state object through a helper function to avoid TypeScript indexing issues
    Object.assign(state, updatedState);
    
    // Update adapter if initialized
    if (initialized && adapter) {
      try {
        adapter.updateComponentState(componentId, newState);
      } catch (err) {
        error(`Error updating component state in adapter (fallback mode):`, err);
      }
    }
    
    return state;
  };
  
  // Return result
  return {
    id: componentId,
    state,
    updateState
  };
}

/**
 * Higher-order component for registering a component with AgentBridge
 * 
 * @param Component The component to wrap
 * @param options Agent component options
 * @returns A wrapped component that is registered with AgentBridge
 */
export function withAgentComponent<P extends object = {}, S extends Record<string, any> = Record<string, any>>(
  Component: FC<P>,
  options: Omit<AgentComponentOptions<P, S>, 'componentId'>
): FC<P & { componentId?: string }> {
  // Create the wrapped component
  const WrappedComponent: FC<P & { componentId?: string }> = (props) => {
    const { componentId, ...componentProps } = props;
    
    // Try to use the hook version, but catch errors and use fallback if needed
    let agent;
    try {
      // Register with AgentBridge
      agent = useAgentComponent<P, S>({
        ...options,
        componentId,
        properties: { ...options.properties, ...componentProps }
      });
    } catch (err) {
      // Fallback to non-hook implementation if hooks fail
      debug('Using fallback implementation for withAgentComponent', err);
      agent = useAgentComponentFallback<P, S>({
        ...options,
        componentId,
        properties: { ...options.properties, ...componentProps }
      });
    }
    
    // Render the original component with agent state
    return React.createElement(Component, { ...componentProps as P, __agent: agent });
  };
  
  // Copy display name
  WrappedComponent.displayName = `withAgentComponent(${Component.displayName || Component.name || 'Component'})`;
  
  return WrappedComponent;
} 