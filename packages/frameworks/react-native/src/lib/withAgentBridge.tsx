import React, { useEffect } from 'react';
import { ComponentDefinition } from '@agentbridge/core';
import { useAgentBridge } from './AgentBridgeProvider';

interface WithAgentBridgeProps {
  agentBridgeId?: string;
  agentBridgeType?: string;
  agentBridgeDescription?: string;
  agentBridgeProps?: Record<string, any>;
  agentBridgeActions?: Record<string, (params?: any) => any>;
}

// Interface for HOC options
interface AgentBridgeComponentOptions {
  id?: string;
  componentType: string;
  description?: string;
  properties?: Record<string, any>;
  actions?: Record<string, {
    description: string;
    handler: (params?: any) => any;
  }>;
}

/**
 * Higher-Order Component (HOC) that registers a React Native component with AgentBridge
 * @param Component The component to wrap
 * @param options Configuration for the component
 */
export function withAgentBridge<P extends object>(
  Component: React.ComponentType<P>,
  options: AgentBridgeComponentOptions
) {
  // Function component wrapper that will handle registration
  const WithAgentBridgeComponent = (props: P & WithAgentBridgeProps) => {
    const { 
      agentBridgeId, 
      agentBridgeType,
      agentBridgeDescription, 
      agentBridgeProps, 
      agentBridgeActions,
      ...componentProps 
    } = props;
    
    const { adapter, isInitialized } = useAgentBridge();
    
    useEffect(() => {
      if (!isInitialized || !adapter) return;
      
      // Generate a unique ID if not provided
      const id = agentBridgeId || options.id || `component-${Component.displayName || 'Component'}-${Date.now()}`;
      
      // Create component definition
      const componentDefinition: any = {
        id,
        componentType: agentBridgeType || options.componentType,
        description: options.description || agentBridgeDescription || `React Native ${options.componentType} component`,
        properties: undefined // We'll add properties in a way that's compatible with the adapter
      };
      
      // Create handlers from actions
      const handlers: Record<string, any> = {};
      
      // Add actions from options
      if (options.actions) {
        componentDefinition.actions = {};
        
        Object.entries(options.actions).forEach(([actionName, actionConfig]) => {
          // Add action definition to componentDefinition
          componentDefinition.actions[actionName] = {
            description: actionConfig.description
          };
          
          // Add handler to handlers object
          handlers[actionName] = actionConfig.handler;
        });
      }
      
      // Add actions from props
      if (agentBridgeActions) {
        componentDefinition.actions = componentDefinition.actions || {};
        
        Object.entries(agentBridgeActions).forEach(([actionName, handler]) => {
          // Add action definition to componentDefinition
          componentDefinition.actions[actionName] = {
            description: `Action: ${actionName}`
          };
          
          // Add handler to handlers object
          handlers[actionName] = handler;
        });
      }
      
      // Register the component with the adapter
      adapter.registerComponent(
        Component, 
        componentDefinition, 
        options.properties || agentBridgeProps || {}
      );
      
      // Cleanup: unregister the component when unmounting
      return () => {
        adapter.unregisterComponent(id);
      };
    }, [adapter, isInitialized, agentBridgeId, agentBridgeType, agentBridgeDescription, agentBridgeProps, agentBridgeActions]);
    
    return <Component {...(componentProps as P)} />;
  };
  
  // Set display name for debugging
  WithAgentBridgeComponent.displayName = `withAgentBridge(${Component.displayName || Component.name || 'Component'})`;
  
  return WithAgentBridgeComponent;
} 