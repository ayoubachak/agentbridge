/**
 * React adapter for AgentBridge - Legacy API
 * 
 * This module provides compatibility with older versions of AgentBridge React integration.
 * For new code, use the core ReactAdapter directly.
 */
import * as React from 'react';
import { AgentBridge } from '@agentbridge/core';
import { debug, error, info, warn } from './utils/debug';
import { ComponentData, ReactAdapterConfiguration, AgentBridgeContextType } from './core/types';
import { ReactAdapter as CoreReactAdapter } from './core/ReactAdapter';

// Context for storing AgentBridge instance and related state
const AgentBridgeContext = React.createContext<AgentBridgeContextType>({
  bridge: null,
  adapter: null,
  initialized: false,
  componentRegistry: new Map<string, ComponentData>()
});

// Provide a clear name for debugging purposes
AgentBridgeContext.displayName = 'AgentBridgeContext';

// Hook for using the AgentBridge context
export const useAgentBridge = (): AgentBridgeContextType => {
  const context = React.useContext(AgentBridgeContext);
  
  // Help developers troubleshoot context issues
  if (process.env.NODE_ENV !== 'production') {
    try {
      if (typeof React.useDebugValue === 'function') {
        React.useDebugValue(context.initialized ? 'AgentBridge Connected' : 'AgentBridge Disconnected');
      }
    } catch (err) {
      // Ignore errors with useDebugValue
    }
  }
  
  return context;
};

// Re-export the ReactAdapter from core for direct use
export { CoreReactAdapter as ReactAdapter };

// Provider component for AgentBridge context
export const AgentBridgeProvider: React.FC<{
  bridge?: AgentBridge;
  adapter?: CoreReactAdapter;
  debug?: boolean;
  children: React.ReactNode;
}> = ({ 
  bridge: userBridge, 
  adapter: userAdapter, 
  debug: enableDebug = false, 
  children 
}) => {
  // Initialize state for context
  const [contextValue, setContextValue] = React.useState<AgentBridgeContextType>({
    bridge: null,
    adapter: null,
    initialized: false,
    componentRegistry: new Map<string, ComponentData>()
  });
  
  // Create and initialize bridge and adapter on mount
  React.useEffect(() => {
    // Use provided instances or create new ones
    const bridge = userBridge || new AgentBridge();
    const adapter = userAdapter || new CoreReactAdapter({ 
      debug: enableDebug 
    });
    
    try {
      info('Initializing AgentBridge provider');
      
      // Initialize adapter with bridge
      if (!adapter.isInitialized()) {
        adapter.initialize(bridge);
      }
      
      // Set up the context updater
      adapter.setContextUpdater((registry) => {
        setContextValue({
          bridge,
          adapter,
          initialized: true,
          componentRegistry: registry
        });
      });
      
      // Update context with initial values
      setContextValue({
        bridge,
        adapter,
        initialized: true,
        componentRegistry: adapter.getComponents()
      });
      
      debug('AgentBridge provider initialized successfully');
    } catch (err) {
      error('Failed to initialize AgentBridge provider', err);
    }
    
    // Clean up on unmount
    return () => {
      if (adapter && !userAdapter) {
        try {
          info('Disposing adapter on unmount');
          adapter.dispose();
        } catch (err) {
          error('Error disposing adapter', err);
        }
      }
    };
  }, [userBridge, userAdapter, enableDebug]);
  
  return (
    <AgentBridgeContext.Provider value={contextValue}>
      {children}
    </AgentBridgeContext.Provider>
  );
}; 