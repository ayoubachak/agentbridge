import * as React from 'react';
import { useAgentBridge } from './ReactAdapter';
import { FunctionCallResult, ComponentDefinition, ExecutionContext } from '@agentbridge/core';

// Type for component registration
interface ComponentRegistrationOptions extends Omit<ComponentDefinition, 'id' | 'properties'> {
  id: string;
  properties?: Record<string, any>;
  actions?: Record<string, {
    description: string;
    handler: (params?: any) => any;
    parameters?: any;
  }>;
}

/**
 * Creates a wrapper for plain objects to make them compatible with Zod schemas
 * by adding a describe() method
 * This is a duplicate of the function in ReactAdapter.tsx
 * 
 * @param obj The object to wrap
 * @returns An object with a describe() method
 */
function createSchemaCompatibleObject(obj: Record<string, any>) {
  if (!obj) return obj;
  
  // If it already has a describe method, assume it's compatible
  if (obj && typeof obj.describe === 'function') {
    return obj;
  }
  
  const result = {
    ...obj,
    describe: (name: string) => {
      // Return a simplified schema description
      return {
        type: 'object',
        properties: Object.entries(obj).reduce((acc: Record<string, any>, [key, value]) => {
          // Extract type and description if available
          const type = value?.type || typeof value;
          const description = value?.description || `Property ${key}`;
          
          acc[key] = { type, description };
          
          // Include any additional properties
          if (value && typeof value === 'object') {
            Object.entries(value).forEach(([propKey, propValue]) => {
              if (propKey !== 'type' && propKey !== 'description') {
                acc[key][propKey] = propValue;
              }
            });
          }
          
          return acc;
        }, {})
      };
    }
  };
  
  return result;
}

/**
 * Hook for registering a component with AgentBridge
 * 
 * @param componentOptions Component definition and properties
 */
export function useRegisterComponent(componentOptions: ComponentRegistrationOptions) {
  const { adapter, initialized } = useAgentBridge() || { adapter: null, initialized: false };
  const [state, setState] = React.useState<Record<string, any>>({});
  const optionsRef = React.useRef(componentOptions);
  const componentId = componentOptions.id;
  
  // Update the ref whenever the options change
  React.useEffect(() => {
    optionsRef.current = componentOptions;
  }, [componentOptions]);
  
  // Register component only once on mount
  React.useEffect(() => {
    if (!initialized || !adapter) return;
    
    const component = optionsRef.current;
    
    // Create handlers from actions
    const handlers: Record<string, any> = {};
    
    if (component.actions) {
      Object.entries(component.actions).forEach(([actionName, actionConfig]) => {
        if (actionConfig.handler) {
          handlers[actionName] = actionConfig.handler;
        }
      });
    }

    // Remove handlers from definition since they should be passed separately
    const { actions, properties, ...definition } = component;
    
    // Make properties schema-compatible
    const schemaCompatibleProps = properties ? createSchemaCompatibleObject(properties) : {};
    
    // Process actions to make parameters schema-compatible
    const processedActions: Record<string, any> = {};
    
    if (actions) {
      Object.entries(actions).forEach(([name, config]) => {
        processedActions[name] = {
          description: config.description,
          parameters: config.parameters ? createSchemaCompatibleObject(config.parameters) : undefined
        };
      });
    }
    
    // Create a proper ComponentDefinition
    const componentDefinition: ComponentDefinition = {
      ...definition,
      id: component.id,
      // Add schema-compatible properties
      properties: schemaCompatibleProps as any,
      actions: processedActions as any
    };

    try {
      // Register the component
      adapter.registerComponent(null, componentDefinition, handlers);
    } catch (error) {
      console.error(`Error registering component ${componentId}:`, error);
    }

    // Cleanup on unmount
    return () => {
      adapter.unregisterComponent(componentId);
    };
  }, [adapter, initialized, componentId]); // Only depend on stable identifiers
  
  // Create a stable updateState callback
  const updateState = React.useCallback((newState: Record<string, any>) => {
    if (!initialized || !adapter) return;
    
    setState(prev => {
      const merged = { ...prev, ...newState };
      adapter.updateComponentState(componentId, merged);
      return merged;
    });
  }, [initialized, adapter, componentId]);
  
  return { state, updateState };
}

// Interface for AgentFunction configuration
interface AgentFunctionOptions {
  name: string;
  description: string;
  parameters?: any; // Ideally this would be a zod schema
  enabled?: boolean;
  authLevel?: 'public' | 'user' | 'admin';
  tags?: string[];
}

/**
 * Hook for exposing a function to AI agents
 * 
 * @param options Function configuration
 * @param handler Function implementation
 */
export function useAgentFunction<T = any, R = any>(
  options: AgentFunctionOptions,
  handler: (params: T, context: any) => Promise<R> | R
) {
  const { bridge, initialized } = useAgentBridge() || { bridge: null, initialized: false };
  const { name, description, parameters, enabled = true, authLevel, tags } = options;
  
  // Keep a stable reference to the handler
  const handlerRef = React.useRef(handler);
  
  // Update handler ref when handler changes
  React.useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);
  
  // Register function only when dependencies change
  React.useEffect(() => {
    if (!initialized || !bridge || !enabled) return;
    
    // Create a stable function wrapper that uses the latest handler
    const stableHandler = async (params: T, context: any) => {
      return handlerRef.current(params, context);
    };
    
    // Create schema-compatible parameters
    const schemaCompatibleParams = parameters ? createSchemaCompatibleObject(parameters) : { type: 'object', properties: {} };
    
    // Register the function with AgentBridge
    try {
      bridge.registerFunction(
        name,
        description,
        schemaCompatibleParams as any,
        stableHandler,
        {
          authLevel,
          tags
        }
      );
    } catch (error) {
      console.error(`Error registering function ${name}:`, error);
    }
    
    // Cleanup: unregister the function when the component unmounts or dependencies change
    return () => {
      bridge.unregisterFunction(name);
    };
  }, [initialized, bridge, name, description, enabled, parameters, authLevel, tags]);
}

/**
 * Hook for making a component accessible to AI agents
 * 
 * @param componentId Unique identifier for the component
 * @param options Component options
 */
export function useAgentComponent(
  componentId: string,
  options: {
    type: string;
    properties?: Record<string, any>;
    actions?: Record<string, (params?: any) => any>;
  }
) {
  const { adapter, initialized } = useAgentBridge() || { adapter: null, initialized: false };
  const [state, setState] = React.useState<Record<string, any>>({});
  const optionsRef = React.useRef(options);
  
  // Update options ref when options change
  React.useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  
  // Register the component
  React.useEffect(() => {
    if (!initialized || !adapter) return;
    
    const currentOptions = optionsRef.current;
    
    // Make properties schema-compatible
    const schemaCompatibleProps = currentOptions.properties ? 
      createSchemaCompatibleObject(currentOptions.properties) : {};
    
    // Process actions
    const actionDefs: Record<string, { description: string }> = {};
    const actionHandlers: Record<string, any> = {};
    
    if (currentOptions.actions) {
      Object.entries(currentOptions.actions).forEach(([key, handler]) => {
        actionDefs[key] = { description: `Action: ${key}` };
        actionHandlers[key] = handler;
      });
    }
    
    // Create a ComponentDefinition from the options
    const componentDefinition: ComponentDefinition = {
      id: componentId,
      componentType: currentOptions.type,
      description: `Component: ${currentOptions.type}`,
      properties: schemaCompatibleProps as any,
      actions: actionDefs as any
    };
    
    try {
      // Register the component
      adapter.registerComponent(null, componentDefinition, actionHandlers);
    } catch (error) {
      console.error(`Error registering component ${componentId}:`, error);
    }
    
    // Cleanup: unregister the component when the component unmounts
    return () => {
      adapter.unregisterComponent(componentId);
    };
  }, [initialized, adapter, componentId]);
  
  // Create a stable updateState callback
  const updateState = React.useCallback((newState: Record<string, any>) => {
    if (!initialized || !adapter) return;
    
    setState(prev => {
      const merged = { ...prev, ...newState };
      adapter.updateComponentState(componentId, merged);
      return merged;
    });
  }, [initialized, adapter, componentId]);
  
  return { state, updateState };
}

/**
 * Hook for calling a function exposed by AgentBridge
 * 
 * @param functionName Name of the function to call
 */
export function useAgentFunctionCall(functionName: string) {
  const { adapter, initialized } = useAgentBridge() || { adapter: null, initialized: false };
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<FunctionCallResult | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  
  // Create a stable callFunction callback
  const callFunction = React.useCallback(async (
    params: any, 
    context: Record<string, any> = {}
  ) => {
    if (!initialized || !adapter) {
      setError(new Error('AgentBridge is not initialized'));
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await adapter.handleFunctionCall(functionName, params, context);
      setResult(result);
      setIsLoading(false);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsLoading(false);
      return null;
    }
  }, [initialized, adapter, functionName]);
  
  return { callFunction, isLoading, result, error };
} 