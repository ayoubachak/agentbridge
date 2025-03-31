import { useEffect, useState, useCallback, useRef } from 'react';
import { useAgentBridge } from './ReactAdapter';
import { FunctionCallResult, ComponentDefinition, ExecutionContext } from '@agentbridge/core';

/**
 * Hook for registering a component with AgentBridge
 * 
 * @param component Component definition and properties
 */
export function useRegisterComponent(
  component: Omit<ComponentDefinition, 'id' | 'properties'> & { 
    id: string;
    properties?: Record<string, any>;
    actions?: Record<string, {
      description: string;
      handler: (params?: any) => any;
      parameters?: any;
    }>
  }
) {
  const { adapter, isInitialized } = useAgentBridge();
  const registered = useRef(false);

  useEffect(() => {
    if (!isInitialized || !adapter || registered.current) return;

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
    
    // Create a proper ComponentDefinition
    // Note: ComponentDefinition expects a ZodType for properties, but we're using a simple object
    // for ease of use. This is handled in the adapter implementation.
    const componentDefinition: any = {
      ...definition,
      // We'll treat properties as any since we don't want to require Zod schemas
      properties: properties || {},
      actions: actions ? Object.entries(actions).reduce((acc, [name, config]) => {
        acc[name] = {
          description: config.description,
          parameters: config.parameters
        };
        return acc;
      }, {} as Record<string, { description: string; parameters?: any }>) : {}
    };

    // Register the component
    adapter.registerComponent(null, componentDefinition, handlers);

    registered.current = true;

    // Cleanup on unmount
    return () => {
      if (adapter) {
        adapter.unregisterComponent(component.id);
      }
    };
  }, [isInitialized, adapter, component]);
  
  // Get current state and update function
  const [state, setState] = useState<Record<string, any>>({});
  
  const updateState = useCallback((newState: Record<string, any>) => {
    if (!isInitialized || !adapter) return;
    
    setState(prev => {
      const merged = { ...prev, ...newState };
      adapter.updateComponentState(component.id, merged);
      return merged;
    });
  }, [isInitialized, adapter, component.id]);
  
  return { state, updateState };
}

/**
 * Hook for exposing a function to AI agents
 * 
 * @param name Function name
 * @param description Function description
 * @param handler Function implementation
 * @param options Additional options
 */
export function useAgentFunction<T = any, R = any>(
  name: string,
  description: string,
  handler: (params: T, context: any) => Promise<R>,
  options: {
    enabled?: boolean;
    authLevel?: 'public' | 'user' | 'admin';
    tags?: string[];
    parameters?: any; // Ideally this would be a zod schema
  } = {}
) {
  const { bridge, isInitialized } = useAgentBridge();
  const { enabled = true } = options;
  
  useEffect(() => {
    if (!isInitialized || !bridge || !enabled) return;
    
    // Register the function with AgentBridge
    bridge.registerFunction(
      name,
      description,
      options.parameters || { type: 'object', properties: {} } as any,
      handler,
      {
        authLevel: options.authLevel,
        tags: options.tags
      }
    );
    
    // Cleanup: unregister the function when the component unmounts
    return () => {
      bridge.unregisterFunction(name);
    };
  }, [isInitialized, bridge, name, description, handler, enabled, options.authLevel, options.parameters, options.tags]);
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
  const { adapter, isInitialized } = useAgentBridge();
  const [state, setState] = useState<Record<string, any>>({});
  
  // Register the component on mount
  useEffect(() => {
    if (!isInitialized || !adapter) return;
    
    // Create a ComponentDefinition from the options
    // Note: ComponentDefinition expects a ZodType for properties, but we're using a simple object
    // for ease of use. This is handled in the adapter implementation.
    const componentDefinition: any = {
      id: componentId,
      componentType: options.type,
      name: componentId,
      description: `Component: ${options.type}`,
      properties: options.properties || {},
      actions: options.actions ? Object.keys(options.actions).reduce((acc, key) => {
        acc[key] = { description: `Action: ${key}` };
        return acc;
      }, {} as Record<string, { description: string }>) : {}
    };
    
    // Create handlers object from actions
    const handlers = options.actions || {};
    
    adapter.registerComponent(null, componentDefinition, handlers);
    
    // Cleanup: unregister the component when the component unmounts
    return () => {
      adapter.unregisterComponent(componentId);
    };
  }, [isInitialized, adapter, componentId, options]);
  
  // Update the component state
  const updateState = useCallback((newState: Record<string, any>) => {
    if (!isInitialized || !adapter) return;
    
    setState(prev => {
      const merged = { ...prev, ...newState };
      adapter.updateComponentState(componentId, merged);
      return merged;
    });
  }, [isInitialized, adapter, componentId]);
  
  return { state, updateState };
}

/**
 * Hook for calling a function exposed by AgentBridge
 * 
 * @param functionName Name of the function to call
 */
export function useAgentFunctionCall(functionName: string) {
  const { adapter, isInitialized } = useAgentBridge();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FunctionCallResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const callFunction = useCallback(async (
    params: any, 
    context: Record<string, any> = {}
  ) => {
    if (!isInitialized || !adapter) {
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
  }, [isInitialized, adapter, functionName]);
  
  return { callFunction, isLoading, result, error };
} 