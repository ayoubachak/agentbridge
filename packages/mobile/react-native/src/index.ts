// Main Adapter
export { ReactNativeAdapter, AgentBridgeProvider, useAgentBridge } from './ReactNativeAdapter';

// Import hooks and components from React SDK
// In a real implementation, we would create React Native specific hooks and components
// For now, we'll create a placeholder for where the implementation would go

// Re-export types from core
export {
  AgentBridge,
  FunctionDefinition,
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