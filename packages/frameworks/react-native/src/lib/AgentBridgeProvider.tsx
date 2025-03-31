import React, { createContext, useContext, useEffect, useState } from 'react';
import { AgentBridge, createAgentBridge, CommunicationProvider, AgentBridgeConfig } from '@agentbridge/core';
import { ReactNativeAdapter } from '../ReactNativeAdapter';

interface AgentBridgeContextValue {
  bridge: AgentBridge | null;
  adapter: ReactNativeAdapter | null;
  isInitialized: boolean;
  isConnected: boolean;
}

interface AgentBridgeProviderProps {
  communication?: {
    provider?: CommunicationProvider;
    mode?: 'self-hosted' | 'pubsub';
    options?: any;
  };
  debug?: boolean;
  children: React.ReactNode;
}

const AgentBridgeContext = createContext<AgentBridgeContextValue>({
  bridge: null,
  adapter: null,
  isInitialized: false,
  isConnected: false
});

/**
 * Provider component that initializes AgentBridge and provides it through context
 */
export const AgentBridgeProvider: React.FC<AgentBridgeProviderProps> = ({
  communication,
  debug = false,
  children
}) => {
  const [bridge, setBridge] = useState<AgentBridge | null>(null);
  const [adapter, setAdapter] = useState<ReactNativeAdapter | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize the bridge
    const config: AgentBridgeConfig = {};

    // Configure communication if provided
    if (communication) {
      config.communication = {
        mode: communication.mode || 'pubsub',
        pubsub: communication.provider ? {
          provider: 'custom',
          implementation: communication.provider,
          options: communication.options || {}
        } : undefined
      };
    }

    // Create the bridge and adapter
    const agentBridge = createAgentBridge(config);
    const reactNativeAdapter = new ReactNativeAdapter();
    
    // Initialize the adapter with the bridge
    reactNativeAdapter.initialize(agentBridge);

    // Log debug information if debug is enabled
    if (debug) {
      console.log('[AgentBridge] Initialized with config:', config);
    }

    // Set up event listeners for connection status
    const handleConnect = () => {
      setIsConnected(true);
      if (debug) {
        console.log('[AgentBridge] Connected');
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      if (debug) {
        console.log('[AgentBridge] Disconnected');
      }
    };

    // Add event listeners if supported
    if ('on' in agentBridge) {
      (agentBridge as any).on('connected', handleConnect);
      (agentBridge as any).on('disconnected', handleDisconnect);
    }

    // Store the bridge and adapter in state
    setBridge(agentBridge);
    setAdapter(reactNativeAdapter);
    setIsInitialized(true);

    // Connect to the provider if connect method exists
    if ('connect' in agentBridge) {
      (agentBridge as any).connect().catch((err: any) => {
        console.error('Failed to connect to AgentBridge provider:', err);
      });
    }

    // Clean up when unmounting
    return () => {
      // Remove event listeners
      if ('off' in agentBridge) {
        (agentBridge as any).off('connected', handleConnect);
        (agentBridge as any).off('disconnected', handleDisconnect);
      }
      
      // Disconnect if possible
      if ('disconnect' in agentBridge) {
        (agentBridge as any).disconnect().catch((err: any) => {
          console.error('Failed to disconnect from AgentBridge provider:', err);
        });
      }
      
      // Dispose the adapter
      reactNativeAdapter.dispose();
    };
  }, [communication, debug]);

  return (
    <AgentBridgeContext.Provider value={{ bridge, adapter, isInitialized, isConnected }}>
      {children}
    </AgentBridgeContext.Provider>
  );
};

/**
 * Hook to access the AgentBridge instance and connection status
 */
export const useAgentBridge = () => {
  const context = useContext(AgentBridgeContext);
  
  if (context === undefined) {
    throw new Error('useAgentBridge must be used within an AgentBridgeProvider');
  }
  
  return context;
}; 