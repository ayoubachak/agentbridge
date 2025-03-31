import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  ComponentDefinition, 
  FunctionDefinition,
  FunctionImplementation,
  ExecutionContext
} from '@agentbridge/core';
import { useAgentBridge } from './AgentBridgeProvider';

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
 * Hook for registering a function with AgentBridge
 * 
 * @param definition The function definition
 * @param implementation The function implementation
 */
export function useRegisterFunction<T extends Record<string, any>, R>(
  definition: {
    name: string;
    description: string;
    parameters: any; // Should be a Zod schema in real implementation
    authLevel?: 'public' | 'user' | 'admin';
    tags?: string[];
  },
  implementation: (params: T, context: ExecutionContext) => Promise<R>
) {
  const { bridge, isInitialized } = useAgentBridge();
  const registered = useRef(false);

  useEffect(() => {
    if (!isInitialized || !bridge || registered.current) return;

    // Register the function with the correct signature
    bridge.registerFunction(
      definition.name,
      definition.description,
      definition.parameters,
      implementation,
      {
        authLevel: definition.authLevel,
        tags: definition.tags
      }
    );

    registered.current = true;

    // Cleanup: unregister the function when the component unmounts
    return () => {
      if (bridge) {
        bridge.unregisterFunction(definition.name);
      }
    };
  }, [isInitialized, bridge, definition, implementation]);
}

/**
 * Hook for calling a function exposed by AgentBridge
 * 
 * @param functionName Name of the function to call
 */
export function useAgentFunctionCall(functionName: string) {
  const { adapter, isInitialized } = useAgentBridge();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
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