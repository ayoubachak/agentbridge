import React, { createContext, useContext, useEffect, useState } from 'react';
import { AgentBridge, createAgentBridge, CommunicationProvider } from '@agentbridge/core';

interface AgentBridgeContextValue {
  bridge: AgentBridge | null;
  isConnected: boolean;
}

interface AgentBridgeProviderProps {
  communicationProvider: CommunicationProvider;
  debug?: boolean;
  children: React.ReactNode;
}

const AgentBridgeContext = createContext<AgentBridgeContextValue>({
  bridge: null,
  isConnected: false
});

/**
 * Provider component that initializes AgentBridge and provides it through context
 */
export const AgentBridgeProvider: React.FC<AgentBridgeProviderProps> = ({
  communicationProvider,
  debug = false,
  children
}) => {
  const [bridge, setBridge] = useState<AgentBridge | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize the bridge
    const agentBridge = createAgentBridge({
      communicationProvider,
      debug
    });

    // Set up event listeners
    agentBridge.on('connected', () => {
      setIsConnected(true);
    });

    agentBridge.on('disconnected', () => {
      setIsConnected(false);
    });

    // Connect to the provider
    agentBridge.connect();

    // Store the bridge in state
    setBridge(agentBridge);

    // Clean up when unmounting
    return () => {
      agentBridge.disconnect();
    };
  }, [communicationProvider, debug]);

  return (
    <AgentBridgeContext.Provider value={{ bridge, isConnected }}>
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