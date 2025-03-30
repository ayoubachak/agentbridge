/**
 * @agentbridge/angular
 * Angular SDK for AgentBridge framework
 */

// Main exports
export { AgentBridgeModule, AgentBridgeModuleConfig } from './lib/agent-bridge.module';
export { AgentBridgeService } from './lib/agent-bridge.service';

// Decorators
export { RegisterComponent, RegisterFunction } from './lib/decorators';

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

// Components
export { AgentButtonComponent } from './components/agent-button.component';
export { AgentInputComponent } from './components/agent-input.component';
export { AgentSelectComponent } from './components/agent-select.component';

// Directives
export { AgentContainerDirective } from './directives/agent-container.directive';

// Re-export types from core
export {
  AgentBridge,
  FunctionImplementation,
  ExecutionContext,
  FunctionCallResult,
  AgentBridgeConfig
} from '@agentbridge/core';

export * from './lib/agent-bridge.module';
export * from './lib/agent-bridge.service';
export * from './lib/decorators';
export * from './lib/directives'; 