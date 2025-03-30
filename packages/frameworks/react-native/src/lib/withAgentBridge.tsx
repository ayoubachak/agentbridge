import React, { useEffect } from 'react';
import { ComponentDefinition } from '@agentbridge/core';
import { useAgentBridge } from './AgentBridgeProvider';

interface WithAgentBridgeProps {
  agentBridgeId?: string;
  agentBridgeName?: string;
  agentBridgeDescription?: string;
  agentBridgeProps?: Record<string, any>;
}

/**
 * Higher-Order Component (HOC) that registers a React Native component with AgentBridge
 * @param Component The component to wrap
 * @param options Optional static configuration for the component
 */
export function withAgentBridge<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ComponentDefinition, 'component' | 'id'>
) {
  // Function component wrapper that will handle registration
  const WithAgentBridgeComponent = (props: P & WithAgentBridgeProps) => {
    const { 
      agentBridgeId, 
      agentBridgeName, 
      agentBridgeDescription, 
      agentBridgeProps, 
      ...componentProps 
    } = props;
    
    const { bridge } = useAgentBridge();
    
    useEffect(() => {
      if (!bridge) return;
      
      // Generate a unique ID if not provided
      const id = agentBridgeId || `${options?.name || agentBridgeName || Component.displayName || Component.name}-${Date.now()}`;
      
      // Register the component with AgentBridge
      bridge.registerComponent({
        id,
        name: options?.name || agentBridgeName || Component.displayName || Component.name,
        description: options?.description || agentBridgeDescription || '',
        props: options?.props || agentBridgeProps || {},
        component: Component
      });
      
      // No cleanup needed as there's currently no way to unregister components
    }, [bridge]);
    
    return <Component {...(componentProps as P)} />;
  };
  
  // Set display name for debugging
  WithAgentBridgeComponent.displayName = `withAgentBridge(${Component.displayName || Component.name || 'Component'})`;
  
  return WithAgentBridgeComponent;
} 