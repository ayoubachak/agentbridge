import { Injectable, OnDestroy, signal } from '@angular/core';
import { AgentBridge, WebSocketAdapter } from '@agentbridge/core';
import { z } from 'zod';

/**
 * AgentBridge Service for Angular
 * Manages WebSocket connection and component/function registration
 */
@Injectable({
  providedIn: 'root'
})
export class AgentBridgeService implements OnDestroy {
  private bridge: AgentBridge;
  private wsAdapter: WebSocketAdapter;
  
  // Signals for reactive state
  public connectionStatus = signal<'connecting' | 'connected' | 'disconnected'>('connecting');
  public componentCount = signal(0);
  public functionCount = signal(0);
  
  constructor() {
    // Create WebSocket adapter
    this.wsAdapter = new WebSocketAdapter({
      url: 'ws://localhost:8080',
      autoReconnect: true,
      debug: true
    });
    
    // Create AgentBridge instance
    this.bridge = new AgentBridge({
      logging: {
        level: 'debug'
      }
    });
    
    // Set the communication manager
    this.bridge.setCommunicationManager(this.wsAdapter);
    
    // Connect to server
    this.connect();
  }
  
  /**
   * Connect to the WebSocket server
   */
  private async connect(): Promise<void> {
    try {
      await this.wsAdapter.connect();
      console.log('✅ Connected to AgentBridge server');
      this.connectionStatus.set('connected');
    } catch (error) {
      console.error('❌ Failed to connect to AgentBridge server:', error);
      this.connectionStatus.set('disconnected');
    }
  }
  
  /**
   * Get the AgentBridge instance
   */
  getBridge(): AgentBridge {
    return this.bridge;
  }
  
  /**
   * Register a component with AgentBridge
   */
  registerComponent<P = any>(
    id: string,
    description: string,
    componentType: string,
    options: {
      properties?: z.ZodType<P>;
      actions?: Record<string, {
        description: string;
        parameters?: z.ZodType<any>;
        handler: (params: any) => Promise<any>;
      }>;
      authLevel?: 'public' | 'user' | 'admin';
      tags?: string[];
      path?: string;
    } = {}
  ): void {
    this.bridge.registerComponent(id, description, componentType, options);
    this.componentCount.update(count => count + 1);
    console.log(`📋 Registered component: ${id}`);
  }
  
  /**
   * Unregister a component
   */
  unregisterComponent(id: string): void {
    this.bridge.unregisterComponent(id);
    this.componentCount.update(count => Math.max(0, count - 1));
    console.log(`🗑️ Unregistered component: ${id}`);
  }
  
  /**
   * Register a function with AgentBridge
   */
  registerFunction<T = any, R = any>(
    name: string,
    description: string,
    parameters: z.ZodType<T>,
    handler: (params: T) => Promise<R>,
    options: {
      authLevel?: 'public' | 'user' | 'admin';
      tags?: string[];
    } = {}
  ): void {
    this.bridge.registerFunction(name, description, parameters, async (params) => {
      return await handler(params);
    }, options);
    this.functionCount.update(count => count + 1);
    console.log(`⚡ Registered function: ${name}`);
  }
  
  ngOnDestroy(): void {
    // Clean up on service destruction
    this.wsAdapter.disconnect();
  }
}

