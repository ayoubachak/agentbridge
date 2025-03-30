// Main class
export { AgentBridge } from './agent-bridge';

// Types
export {
  FunctionDefinition,
  FunctionImplementation,
  ExecutionContext,
  FunctionCallResult,
  FunctionRegistry,
  AgentBridgeConfig
} from './types';

// Registry
export { InMemoryFunctionRegistry } from './registry';

// Adapter
export { FrameworkAdapter } from './adapter';

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