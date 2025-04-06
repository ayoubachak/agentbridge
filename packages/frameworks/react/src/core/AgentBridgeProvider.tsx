/**
 * AgentBridgeProvider Component
 * 
 * Core provider component for AgentBridge in React applications.
 * Sets up the React context and initializes the bridge and adapter.
 */
import * as React from 'react';
import { AgentBridge } from '@agentbridge/core';
import { AgentBridgeContextProvider, createStableContextValue } from './context';
import { ReactAdapter } from './ReactAdapter';
import { AgentBridgeProviderProps, ComponentData } from './types';
import { debug, error as logError, info, setDebugConfig, warn } from '../utils/debug';
import { AgentBridgeError, ErrorCode } from '../utils/errors';

// Cache for singleton instances
const DEFAULT_INSTANCES = {
  bridge: null as AgentBridge | null,
  adapter: null as ReactAdapter | null
};

// State type for the provider
interface AgentBridgeProviderState {
  initialized: boolean;
  error: Error | null;
  componentRegistry: Map<string, ComponentData>;
}

/**
 * Provider component for AgentBridge
 * 
 * This component sets up the AgentBridge context and initializes the bridge and adapter.
 * It should be placed near the root of your application.
 * 
 * This uses a class component implementation to ensure compatibility
 * across different React versions and avoid hook-related issues.
 */
export class AgentBridgeProvider extends React.Component<AgentBridgeProviderProps, AgentBridgeProviderState> {
  private bridge: AgentBridge | null = null;
  private adapter: ReactAdapter | null = null;
  
  constructor(props: AgentBridgeProviderProps) {
    super(props);
    
    // Initialize state first
    this.state = {
      initialized: false,
      error: null,
      componentRegistry: new Map<string, ComponentData>()
    };
    
    const {
      bridge: customBridge,
      adapter: customAdapter,
      debug: debugConfig,
      bridgeConfig,
      adapterConfig,
      onError
    } = this.props;
    
    // Configure debugging
    if (debugConfig) {
      setDebugConfig({
        enabled: true,
        ...(typeof debugConfig === 'object' ? debugConfig : {})
      });
    }
    
    // Initialize bridge and adapter
    try {
      // Use custom instances if provided or get from cache
      this.bridge = customBridge || DEFAULT_INSTANCES.bridge || new AgentBridge(bridgeConfig);
      this.adapter = customAdapter || DEFAULT_INSTANCES.adapter || new ReactAdapter(adapterConfig);
      
      // Cache default instances for singleton use
      if (!customBridge && !DEFAULT_INSTANCES.bridge) {
        DEFAULT_INSTANCES.bridge = this.bridge;
      }
      
      if (!customAdapter && !DEFAULT_INSTANCES.adapter) {
        DEFAULT_INSTANCES.adapter = this.adapter;
      }
      
      debug('AgentBridge instances created', { 
        usedCustomBridge: !!customBridge, 
        usedCustomAdapter: !!customAdapter 
      });
    } catch (err) {
      logError('Failed to create AgentBridge instances', err);
      
      // Report error
      const adapterError = new AgentBridgeError(
        `Failed to initialize AgentBridgeProvider: ${err instanceof Error ? err.message : String(err)}`,
        ErrorCode.INITIALIZATION_FAILED,
        err instanceof Error ? err : undefined
      );
      
      // Update state with error
      this.state = {
        ...this.state,
        error: adapterError
      };
      
      onError?.(adapterError);
    }
  }
  
  componentDidMount() {
    const { 
      autoInitialize = true, 
      onError, 
      onInitialized
    } = this.props;
    
    const { error } = this.state;
    
    // Skip if not auto-initializing or already has error
    if (!autoInitialize || error || !this.bridge || !this.adapter) {
      return;
    }
    
    info('Auto-initializing AgentBridge');
    
    try {
      // Initialize adapter if needed
      if (this.adapter && typeof this.adapter.isInitialized === 'function' && !this.adapter.isInitialized()) {
        // Both this.adapter and this.bridge are checked above, but TypeScript doesn't track that
        // so we'll do an explicit null check to satisfy the type checker
        const adapter = this.adapter;
        const bridge = this.bridge;
        
        if (adapter && bridge) {
          adapter.initialize(bridge);
        }
      }
      
      // Set up registry updater
      if (this.adapter && typeof this.adapter.setContextUpdater === 'function') {
        this.adapter.setContextUpdater((registry: Map<string, ComponentData>) => {
          this.setState({ componentRegistry: new Map(registry) });
        });
      }
      
      // Mark as initialized
      this.setState({ initialized: true }, () => {
        onInitialized?.();
      });
      
      info('AgentBridge initialized successfully');
    } catch (err) {
      logError('Failed to initialize AgentBridge', err);
      
      // Report error
      const adapterError = new AgentBridgeError(
        `Failed to initialize AgentBridge: ${err instanceof Error ? err.message : String(err)}`,
        ErrorCode.INITIALIZATION_FAILED,
        err instanceof Error ? err : undefined
      );
      
      this.setState({ error: adapterError }, () => {
        onError?.(adapterError);
      });
    }
  }
  
  componentDidUpdate(_prevProps: AgentBridgeProviderProps, prevState: AgentBridgeProviderState) {
    // Log initialization error
    if (this.state.error && this.state.error !== prevState.error) {
      warn('AgentBridgeProvider initialization error:', this.state.error);
    }
  }
  
  componentWillUnmount() {
    // Clean up adapter on unmount if it's not a custom instance
    const { adapter: customAdapter } = this.props;
    
    if (this.adapter && !customAdapter && typeof this.adapter.dispose === 'function') {
      info('Cleaning up adapter on unmount');
      this.adapter.dispose();
    }
  }
  
  render() {
    const { children } = this.props;
    const { initialized, error, componentRegistry } = this.state;
    
    // Create a stable context value using the helper function
    const contextValue = createStableContextValue(
      this.bridge,
      this.adapter,
      initialized && !error,
      componentRegistry
    );
    
    // Provide the context to children
    return (
      <AgentBridgeContextProvider value={contextValue}>
        {children}
      </AgentBridgeContextProvider>
    );
  }
} 