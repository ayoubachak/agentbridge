import { Injectable, Inject, Optional, NgZone } from '@angular/core';
import { 
  AgentBridge, 
  createAgentBridge, 
  ComponentDefinition, 
  FunctionDefinition, 
  ExecutionContext,
  FunctionCallResult
} from '@agentbridge/core';
import { AgentBridgeModuleConfig } from './agent-bridge.module';
import { BehaviorSubject, Observable } from 'rxjs';
import { AngularAdapter, AgentBridgeState } from './angular-adapter';

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
    // Create the AgentBridge instance
    this.bridge = createAgentBridge();

    // Create the Angular adapter
    this.adapter = new AngularAdapter(zone);
    
    // Initialize the adapter with the bridge
    this.adapter.initialize(this.bridge);
    
    // Set up communication
    if (config?.communicationManager) {
      this.bridge.setCommunicationManager(config.communicationManager);
    } else if (config?.providerInitFn) {
      config.providerInitFn(this.bridge);
    }
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
   * Get the adapter state observable
   */
  get state$(): Observable<AgentBridgeState> {
    return this.adapter.state$;
  }
  
  /**
   * Get the current adapter state
   */
  get currentState(): AgentBridgeState {
    return this.adapter.currentState;
  }
  
  /**
   * Register a function with AgentBridge
   * @param name Function name
   * @param description Function description
   * @param parameters Parameters schema
   * @param handler Function handler
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
   * Unregister a function
   * @param name Function name
   */
  unregisterFunction(name: string): void {
    this.bridge.unregisterFunction(name);
  }
  
  /**
   * Call a function
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
   * @param definition Component definition
   * @param component Component instance or class
   * @param handlers Component handlers
   */
  registerComponent(
    definition: ComponentDefinition,
    component: any,
    handlers: any = {}
  ): void {
    this.adapter.registerComponent(component, definition, handlers);
  }
  
  /**
   * Unregister a component
   * @param componentId Component ID
   */
  unregisterComponent(componentId: string): void {
    this.adapter.unregisterComponent(componentId);
  }
  
  /**
   * Update a component
   * @param componentId Component ID
   * @param properties Properties to update
   * @param context Execution context
   */
  async updateComponent(
    componentId: string, 
    properties: any, 
    context: ExecutionContext
  ): Promise<void> {
    return this.adapter.updateComponent(componentId, properties, context);
  }
  
  /**
   * Execute a component action
   * @param componentId Component ID
   * @param action Action name
   * @param params Action parameters
   * @param context Execution context
   */
  async executeComponentAction(
    componentId: string,
    action: string,
    params: any,
    context: ExecutionContext
  ): Promise<any> {
    return this.adapter.executeComponentAction(componentId, action, params, context);
  }
  
  /**
   * Clean up when the service is destroyed
   */
  ngOnDestroy(): void {
    if (this.bridge) {
      this.bridge.dispose();
    }
    
    if (this.adapter) {
      this.adapter.dispose();
    }
  }
} 