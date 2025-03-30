import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { AgentBridgeService } from './agent-bridge.service';

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
    
    // Register the component
    this.agentBridgeService.registerComponent({
      id: this.componentId,
      name: this.agentBridgeComponent,
      description: this.agentBridgeComponentDescription || '',
      props: this.agentBridgeComponentProps || {},
      component: this.el.nativeElement
    });

    this.registered = true;
  }

  ngOnDestroy() {
    // Implement if there's a way to unregister components
  }
} 