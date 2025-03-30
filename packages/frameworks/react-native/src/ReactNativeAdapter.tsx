import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  AgentBridge,
  FrameworkAdapter,
  FunctionCallResult
} from '@agentbridge/core';
import { Platform } from 'react-native';

// Context for storing AgentBridge instance and related state
interface AgentBridgeContextType {
  bridge: AgentBridge | null;
  adapter: ReactNativeAdapter | null;
  isInitialized: boolean;
  componentRegistry: Map<string, {
    type: string;
    props: Record<string, any>;
    state: Record<string, any>;
  }>;
  platform: {
    os: string;
    version: string;
  };
}

const AgentBridgeContext = createContext<AgentBridgeContextType>({
  bridge: null,
  adapter: null,
  isInitialized: false,
  componentRegistry: new Map(),
  platform: {
    os: Platform.OS,
    version: Platform.Version.toString()
  }
});

// Hook for using the AgentBridge context
export const useAgentBridge = () => useContext(AgentBridgeContext);

/**
 * React Native adapter for AgentBridge framework
 */
export class ReactNativeAdapter implements FrameworkAdapter {
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
    
    // Register built-in functions for manipulating React Native components
    this.registerBuiltInFunctions();

    // Update context if available
    if (this.setContextValue) {
      this.setContextValue({
        bridge,
        adapter: this,
        isInitialized: true,
        componentRegistry: this.components,
        platform: {
          os: Platform.OS,
          version: Platform.Version.toString()
        }
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
   * Register built-in functions for manipulating React Native components
   */
  private registerBuiltInFunctions(): void {
    if (!this.bridge) return;

    // Function to get device information
    this.bridge.registerFunction(
      'getDeviceInfo',
      'Get information about the device',
      // Using zod here would be ideal but for simplicity we'll use any
      { type: 'object', properties: {} } as any,
      async (_params, _context) => {
        return {
          platform: Platform.OS,
          version: Platform.Version,
          // Additional device info could be included here
        };
      },
      { authLevel: 'public', tags: ['device', 'info'] }
    );

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
        // on the React Native component. For now, we'll just update the state
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

    // Mobile-specific functions
    this.bridge.registerFunction(
      'vibrate',
      'Make the device vibrate',
      // Using zod here would be ideal but for simplicity we'll use any
      {
        type: 'object',
        properties: {
          pattern: {
            type: 'array',
            items: { type: 'number' }
          },
          duration: { type: 'number' }
        }
      } as any,
      async (params, _context) => {
        const { pattern, duration = 400 } = params;
        
        try {
          // In a real implementation, we would use React Native's Vibration API
          console.log(`Vibrating device with duration ${duration} or pattern ${pattern}`);
          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: 'Failed to vibrate device'
          };
        }
      },
      { authLevel: 'user', tags: ['device', 'haptic'] }
    );
  }

  /**
   * Register a UI component that can be controlled by the AI agent
   * @param componentId Unique identifier for the component
   * @param componentType Type of the component (e.g., 'button', 'input', 'list')
   * @param props Additional properties for the component
   */
  registerComponent(componentId: string, componentType: string, props: Record<string, any> = {}): void {
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
        componentRegistry: this.components,
        platform: {
          os: Platform.OS,
          version: Platform.Version.toString()
        }
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
        componentRegistry: this.components,
        platform: {
          os: Platform.OS,
          version: Platform.Version.toString()
        }
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
        componentRegistry: new Map(this.components),
        platform: {
          os: Platform.OS,
          version: Platform.Version.toString()
        }
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

    return this.bridge.callFunction(functionName, params, {
      agent: {
        id: context.agentId || 'unknown',
        name: context.agentName
      },
      user: context.user,
      application: {
        id: context.appId || 'react-native-app',
        name: context.appName || 'React Native Application',
        environment: context.environment || 'development'
      },
      ip: context.ip
    });
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
}

interface AgentBridgeProviderProps {
  children: ReactNode;
  bridge?: AgentBridge;
  adapter?: ReactNativeAdapter;
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
    componentRegistry: new Map(),
    platform: {
      os: Platform.OS,
      version: Platform.Version.toString()
    }
  });

  useEffect(() => {
    // Initialize with provided bridge and adapter or create new ones
    const bridge = externalBridge || new AgentBridge();
    const adapter = externalAdapter || new ReactNativeAdapter();
    
    // Connect the adapter to the context updater
    adapter.setContextUpdater(setContextValue);
    
    // Initialize the adapter with the bridge
    adapter.initialize(bridge);
    
    // Update the context
    setContextValue({
      bridge,
      adapter,
      isInitialized: true,
      componentRegistry: adapter.getComponents(),
      platform: {
        os: Platform.OS,
        version: Platform.Version.toString()
      }
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