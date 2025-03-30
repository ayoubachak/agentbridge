import { Directive, Input, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { AgentBridgeService } from '../agent-bridge.service';

/**
 * Directive to make any element a container that can be controlled by AI agents
 */
@Directive({
  selector: '[agentContainer]'
})
export class AgentContainerDirective implements OnInit, OnDestroy {
  /** Unique ID for the container used by AI agents */
  @Input('agentContainer') agentId!: string;
  
  /** Component type identifier (default: 'container') */
  @Input() agentType: string = 'container';
  
  /** Additional properties to expose to the AI agent */
  @Input() agentProps: Record<string, any> = {};
  
  constructor(
    private agentBridgeService: AgentBridgeService,
    private elementRef: ElementRef
  ) {}
  
  /**
   * Register the container with AgentBridge on init
   */
  ngOnInit(): void {
    if (!this.agentId) {
      console.error('Agent container requires an agentId');
      return;
    }
    
    // Calculate the number of child elements
    const element = this.elementRef.nativeElement;
    const childCount = element.children ? element.children.length : 0;
    
    // Register the container with AgentBridge
    this.agentBridgeService.registerComponent(this.agentId, this.agentType, {
      ...this.agentProps,
      elementRef: this.elementRef,
      tagName: element.tagName,
      childCount
    });
    
    // Add data attributes to the element
    element.setAttribute('data-agent-id', this.agentId);
    element.setAttribute('data-agent-type', this.agentType);
  }
  
  /**
   * Unregister the container with AgentBridge on destroy
   */
  ngOnDestroy(): void {
    if (this.agentId) {
      this.agentBridgeService.unregisterComponent(this.agentId);
    }
  }
} 