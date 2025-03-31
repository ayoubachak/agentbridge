// Export the main AgentBridge class
export { AgentBridge, CommunicationManager } from './agent-bridge';

// Export registry implementations
export { InMemoryFunctionRegistry } from './registry';
export { InMemoryComponentRegistry } from './component-registry';

// Export adapter
export { Adapter, CommunicationAdapter, AgentBridge as AgentBridgeInterface } from './adapter';

// Export types
export {
  AgentBridgeConfig,
  ExecutionContext,
  FunctionDefinition,
  FunctionImplementation,
  FunctionRegistry,
  ComponentDefinition,
  ComponentImplementation,
  ComponentRegistry,
  CallResult,
  CommunicationMode,
  MessageType,
  Message,
  CapabilitiesMessage,
  FunctionCallMessage,
  ComponentUpdateMessage,
  ComponentActionMessage,
  ResultMessage,
  ErrorMessage,
  SessionMessage,
  QueryCapabilitiesMessage,
  FunctionCallResult,
  MessageQueue,
  FrameworkAdapter,
  Command,
  CommandType,
  Response,
  ResponseStatus,
  CommunicationProvider
} from './types';

// Utility function to create a simple AgentBridge instance
import { AgentBridge } from './agent-bridge';
import { AgentBridgeConfig } from './types';

/**
 * Create a new AgentBridge instance with the given configuration
 * @param config Configuration options
 * @returns A new AgentBridge instance
 */
export function createAgentBridge(config: AgentBridgeConfig = {}): AgentBridge {
  return new AgentBridge(config);
} 