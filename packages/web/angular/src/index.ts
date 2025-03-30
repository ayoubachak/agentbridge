// Main exports
export { AgentBridgeModule, AgentBridgeModuleConfig } from './agent-bridge.module';
export { AgentBridgeService } from './agent-bridge.service';
export { AngularAdapter, ComponentInfo, AgentBridgeState } from './angular-adapter';

// Components
export { AgentButtonComponent } from './components/agent-button.component';
export { AgentInputComponent } from './components/agent-input.component';
export { AgentSelectComponent } from './components/agent-select.component';

// Directives
export { AgentContainerDirective } from './directives/agent-container.directive';

// Re-export types from core
export {
  AgentBridge,
  FunctionDefinition,
  FunctionImplementation,
  ExecutionContext,
  FunctionCallResult,
  AgentBridgeConfig,
  createAgentBridge
} from '@agentbridge/core'; 