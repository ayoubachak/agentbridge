/**
 * @agentbridge/react-native
 * React Native SDK for AgentBridge framework
 */

// Main exports
export { AgentBridgeProvider, useAgentBridge } from './lib/AgentBridgeProvider';

// Component registration
export { withAgentBridge } from './lib/withAgentBridge';

// Hooks
export { useRegisterComponent, useRegisterFunction } from './lib/hooks';

// Re-export from core for convenience
export {
  Command,
  CommandType,
  Response,
  ResponseStatus,
  ComponentDefinition,
  FunctionDefinition,
  CommunicationProvider,
  createAgentBridge
} from '@agentbridge/core';

// Main Adapter
export { ReactNativeAdapter } from './ReactNativeAdapter';

// Import hooks and components from React SDK
// In a real implementation, we would create React Native specific hooks and components
// For now, we'll create a placeholder for where the implementation would go

// Re-export types from core
export {
  FunctionImplementation,
  ExecutionContext,
  FunctionCallResult,
  AgentBridgeConfig
} from '@agentbridge/core';

// Mobile-specific exports go here

/**
 * Note: This is a placeholder for the React Native SDK implementation.
 * In a complete implementation, we would need to:
 * 
 * 1. Create React Native specific components (AgentButton, AgentTextInput, etc.)
 * 2. Implement React Native specific hooks
 * 3. Add additional mobile-specific functionality (camera access, geolocation, etc.)
 * 4. Optimize for mobile performance and data usage
 * 5. Handle mobile-specific security concerns
 */ 