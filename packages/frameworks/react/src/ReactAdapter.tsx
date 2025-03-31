import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  AgentBridge,
  FrameworkAdapter,
  FunctionCallResult,
  ComponentDefinition,
  ExecutionContext
} from '@agentbridge/core';

// Context for storing AgentBridge instance and related state
interface AgentBridgeContextType {
  bridge: AgentBridge | null;
  adapter: ReactAdapter | null;
  isInitialized: boolean;
  componentRegistry: Map<string, {
    type: string;
    props: Record<string, any>;
    state: Record<string, any>;
  }>;
}

const AgentBridgeContext = createContext<AgentBridgeContextType>({
  bridge: null,
  adapter: null,
  isInitialized: false,
  componentRegistry: new Map()
});

// Hook for using the AgentBridge context
export const useAgentBridge = () => useContext(AgentBridgeContext);

/**
 * React adapter for AgentBridge framework
 */
export class ReactAdapter implements FrameworkAdapter {
  private bridge: AgentBridge | null = null;
  private components: Map<string, {
    type: string;
    props: Record<string, any>;
    state: Record<string, any>;
  }> = new Map();
  private setContextValue: React.Dispatch<React.SetStateAction<AgentBridgeContextType>> | null = null;

  /**
   * Initialize the adapter with an AgentBridge instance
   * @param bridge AgentBridge instance
   */
  initialize(bridge: AgentBridge): void {
    this.bridge = bridge;
    
    // Register built-in functions for manipulating React components
    this.registerBuiltInFunctions();

    // Update context if available
    if (this.setContextValue) {
      this.setContextValue({
        bridge,
        adapter: this,
        isInitialized: true,
        componentRegistry: this.components
      });
    }
  }

  /**
   * Set the context value updater function
   * @param setter Context setter function
   */
  setContextUpdater(setter: React.Dispatch<React.SetStateAction<AgentBridgeContextType>>): void {
    this.setContextValue = setter;
  }

  /**
   * Register built-in functions for manipulating React components
   */
  private registerBuiltInFunctions(): void {
    if (!this.bridge) return;

    // Function to get all registered components
    this.bridge.registerFunction(
      'getComponents',
      'Get all registered components',
      // Using zod here would be ideal but for simplicity we'll use any
      { type: 'object', properties: {} } as any,
      async (_params, _context) => {
        return Array.from(this.components.entries()).map(([id, info]) => ({
          id,
          type: info.type,
          props: info.props,
          state: info.state
        }));
      },
      { authLevel: 'public', tags: ['ui', 'component'] }
    );

    // Function to update a component's state
    this.bridge.registerFunction(
      'updateComponentState',
      'Update the state of a UI component',
      // Using zod here would be ideal but for simplicity we'll use any
      {
        type: 'object',
        properties: {
          componentId: { type: 'string' },
          state: { type: 'object' }
        },
        required: ['componentId', 'state']
      } as any,
      async (params, _context) => {
        const { componentId, state } = params;
        this.updateComponentState(componentId, state);
        return { success: true };
      },
      { authLevel: 'public', tags: ['ui', 'component'] }
    );

    // Function to trigger events on components
    this.bridge.registerFunction(
      'triggerComponentEvent',
      'Trigger an event on a UI component',
      // Using zod here would be ideal but for simplicity we'll use any
      {
        type: 'object',
        properties: {
          componentId: { type: 'string' },
          event: { type: 'string' },
          payload: { type: 'object' }
        },
        required: ['componentId', 'event']
      } as any,
      async (params, _context) => {
        const { componentId, event, payload } = params;
        const component = this.components.get(componentId);
        
        if (!component) {
          return {
            success: false,
            error: `Component with ID '${componentId}' not found`
          };
        }

        // In a real implementation, this would trigger the actual event
        // on the React component. For now, we'll just update the state
        // to reflect that the event was triggered.
        const updatedState = {
          ...component.state,
          lastEvent: { type: event, payload, timestamp: new Date() }
        };

        this.updateComponentState(componentId, updatedState);
        
        return { success: true, componentId, event };
      },
      { authLevel: 'public', tags: ['ui', 'component', 'event'] }
    );
  }

  /**
   * Register a framework-specific UI component
   * @param component The component object or reference
   * @param definition Component definition
   * @param handlers Component handlers
   */
  registerComponent(
    component: any, 
    definition: ComponentDefinition, 
    handlers: any
  ): void {
    const componentId = definition.id;
    const componentType = definition.componentType;
    const props = definition.properties ? {} : {};

    if (this.components.has(componentId)) {
      console.warn(`Component with ID '${componentId}' is already registered. It will be overwritten.`);
    }

    this.components.set(componentId, {
      type: componentType,
      props,
      state: {}
    });

    // Update context if available
    if (this.setContextValue && this.bridge) {
      this.setContextValue({
        bridge: this.bridge,
        adapter: this,
        isInitialized: true,
        componentRegistry: this.components
      });
    }
  }

  // Keep the original implementation for backwards compatibility
  registerComponentByDetails(componentId: string, componentType: string, props: Record<string, any> = {}): void {
    if (this.components.has(componentId)) {
      console.warn(`Component with ID '${componentId}' is already registered. It will be overwritten.`);
    }

    this.components.set(componentId, {
      type: componentType,
      props,
      state: {}
    });

    // Update context if available
    if (this.setContextValue && this.bridge) {
      this.setContextValue({
        bridge: this.bridge,
        adapter: this,
        isInitialized: true,
        componentRegistry: this.components
      });
    }
  }

  /**
   * Unregister a UI component
   * @param componentId Component identifier
   */
  unregisterComponent(componentId: string): void {
    this.components.delete(componentId);

    // Update context if available
    if (this.setContextValue && this.bridge) {
      this.setContextValue({
        bridge: this.bridge,
        adapter: this,
        isInitialized: true,
        componentRegistry: this.components
      });
    }
  }

  /**
   * Update a UI component's state
   * @param componentId Component identifier
   * @param state New state object
   */
  updateComponentState(componentId: string, state: Record<string, any>): void {
    const component = this.components.get(componentId);
    
    if (!component) {
      console.warn(`Cannot update state: Component with ID '${componentId}' not found`);
      return;
    }

    // Update the component's state
    this.components.set(componentId, {
      ...component,
      state: { ...component.state, ...state }
    });

    // Update context if available
    if (this.setContextValue && this.bridge) {
      this.setContextValue({
        bridge: this.bridge,
        adapter: this,
        isInitialized: true,
        componentRegistry: new Map(this.components)
      });
    }
  }

  /**
   * Handle a function call made by an AI agent
   * @param functionName Name of the function to call
   * @param params Parameters for the function
   * @param context Context information
   * @returns Result of the function call
   */
  async handleFunctionCall(
    functionName: string, 
    params: any, 
    context: Record<string, any>
  ): Promise<FunctionCallResult> {
    if (!this.bridge) {
      return {
        success: false,
        function: functionName,
        params: params,
        error: {
          code: 'NOT_INITIALIZED',
          message: 'AgentBridge is not initialized'
        },
        meta: {
          durationMs: 0,
          startedAt: new Date(),
          completedAt: new Date()
        }
      };
    }

    // Call the function and add the required properties 
    const result = await this.bridge.callFunction(functionName, params, {
      agent: {
        id: context.agentId || 'unknown',
        name: context.agentName
      },
      user: context.user,
      application: {
        id: context.appId || 'react-app',
        name: context.appName || 'React Application',
        environment: context.environment || 'development'
      },
      ip: context.ip
    });

    // Add function and params to the result to make it a FunctionCallResult
    return {
      ...result,
      function: functionName,
      params: params
    } as FunctionCallResult;
  }

  /**
   * Get the list of registered components
   * @returns Map of component IDs to component information
   */
  getComponents(): Map<string, { type: string; props: Record<string, any>; state: Record<string, any> }> {
    return this.components;
  }

  /**
   * Convert the adapter to a different framework
   * @param targetFramework Name of the target framework
   * @returns A new adapter for the target framework or null if not supported
   */
  convertTo(targetFramework: string): FrameworkAdapter | null {
    // Implementation would convert this adapter to another framework
    // This is a placeholder for future implementation
    console.warn(`Conversion to ${targetFramework} is not implemented yet`);
    return null;
  }

  /**
   * Render a component based on its properties
   * @param component Component to render
   * @param props Component properties
   */
  renderComponent(component: any, props: any): any {
    // React doesn't need this explicit call since rendering is handled by React's rendering system
    console.log('React components are rendered by React, not manually.');
    return null;
  }

  /**
   * Update a UI component based on properties received from an AI agent
   * @param componentId Component identifier
   * @param properties New properties to apply to the component
   * @param context Execution context
   */
  async updateComponent(
    componentId: string, 
    properties: any, 
    context: ExecutionContext
  ): Promise<void> {
    this.updateComponentState(componentId, properties);
  }

  /**
   * Execute a component action triggered by an AI agent
   * @param componentId Component identifier
   * @param action Action name
   * @param params Action parameters
   * @param context Execution context
   */
  async executeComponentAction(
    componentId: string,
    action: string,
    params: any,
    context: ExecutionContext
  ): Promise<any> {
    console.warn(`Component action execution not implemented for ${componentId}.${action}`);
    return { success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Action execution not implemented' } };
  }

  /**
   * Get component definitions for all registered components
   * @returns Array of component definitions
   */
  getComponentDefinitions(): ComponentDefinition[] {
    return Array.from(this.components.entries()).map(([id, component]) => ({
      id,
      componentType: component.type,
      description: `React component: ${component.type}`,
      properties: undefined
    }));
  }

  /**
   * Called when the adapter should clean up resources
   */
  dispose(): void {
    this.components.clear();
    this.bridge = null;
    this.setContextValue = null;
  }
}

interface AgentBridgeProviderProps {
  children: ReactNode;
  bridge?: AgentBridge;
  adapter?: ReactAdapter;
}

/**
 * Provider component for AgentBridge
 */
export const AgentBridgeProvider: React.FC<AgentBridgeProviderProps> = ({
  children,
  bridge: externalBridge,
  adapter: externalAdapter
}) => {
  const [contextValue, setContextValue] = useState<AgentBridgeContextType>({
    bridge: null,
    adapter: null,
    isInitialized: false,
    componentRegistry: new Map()
  });

  useEffect(() => {
    // Initialize with provided bridge and adapter or create new ones
    const bridge = externalBridge || new AgentBridge();
    const adapter = externalAdapter || new ReactAdapter();
    
    // Connect the adapter to the context updater
    adapter.setContextUpdater(setContextValue);
    
    // Initialize the adapter with the bridge
    adapter.initialize(bridge);
    
    // Update the context
    setContextValue({
      bridge,
      adapter,
      isInitialized: true,
      componentRegistry: adapter.getComponents()
    });
    
    return () => {
      // Cleanup logic could go here if needed
    };
  }, [externalBridge, externalAdapter]);

  return (
    <AgentBridgeContext.Provider value={contextValue}>
      {children}
    </AgentBridgeContext.Provider>
  );
}; 