import { Injectable, Inject, Optional, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { AgentBridge, createAgentBridge, FunctionCallResult } from '@agentbridge/core';
import { AngularAdapter, AgentBridgeState } from './angular-adapter';
import { AgentBridgeModuleConfig } from './agent-bridge.module';

/**
 * Service for interacting with AgentBridge in Angular applications
 */
@Injectable({
  providedIn: 'root'
})
export class AgentBridgeService {
  private bridge: AgentBridge;
  private adapter: AngularAdapter;
  
  /**
   * Constructor for AgentBridgeService
   * @param config Configuration options
   * @param zone Angular NgZone for running code inside Angular's change detection
   */
  constructor(
    @Optional() @Inject('AGENT_BRIDGE_CONFIG') private config: AgentBridgeModuleConfig,
    private zone: NgZone
  ) {
    // Initialize with provided configuration or create new instances
    this.bridge = config?.bridge || createAgentBridge();
    this.adapter = config?.adapter || new AngularAdapter(zone);
    
    // Initialize the adapter with the bridge
    this.adapter.initialize(this.bridge);
  }
  
  /**
   * Get the AgentBridge instance
   */
  get agentBridge(): AgentBridge {
    return this.bridge;
  }
  
  /**
   * Get the adapter instance
   */
  get adapterInstance(): AngularAdapter {
    return this.adapter;
  }
  
  /**
   * Observable state that components can subscribe to
   */
  get state$(): Observable<AgentBridgeState> {
    return this.adapter.state$;
  }
  
  /**
   * Get the current state
   */
  get currentState(): AgentBridgeState {
    return this.adapter.currentState;
  }
  
  /**
   * Register a function with AgentBridge
   * @param name Function name
   * @param description Function description
   * @param parameters Schema for function parameters
   * @param handler Function implementation
   * @param options Additional options
   */
  registerFunction<T = any, R = any>(
    name: string,
    description: string,
    parameters: any,
    handler: (params: T, context: any) => Promise<R>,
    options: {
      authLevel?: 'public' | 'user' | 'admin';
      tags?: string[];
      rateLimit?: {
        maxRequests: number;
        windowSeconds: number;
      };
    } = {}
  ): void {
    this.bridge.registerFunction(name, description, parameters, handler, options);
  }
  
  /**
   * Unregister a function by name
   * @param name Function name
   */
  unregisterFunction(name: string): void {
    this.bridge.unregisterFunction(name);
  }
  
  /**
   * Call a function registered with AgentBridge
   * @param functionName Function name
   * @param params Function parameters
   * @param context Context information
   * @returns Result of the function call
   */
  async callFunction<T = any, R = any>(
    functionName: string,
    params: T,
    context: Record<string, any> = {}
  ): Promise<FunctionCallResult<R>> {
    return this.adapter.handleFunctionCall(functionName, params, context);
  }
  
  /**
   * Register a component with AgentBridge
   * @param componentId Component ID
   * @param componentType Component type
   * @param props Component properties
   */
  registerComponent(componentId: string, componentType: string, props: Record<string, any> = {}): void {
    this.adapter.registerComponent(componentId, componentType, props);
  }
  
  /**
   * Unregister a component
   * @param componentId Component ID
   */
  unregisterComponent(componentId: string): void {
    this.adapter.unregisterComponent(componentId);
  }
  
  /**
   * Update a component's state
   * @param componentId Component ID
   * @param state New state
   */
  updateComponentState(componentId: string, state: Record<string, any>): void {
    this.adapter.updateComponentState(componentId, state);
  }
} 