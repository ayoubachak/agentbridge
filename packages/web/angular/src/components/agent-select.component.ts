import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AgentBridgeService } from '../agent-bridge.service';

/**
 * Select component that can be controlled by AI agents
 */
@Component({
  selector: 'agent-select',
  template: `
    <select
      [disabled]="disabled"
      [value]="value"
      (change)="handleChange($event)"
      [attr.data-agent-id]="agentId"
      [attr.data-agent-type]="agentType"
      [ngClass]="cssClass"
      [ngStyle]="style">
      <ng-content></ng-content>
    </select>
  `,
  styles: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AgentSelectComponent),
      multi: true
    }
  ]
})
export class AgentSelectComponent implements OnInit, OnDestroy, ControlValueAccessor {
  /** Unique ID for the select used by AI agents */
  @Input() agentId!: string;
  
  /** Component type identifier (default: 'select') */
  @Input() agentType: string = 'select';
  
  /** Whether the select is disabled */
  @Input() disabled: boolean = false;
  
  /** CSS class to apply to the select */
  @Input() cssClass: string = '';
  
  /** Inline styles to apply to the select */
  @Input() style: Record<string, any> = {};
  
  /** Additional properties to expose to the AI agent */
  @Input() agentProps: Record<string, any> = {};
  
  /** Event emitted when the select value changes */
  @Output() valueChange = new EventEmitter<string>();
  
  /** Current select value */
  value: string = '';
  
  /** Options available in the select */
  options: Array<{value: string, text: string}> = [];
  
  /** Change callback function */
  private onChange: (value: string) => void = () => {};
  
  /** Touch callback function */
  private onTouched: () => void = () => {};
  
  constructor(
    private agentBridgeService: AgentBridgeService,
    private elementRef: ElementRef
  ) {}
  
  /**
   * Register the select with AgentBridge on init
   */
  ngOnInit(): void {
    if (!this.agentId) {
      console.error('Agent select requires an agentId');
      return;
    }
    
    // Extract options from the DOM
    this.extractOptions();
    
    // Register the select with AgentBridge
    this.agentBridgeService.registerComponent(this.agentId, this.agentType, {
      ...this.agentProps,
      disabled: this.disabled,
      options: this.options,
      elementRef: this.elementRef,
      className: this.cssClass
    });
  }
  
  /**
   * Extract options from the select element
   */
  private extractOptions(): void {
    if (this.elementRef.nativeElement) {
      const selectElement = this.elementRef.nativeElement.querySelector('select');
      if (selectElement) {
        const options = Array.from(selectElement.options);
        this.options = options.map(option => ({
          value: option.value,
          text: option.text
        }));
        
        // Update the component state with options
        if (this.agentId) {
          this.agentBridgeService.updateComponentState(this.agentId, {
            options: this.options
          });
        }
      }
    }
  }
  
  /**
   * Unregister the select with AgentBridge on destroy
   */
  ngOnDestroy(): void {
    if (this.agentId) {
      this.agentBridgeService.unregisterComponent(this.agentId);
    }
  }
  
  /**
   * Handle select change events
   * @param event Change event
   */
  handleChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    
    // Update internal value
    this.value = value;
    
    // Update state to reflect the new value
    this.agentBridgeService.updateComponentState(this.agentId, {
      value,
      lastChanged: new Date().toISOString()
    });
    
    // Call change callbacks
    this.onChange(value);
    this.valueChange.emit(value);
    this.onTouched();
  }
  
  /**
   * Write a value to the select
   * @param value Value to write
   */
  writeValue(value: string): void {
    this.value = value || '';
    
    // Update state to reflect the new value
    if (this.agentId) {
      this.agentBridgeService.updateComponentState(this.agentId, {
        value: this.value
      });
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
   * @param isDisabled Whether the select is disabled
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    
    // Update state to reflect disabled status
    if (this.agentId) {
      this.agentBridgeService.updateComponentState(this.agentId, {
        disabled: isDisabled
      });
    }
  }
} 