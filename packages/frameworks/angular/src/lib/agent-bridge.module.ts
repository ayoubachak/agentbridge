import { NgModule, ModuleWithProviders, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentBridgeService } from './agent-bridge.service';
import { CommunicationManager, AgentBridge } from '@agentbridge/core';

export interface AgentBridgeModuleConfig {
  /** The communication manager instance */
  communicationManager?: CommunicationManager;
  /** Provider initialization function (alternative to communicationManager) */
  providerInitFn?: (bridge: AgentBridge) => CommunicationManager;
  /** Debug mode flag */
  debug?: boolean;
}

/**
 * Angular module for AgentBridge integration
 */
@NgModule({
  imports: [CommonModule],
  providers: [AgentBridgeService],
  declarations: [],
  exports: []
})
export class AgentBridgeModule {
  /**
   * Use this method in your root module to configure AgentBridge
   * @param config The configuration for AgentBridge
   * @returns The configured module with providers
   */
  static forRoot(config: AgentBridgeModuleConfig): ModuleWithProviders<AgentBridgeModule> {
    return {
      ngModule: AgentBridgeModule,
      providers: [
        { provide: 'AGENT_BRIDGE_CONFIG', useValue: config },
        AgentBridgeService
      ]
    };
  }

  constructor(@Optional() @SkipSelf() parentModule?: AgentBridgeModule) {
    if (parentModule) {
      throw new Error(
        'AgentBridgeModule is already loaded. Import it in the AppModule only'
      );
    }
  }
} 