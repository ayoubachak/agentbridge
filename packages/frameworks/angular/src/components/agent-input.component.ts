import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AgentBridgeService } from '../agent-bridge.service';
import { ComponentDefinition, ExecutionContext } from '@agentbridge/core';

/**
 * Input component that can be controlled by AI agents
 */
@Component({
  selector: 'agent-input',
  template: `
    <input
      [type]="type"
      [disabled]="disabled"
      [value]="value"
      [placeholder]="placeholder"
      (input)="handleInput($event)"
      [attr.data-agent-id]="agentId"
      [attr.data-agent-type]="agentType"
      [ngClass]="cssClass"
      [ngStyle]="style">
  `,
  styles: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AgentInputComponent),
      multi: true
    }
  ]
})
export class AgentInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  /** Unique ID for the input used by AI agents */
  @Input() agentId!: string;
  
  /** Component type identifier (default: 'input') */
  @Input() agentType: string = 'input';
  
  /** Input type (default: 'text') */
  @Input() type: string = 'text';
  
  /** Whether the input is disabled */
  @Input() disabled: boolean = false;
  
  /** Placeholder text */
  @Input() placeholder: string = '';
  
  /** CSS class to apply to the input */
  @Input() cssClass: string = '';
  
  /** Inline styles to apply to the input */
  @Input() style: Record<string, any> = {};
  
  /** Additional properties to expose to the AI agent */
  @Input() agentProps: Record<string, any> = {};
  
  /** Event emitted when the input value changes */
  @Output() valueChange = new EventEmitter<string>();
  
  /** Current input value */
  value: string = '';
  
  /** Change callback function */
  private onChange: (value: string) => void = () => {};
  
  /** Touch callback function */
  private onTouched: () => void = () => {};
  
  constructor(
    private agentBridgeService: AgentBridgeService,
    private elementRef: ElementRef
  ) {}
  
  /**
   * Register the input with AgentBridge on init
   */
  ngOnInit(): void {
    if (!this.agentId) {
      console.error('Agent input requires an agentId');
      return;
    }
    
    // Create component definition
    const componentDefinition: ComponentDefinition = {
      id: this.agentId,
      description: 'Input component that can be controlled by AI agents',
      componentType: this.agentType,
      actions: {
        input: {
          description: 'Input value changes'
        },
        change: {
          description: 'Value is committed'
        },
        focus: {
          description: 'Input receives focus'
        },
        blur: {
          description: 'Input loses focus'
        }
      },
      authLevel: 'public'
    };
    
    // Register the input with AgentBridge
    this.agentBridgeService.registerComponent(
      componentDefinition,
      this.elementRef.nativeElement
    );
  }
  
  /**
   * Unregister the input with AgentBridge on destroy
   */
  ngOnDestroy(): void {
    if (this.agentId) {
      this.agentBridgeService.unregisterComponent(this.agentId);
    }
  }
  
  /**
   * Handle input events
   * @param event Input event
   */
  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    
    // Update internal value
    this.value = value;
    
    // Update state to reflect the new value
    const context: Partial<ExecutionContext> = {
      request: {
        id: `input-${Date.now()}`,
        timestamp: new Date()
      }
    };
    
    this.agentBridgeService.updateComponent(
      this.agentId, 
      {
        value,
        lastChanged: new Date().toISOString()
      },
      context as ExecutionContext
    );
    
    // Call change callbacks
    this.onChange(value);
    this.valueChange.emit(value);
  }
  
  /**
   * Write a value to the input
   * @param value Value to write
   */
  writeValue(value: string): void {
    this.value = value || '';
    
    // Update state to reflect the new value
    if (this.agentId) {
      const context: Partial<ExecutionContext> = {
        request: {
          id: `write-${Date.now()}`,
          timestamp: new Date()
        }
      };
      
      this.agentBridgeService.updateComponent(
        this.agentId, 
        { value: this.value },
        context as ExecutionContext
      );
    }
  }
  
  /**
   * Register a callback function for changes
   * @param fn Callback function
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  
  /**
   * Register a callback function for touches
   * @param fn Callback function
   */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  
  /**
   * Set the disabled state
   * @param isDisabled Whether the input is disabled
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    
    // Update state to reflect disabled status
    if (this.agentId) {
      const context: Partial<ExecutionContext> = {
        request: {
          id: `disable-${Date.now()}`,
          timestamp: new Date()
        }
      };
      
      this.agentBridgeService.updateComponent(
        this.agentId, 
        { disabled: isDisabled },
        context as ExecutionContext
      );
    }
  }
} 