/**  
 * AgentBridge React  
 *  
 * React integration for the AgentBridge framework.  
 */ 

// Core exports
export { ReactAdapter } from './core/ReactAdapter';
export { AgentBridgeProvider } from './core/AgentBridgeProvider';
export {
  useAgentBridgeContext,
  useAgentBridgeOrThrow,
  useReactAdapterOrThrow,
  useAgentBridgeInitialized
} from './core/context';

// Hooks
export {
  useAgentComponent,
  withAgentComponent
} from './hooks/useAgentComponent';

export {
  useAgentFunction
} from './hooks/useAgentFunction';

// Components
export * from './components';
export { AgentButton } from './components/AgentButton';
export type { AgentButtonProps } from './components/AgentButton';

// Types
export * from './core/types';

// Utilities
export * from './utils/debug';
export * from './utils/errors';
export * from './utils/schema';
export * from './utils/stableObjects';

// Re-export types from core
export {
  AgentBridge,
  FunctionDefinition,
  FunctionImplementation,
  ExecutionContext,
  FunctionCallResult,
  AgentBridgeConfig,
  ComponentDefinition
} from '@agentbridge/core';

// Version information
export const VERSION = '0.1.0'; 
