import React from 'react';
import { AgentBridgeContext } from '@agentbridge/react';

/**
 * Custom AgentBridgeProvider Component
 * 
 * This is a simplified version of the AgentBridgeProvider that uses
 * a class component instead of hooks to avoid the React version conflicts.
 */
class CustomAgentBridgeProvider extends React.Component {
  constructor(props) {
    super(props);
    
    // Extract bridge and adapter from props
    const { bridge, adapter } = props;
    
    // Verify that bridge and adapter are provided
    if (!bridge) {
      console.error('AgentBridge instance is required');
      throw new Error('AgentBridge instance is required');
    }
    
    // Initialize adapter if it's available and not initialized
    if (adapter && typeof adapter.isInitialized === 'function' && !adapter.isInitialized()) {
      try {
        adapter.initialize(bridge);
        console.log('[CustomAgentBridgeProvider] Adapter initialized successfully');
      } catch (err) {
        console.error('[CustomAgentBridgeProvider] Failed to initialize adapter:', err);
      }
    }
    
    // Set up initial registry 
    this.state = {
      componentRegistry: new Map()
    };
    
    // Make sure adapter can update the registry
    if (adapter && typeof adapter.setContextUpdater === 'function') {
      adapter.setContextUpdater((registry) => {
        this.setState({ componentRegistry: new Map(registry) });
      });
    }
  }
  
  componentDidMount() {
    // Enable debug mode if requested
    if (this.props.debug) {
      console.log('[CustomAgentBridgeProvider] Debug mode enabled');
    }
  }
  
  componentWillUnmount() {
    // Clean up adapter if needed
    const { adapter, customAdapter } = this.props;
    if (adapter && !customAdapter && typeof adapter.dispose === 'function') {
      adapter.dispose();
    }
  }
  
  render() {
    const { bridge, adapter, children } = this.props;
    const { componentRegistry } = this.state;
    
    // Create context value manually
    const contextValue = {
      bridge,
      adapter,
      initialized: true, // We've already initialized in constructor
      componentRegistry
    };
    
    // Provide context
    return (
      <AgentBridgeContext.Provider value={contextValue}>
        {children}
      </AgentBridgeContext.Provider>
    );
  }
}

export default CustomAgentBridgeProvider; 