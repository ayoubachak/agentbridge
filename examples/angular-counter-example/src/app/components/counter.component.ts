import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentBridgeService } from '../services/agent-bridge.service';
import { z } from 'zod';

/**
 * Counter Component
 * A counter that can be controlled by AI agents via AgentBridge
 */
@Component({
  selector: 'app-counter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="counter-container">
      <div class="counter-card">
        <h2>AgentBridge Counter</h2>
        <p class="subtitle">Controlled by AI Agents</p>
        
        <div class="counter-display">
          <div class="count-value">{{ count() }}</div>
          <div class="count-label">Current Count</div>
        </div>
        
        <div class="button-group">
          <button 
            class="btn btn-decrement" 
            (click)="decrement()"
            [disabled]="!isConnected()">
            <span class="btn-icon">−</span>
            Decrement
          </button>
          
          <button 
            class="btn btn-reset" 
            (click)="reset()"
            [disabled]="!isConnected()">
            <span class="btn-icon">↻</span>
            Reset
          </button>
          
          <button 
            class="btn btn-increment" 
            (click)="increment()"
            [disabled]="!isConnected()">
            <span class="btn-icon">+</span>
            Increment
          </button>
        </div>
        
        <div class="info-section">
          <div class="info-item">
            <span class="info-label">Component ID:</span>
            <code>main-counter</code>
          </div>
          <div class="info-item">
            <span class="info-label">Actions:</span>
            <code>increment, decrement, reset, setTo</code>
          </div>
          <div class="info-item">
            <span class="info-label">State:</span>
            <code>{{ stateJson() }}</code>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './counter.component.css'
})
export class CounterComponent implements OnInit, OnDestroy {
  // Signals for reactive state
  count = signal(0);
  isConnected = computed(() => this.agentBridge.connectionStatus() === 'connected');
  stateJson = computed(() => JSON.stringify({ count: this.count() }));
  
  constructor(private agentBridge: AgentBridgeService) {}
  
  ngOnInit(): void {
    // Register this counter component with AgentBridge
    this.registerWithAgentBridge();
  }
  
  ngOnDestroy(): void {
    // Unregister when component is destroyed
    this.agentBridge.unregisterComponent('main-counter');
  }
  
  /**
   * Register this component with AgentBridge
   */
  private registerWithAgentBridge(): void {
    this.agentBridge.registerComponent(
      'main-counter',
      'A counter that can be incremented, decremented, or reset',
      'counter',
      {
        properties: z.object({
          count: z.number().describe('Current count value')
        }),
        actions: {
          increment: {
            description: 'Increment the counter by 1',
            parameters: z.object({}),
            handler: async () => {
              this.increment();
              return { success: true, count: this.count() };
            }
          },
          decrement: {
            description: 'Decrement the counter by 1',
            parameters: z.object({}),
            handler: async () => {
              this.decrement();
              return { success: true, count: this.count() };
            }
          },
          reset: {
            description: 'Reset the counter to zero',
            parameters: z.object({}),
            handler: async () => {
              this.reset();
              return { success: true, count: this.count() };
            }
          },
          setTo: {
            description: 'Set the counter to a specific value',
            parameters: z.object({
              value: z.number().describe('The value to set')
            }),
            handler: async (params: { value: number }) => {
              this.setTo(params.value);
              return { success: true, count: this.count() };
            }
          }
        },
        authLevel: 'public',
        tags: ['counter', 'ui', 'interactive']
      }
    );
  }
  
  /**
   * Increment the counter
   */
  increment(): void {
    this.count.update(c => c + 1);
    console.log(`➕ Counter incremented to ${this.count()}`);
  }
  
  /**
   * Decrement the counter
   */
  decrement(): void {
    this.count.update(c => c - 1);
    console.log(`➖ Counter decremented to ${this.count()}`);
  }
  
  /**
   * Reset the counter to zero
   */
  reset(): void {
    this.count.set(0);
    console.log(`↻ Counter reset to 0`);
  }
  
  /**
   * Set the counter to a specific value
   */
  setTo(value: number): void {
    this.count.set(value);
    console.log(`🎯 Counter set to ${value}`);
  }
}

