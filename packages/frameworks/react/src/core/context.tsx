/**
 * React context for AgentBridge integration
 */
import * as React from 'react';
import { AgentBridge } from '@agentbridge/core';
import { ReactAdapter } from './ReactAdapter';
import { AgentBridgeContextType, ComponentData } from './types';
import { createContextNotFoundError } from '../utils/errors';
import { debug, info, warn } from '../utils/debug';

/**
 * Default context value
 */
const defaultContextValue: AgentBridgeContextType = {
  bridge: null,
  adapter: null,
  initialized: false,
  componentRegistry: new Map<string, ComponentData>()
};

/**
 * Create the React context with default values
 */
export const AgentBridgeContext = React.createContext<AgentBridgeContextType>(defaultContextValue);

/**
 * Add a displayName for better debugging
 */
AgentBridgeContext.displayName = 'AgentBridgeContext';

/**
 * Global singleton value for context when React hook access is unavailable
 * This is used as a fallback to ensure functionality when hooks fail due to version conflicts
 */
let GLOBAL_CONTEXT_VALUE: AgentBridgeContextType = defaultContextValue;

/**
 * Set the global context value - used internally by AgentBridgeProvider
 * @internal
 */
export function setGlobalContextValue(value: AgentBridgeContextType) {
  GLOBAL_CONTEXT_VALUE = value;
}

/**
 * Get the global context value - used as a fallback when hooks fail
 * @internal
 */
export function getGlobalContextValue(): AgentBridgeContextType {
  return GLOBAL_CONTEXT_VALUE;
}

/**
 * Create a stable context value that won't cause unnecessary re-renders
 */
export function createStableContextValue(
  bridge: AgentBridge | null,
  adapter: any,
  initialized: boolean,
  componentRegistry: Map<string, ComponentData>
): AgentBridgeContextType {
  return {
    bridge,
    adapter,
    initialized,
    componentRegistry
  };
}

/**
 * React hook to access AgentBridge context
 * @returns AgentBridge context values
 */
export function useAgentBridgeContext(): AgentBridgeContextType {
  // Try to use React hooks, but provide a fallback if they don't work
  try {
    // First try the standard context hook
    const context = React.useContext(AgentBridgeContext);
    
    // Help developers troubleshoot context issues in development
    if (process.env.NODE_ENV === 'development') {
      try {
        // Use try-catch to make this more resilient to React version conflicts
        if (typeof React.useDebugValue === 'function') {
          React.useDebugValue({
            status: context.initialized ? 'Connected' : 'Disconnected',
            componentsCount: context.componentRegistry.size,
            bridgeAvailable: !!context.bridge
          });
        }
      } catch (err) {
        // Silently ignore debug value errors
      }
    }
    
    // Warn developers in development mode if they're using hooks outside provider
    if (!context.bridge && process.env.NODE_ENV === 'development') {
      warn(
        'AgentBridge context is not available. Make sure you are using ' +
        'useAgentBridgeContext() within an <AgentBridgeProvider> component tree.'
      );
    }
    
    return context;
  } catch (err) {
    // If hooks fail, use the global value as fallback
    debug('React context hook failed, using global value fallback - this is typically caused by React version conflicts', err);
    return getGlobalContextValue();
  }
}

/**
 * Non-hook function to access AgentBridge context
 * This version is safe to use anywhere, including outside React components
 * @returns AgentBridge context values
 */
export function getAgentBridgeContext(): AgentBridgeContextType {
  return getGlobalContextValue();
}

/**
 * React hook to access AgentBridge instance or throw if not available
 * @throws {ContextError} When bridge is not initialized
 */
export function useAgentBridgeOrThrow(): AgentBridge {
  const { bridge, initialized } = useAgentBridgeContext();
  
  if (!initialized || !bridge) {
    throw createContextNotFoundError('bridge');
  }
  
  return bridge;
}

/**
 * Non-hook function to access AgentBridge instance or throw if not available
 * @throws {ContextError} When bridge is not initialized 
 */
export function getAgentBridgeOrThrow(): AgentBridge {
  const { bridge, initialized } = getAgentBridgeContext();
  
  if (!initialized || !bridge) {
    throw createContextNotFoundError('bridge');
  }
  
  return bridge;
}

/**
 * React hook to access ReactAdapter instance or throw if not available
 * @throws {ContextError} When adapter is not initialized
 */
export function useReactAdapterOrThrow(): any {
  const { adapter, initialized } = useAgentBridgeContext();
  
  if (!initialized || !adapter) {
    throw createContextNotFoundError('adapter');
  }
  
  return adapter;
}

/**
 * Non-hook function to access ReactAdapter instance or throw if not available
 * @throws {ContextError} When adapter is not initialized
 */
export function getReactAdapterOrThrow(): any {
  const { adapter, initialized } = getAgentBridgeContext();
  
  if (!initialized || !adapter) {
    throw createContextNotFoundError('adapter');
  }
  
  return adapter;
}

/**
 * React hook to check if AgentBridge is initialized
 */
export function useAgentBridgeInitialized(): boolean {
  const { initialized } = useAgentBridgeContext();
  return initialized;
}

/**
 * Non-hook function to check if AgentBridge is initialized
 */
export function isAgentBridgeInitialized(): boolean {
  const { initialized } = getAgentBridgeContext();
  return initialized;
}

/**
 * React hook to access a specific component from the registry
 * @param componentId The component ID to retrieve
 * @returns The component data or undefined if not found
 */
export function useAgentComponent(componentId: string): ComponentData | undefined {
  const { componentRegistry } = useAgentBridgeContext();
  return componentRegistry.get(componentId);
}

/**
 * Non-hook function to access a specific component from the registry
 * @param componentId The component ID to retrieve
 * @returns The component data or undefined if not found
 */
export function getAgentComponent(componentId: string): ComponentData | undefined {
  const { componentRegistry } = getAgentBridgeContext();
  return componentRegistry.get(componentId);
}

/**
 * Context provider for AgentBridge
 */
export const AgentBridgeContextProvider: React.FC<{
  value: AgentBridgeContextType;
  children: React.ReactNode;
}> = ({ value, children }) => {
  // Log when the provider renders in development
  if (process.env.NODE_ENV === 'development') {
    debug('AgentBridgeContextProvider rendering', {
      initialized: value.initialized,
      componentsCount: value.componentRegistry.size
    });
  }
  
  // Update the global context value to ensure fallback works
  setGlobalContextValue(value);
  
  return (
    <AgentBridgeContext.Provider value={value}>
      {children}
    </AgentBridgeContext.Provider>
  );
}; 