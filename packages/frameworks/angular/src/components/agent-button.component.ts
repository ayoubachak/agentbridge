import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { AgentBridgeService } from '../agent-bridge.service';

/**
 * Button component that can be controlled by AI agents
 */
@Component({
  selector: 'agent-button',
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      [attr.data-agent-id]="agentId"
      [attr.data-agent-type]="agentType"
      (click)="handleClick($event)"
      [ngClass]="cssClass"
      [ngStyle]="style">
      <ng-content></ng-content>
    </button>
  `,
  styles: []
})
export class AgentButtonComponent implements OnInit, OnDestroy {
  /** Unique ID for the button used by AI agents */
  @Input() agentId!: string;
  
  /** Component type identifier (default: 'button') */
  @Input() agentType: string = 'button';
  
  /** Button type (default: 'button') */
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  
  /** Whether the button is disabled */
  @Input() disabled: boolean = false;
  
  /** CSS class to apply to the button */
  @Input() cssClass: string = '';
  
  /** Inline styles to apply to the button */
  @Input() style: Record<string, any> = {};
  
  /** Additional properties to expose to the AI agent */
  @Input() agentProps: Record<string, any> = {};
  
  /** Event emitted when the button is clicked */
  @Output() clicked = new EventEmitter<MouseEvent>();
  
  constructor(
    private agentBridgeService: AgentBridgeService,
    private elementRef: ElementRef
  ) {}
  
  /**
   * Register the button with AgentBridge on init
   */
  ngOnInit(): void {
    if (!this.agentId) {
      console.error('Agent button requires an agentId');
      return;
    }
    
    // Register the button with AgentBridge
    this.agentBridgeService.registerComponent(this.agentId, this.agentType, {
      ...this.agentProps,
      type: this.type,
      disabled: this.disabled,
      elementRef: this.elementRef,
      className: this.cssClass
    });
  }
  
  /**
   * Unregister the button with AgentBridge on destroy
   */
  ngOnDestroy(): void {
    if (this.agentId) {
      this.agentBridgeService.unregisterComponent(this.agentId);
    }
  }
  
  /**
   * Handle button click events
   * @param event Click event
   */
  handleClick(event: MouseEvent): void {
    // Update state to reflect the click
    this.agentBridgeService.updateComponentState(this.agentId, {
      lastClicked: new Date().toISOString()
    });
    
    // Emit the clicked event
    this.clicked.emit(event);
  }
} 