import { useEffect, useState, useCallback } from 'react';
import { useAgentBridge } from './ReactAdapter';
import { FunctionCallResult } from '@agentbridge/core';

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
 * @param componentType Type of the component (e.g., 'button', 'input')
 * @param props Component properties
 */
export function useAgentComponent(
  componentId: string,
  componentType: string,
  props: Record<string, any> = {}
) {
  const { adapter, isInitialized } = useAgentBridge();
  const [state, setState] = useState<Record<string, any>>({});
  
  // Register the component on mount
  useEffect(() => {
    if (!isInitialized || !adapter) return;
    
    adapter.registerComponent(componentId, componentType, props);
    
    // Cleanup: unregister the component when the component unmounts
    return () => {
      adapter.unregisterComponent(componentId);
    };
  }, [isInitialized, adapter, componentId, componentType, props]);
  
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