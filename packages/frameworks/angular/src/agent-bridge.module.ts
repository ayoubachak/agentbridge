import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentBridge, CommunicationManager } from '@agentbridge/core';
import { AngularAdapter } from './angular-adapter';
import { AgentBridgeService } from './agent-bridge.service';
import { AgentButtonComponent } from './components/agent-button.component';
import { AgentInputComponent } from './components/agent-input.component';
import { AgentSelectComponent } from './components/agent-select.component';
import { AgentContainerDirective } from './directives/agent-container.directive';

/**
 * Configuration options for the AgentBridge Angular module
 */
export interface AgentBridgeModuleConfig {
  /** Communication manager instance */
  communicationManager?: CommunicationManager;
  
  /** Provider initialization function */
  providerInitFn?: (bridge: AgentBridge) => void;
  
  /** Enable debug mode */
  debug?: boolean;
}

/**
 * Angular module for AgentBridge integration
 */
@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    AgentButtonComponent,
    AgentInputComponent,
    AgentSelectComponent,
    AgentContainerDirective
  ],
  exports: [
    AgentButtonComponent,
    AgentInputComponent,
    AgentSelectComponent,
    AgentContainerDirective
  ],
  providers: [
    AgentBridgeService
  ]
})
export class AgentBridgeModule {
  /**
   * Initialize the AgentBridge module with configuration options
   * @param config Configuration options
   * @returns Module with configured providers
   */
  static forRoot(config: AgentBridgeModuleConfig = {}): ModuleWithProviders<AgentBridgeModule> {
    return {
      ngModule: AgentBridgeModule,
      providers: [
        { provide: 'AGENT_BRIDGE_CONFIG', useValue: config },
        AgentBridgeService
      ]
    };
  }
} 