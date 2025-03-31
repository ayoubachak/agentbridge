import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { AgentBridgeService } from '../agent-bridge.service';
import { ComponentDefinition, ExecutionContext } from '@agentbridge/core';

/**
 * Directive for marking components that should be registered with AgentBridge
 * This provides a template-based approach to registration
 */
@Directive({
  selector: '[agentBridgeComponent]'
})
export class AgentBridgeComponentDirective implements OnInit, OnDestroy {
  @Input() agentBridgeComponent!: string;
  @Input() agentBridgeComponentDescription?: string;
  @Input() agentBridgeComponentProps?: Record<string, any>;

  private registered = false;
  private componentId = '';

  constructor(
    private el: ElementRef,
    private agentBridgeService: AgentBridgeService
  ) {}

  ngOnInit() {
    if (!this.agentBridgeComponent) {
      console.warn('AgentBridgeComponent directive used without a component name');
      return;
    }

    this.componentId = `directive-${this.agentBridgeComponent}-${Date.now()}`;
    
    // Create component definition
    const componentDefinition: ComponentDefinition = {
      id: this.componentId,
      description: this.agentBridgeComponentDescription || `${this.agentBridgeComponent} component`,
      componentType: this.agentBridgeComponent,
      authLevel: 'public'
    };
    
    // Register the component
    this.agentBridgeService.registerComponent(
      componentDefinition,
      this.el.nativeElement,
      this.agentBridgeComponentProps || {}
    );

    this.registered = true;
  }

  ngOnDestroy() {
    if (this.registered && this.componentId) {
      this.agentBridgeService.unregisterComponent(this.componentId);
    }
  }
} 