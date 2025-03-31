import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { AgentBridgeService } from '../agent-bridge.service';
import { ComponentDefinition, ExecutionContext } from '@agentbridge/core';

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
    
    // Create component definition
    const componentDefinition: ComponentDefinition = {
      id: this.agentId,
      description: 'Button component that can be controlled by AI agents',
      componentType: this.agentType,
      actions: {
        click: {
          description: 'Click the button'
        }
      },
      authLevel: 'public'
    };
    
    // Register the button with AgentBridge
    this.agentBridgeService.registerComponent(
      componentDefinition,
      this.elementRef.nativeElement
    );
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
    const context: Partial<ExecutionContext> = {
      request: {
        id: `click-${Date.now()}`,
        timestamp: new Date()
      }
    };
    
    this.agentBridgeService.updateComponent(
      this.agentId, 
      {
        lastClicked: new Date().toISOString()
      },
      context as ExecutionContext
    );
    
    // Emit the clicked event
    this.clicked.emit(event);
  }
} 