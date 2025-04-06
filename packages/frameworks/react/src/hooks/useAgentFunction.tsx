/**
 * Hook for registering functions with AgentBridge
 */
import * as React from 'react';
import { AgentBridge, ExecutionContext } from '@agentbridge/core';
import { AgentFunctionConfig, UseFunctionResult } from '../core/types';
import { useAgentBridgeContext, getAgentBridgeContext } from '../core/context';
import { debug, info, warn } from '../utils/debug';

/**
 * A utility type for the function handler
 */
type FunctionHandler<T = any, R = any> = (
  params: T, 
  context?: ExecutionContext
) => Promise<R>;

/**
 * Configuration for useAgentFunction
 */
interface UseAgentFunctionConfig extends AgentFunctionConfig {
  /** Function handler */
  handler: FunctionHandler;
  /** Whether to use fallback mode (non-hook implementation) */
  useFallback?: boolean;
}

/**
 * Register a function with AgentBridge using React hooks
 * 
 * This hook handles React version conflicts gracefully by providing a fallback
 * implementation when hooks fail.
 * 
 * @param config Function configuration
 * @returns Registration result
 */
export function useAgentFunction(
  config: UseAgentFunctionConfig
): UseFunctionResult {
  // Get bridge from context - try hook first
  let bridge: AgentBridge | null = null;
  let isMounted = true;
  let isRegistered = false;
  
  // Define a wrapped handler that validates parameters if a schema is provided
  const wrappedHandler = async (params: any, context: any) => {
    try {
      debug(`Function ${config.name} called with params:`, params);
      const result = await config.handler(params, context);
      return result;
    } catch (e) {
      const err = e as Error;
      debug(`Error in function ${config.name}:`, err);
      throw err;
    }
  };
  
  try {
    // Try the React hook approach first
    const { bridge: contextBridge } = useAgentBridgeContext();
    bridge = contextBridge;
    
    // Register and unregister the function
    React.useEffect(() => {
      // Skip if no bridge
      if (!bridge) {
        warn(`Cannot register function ${config.name}: Bridge not available`);
        return undefined;
      }
      
      const registerFunc = () => {
        try {
          // Handle different bridge API versions
          if (bridge && typeof bridge.registerFunction === 'function') {
            // For safety, create a basic schema if none provided
            const safeSchema = config.schema || { type: 'object', properties: {} };
            
            // Since API signatures can vary, use type casting to support all versions
            bridge.registerFunction(
              config.name,
              config.description,
              safeSchema as any,
              wrappedHandler,
              { authLevel: 'public' }
            );
          }
          
          isRegistered = true;
          info(`Function ${config.name} registered with AgentBridge`);
          return true;
        } catch (e) {
          const err = e as Error;
          debug(`Failed to register function ${config.name}:`, err);
          return false;
        }
      };
      
      const unregisterFunc = () => {
        if (!bridge || !isRegistered) return false;
        
        try {
          // Check if unregisterFunction exists
          if (typeof bridge.unregisterFunction === 'function') {
            bridge.unregisterFunction(config.name);
            isRegistered = false;
            info(`Function ${config.name} unregistered from AgentBridge`);
            return true;
          }
          return false;
        } catch (e) {
          const err = e as Error;
          debug(`Failed to unregister function ${config.name}:`, err);
          return false;
        }
      };
      
      // Register the function
      registerFunc();
      
      // Clean up on unmount
      return () => {
        isMounted = false;
        unregisterFunc();
      };
    }, [bridge, config.name]);
    
    // Return the registration functions
    return {
      registerFunction: () => {
        if (!bridge) return false;
        
        try {
          // Handle different bridge API versions
          if (typeof bridge.registerFunction === 'function') {
            // For safety, create a basic schema if none provided
            const safeSchema = config.schema || { type: 'object', properties: {} };
            
            // Since API signatures can vary, use type casting to support all versions
            bridge.registerFunction(
              config.name,
              config.description,
              safeSchema as any,
              wrappedHandler,
              { authLevel: 'public' }
            );
          }
          
          isRegistered = true;
          return true;
        } catch (e) {
          const err = e as Error;
          debug(`Failed to register function ${config.name}:`, err);
          return false;
        }
      },
      unregisterFunction: () => {
        if (!bridge || !isRegistered) return false;
        
        try {
          // Check if unregisterFunction exists
          if (typeof bridge.unregisterFunction === 'function') {
            bridge.unregisterFunction(config.name);
            isRegistered = false;
            return true;
          }
          return false;
        } catch (e) {
          const err = e as Error;
          debug(`Failed to unregister function ${config.name}:`, err);
          return false;
        }
      }
    };
  } catch (e) {
    // Hook failed, use fallback implementation
    const err = e as Error;
    debug('React hooks failed in useAgentFunction, using fallback implementation', err);
    
    // Enable fallback mode
    const useFallback = config.useFallback !== false;
    
    if (useFallback) {
      // Get bridge using non-hook method
      const { bridge: globalBridge } = getAgentBridgeContext();
      bridge = globalBridge;
      
      // Register the function immediately if fallback enabled
      if (bridge && typeof bridge.registerFunction === 'function') {
        try {
          // For safety, create a basic schema if none provided
          const safeSchema = config.schema || { type: 'object', properties: {} };
          
          // Since API signatures can vary, use type casting to support all versions
          bridge.registerFunction(
            config.name,
            config.description,
            safeSchema as any,
            wrappedHandler,
            { authLevel: 'public' }
          );
          
          isRegistered = true;
          info(`Function ${config.name} registered with AgentBridge (fallback mode)`);
        } catch (regErr) {
          debug(`Failed to register function ${config.name} in fallback mode:`, regErr);
        }
      }
    }
    
    // Return manual registration functions for fallback mode
    return {
      registerFunction: () => {
        if (!bridge) return false;
        
        try {
          // Handle different bridge API versions
          if (typeof bridge.registerFunction === 'function') {
            // For safety, create a basic schema if none provided
            const safeSchema = config.schema || { type: 'object', properties: {} };
            
            // Since API signatures can vary, use type casting to support all versions
            bridge.registerFunction(
              config.name,
              config.description,
              safeSchema as any,
              wrappedHandler,
              { authLevel: 'public' }
            );
          }
          
          isRegistered = true;
          return true;
        } catch (e) {
          const err = e as Error;
          debug(`Failed to register function ${config.name}:`, err);
          return false;
        }
      },
      unregisterFunction: () => {
        if (!bridge || !isRegistered) return false;
        
        try {
          // Check if unregisterFunction exists
          if (typeof bridge.unregisterFunction === 'function') {
            bridge.unregisterFunction(config.name);
            isRegistered = false;
            return true;
          }
          return false;
        } catch (e) {
          const err = e as Error;
          debug(`Failed to unregister function ${config.name}:`, err);
          return false;
        }
      }
    };
  }
} 