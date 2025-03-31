import { Injectable, Inject, OnDestroy } from '@angular/core';
import { AgentBridge, createAgentBridge, ComponentDefinition, FunctionDefinition, ExecutionContext } from '@agentbridge/core';
import { AgentBridgeModuleConfig } from './agent-bridge.module';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AgentBridgeService implements OnDestroy {
  private bridge: AgentBridge;
  private _isConnected = new BehaviorSubject<boolean>(false);
  private _components = new BehaviorSubject<ComponentDefinition[]>([]);
  private _functions = new BehaviorSubject<FunctionDefinition[]>([]);

  /** Observable to track connection status */
  public isConnected$: Observable<boolean> = this._isConnected.asObservable();
  
  /** Observable to track registered components */
  public components$: Observable<ComponentDefinition[]> = this._components.asObservable();
  
  /** Observable to track registered functions */
  public functions$: Observable<FunctionDefinition[]> = this._functions.asObservable();

  constructor(@Inject('AGENT_BRIDGE_CONFIG') private config: AgentBridgeModuleConfig) {
    // Create the AgentBridge instance with empty config
    this.bridge = createAgentBridge();

    // Set up event listeners
    this.bridge.on('connected', () => {
      this._isConnected.next(true);
    });

    this.bridge.on('disconnected', () => {
      this._isConnected.next(false);
    });

    this.bridge.on('componentRegistered', (component) => {
      const current = this._components.getValue();
      this._components.next([...current, component]);
    });

    this.bridge.on('functionRegistered', (func) => {
      const current = this._functions.getValue();
      this._functions.next([...current, func]);
    });

    // Initialize communication
    if (config.communicationManager) {
      // If a communication manager is provided directly, use it
      this.bridge.setCommunicationManager(config.communicationManager);
    } else if (config.providerInitFn) {
      // If a provider initialization function is provided, call it with the bridge
      config.providerInitFn(this.bridge);
    }
  }

  /**
   * Register a component with AgentBridge
   * @param component The component definition to register
   */
  registerComponent(component: ComponentDefinition): void {
    const { id, description, componentType } = component;
    
    // Extract the options
    const options: any = {};
    if (component.properties) options.properties = component.properties;
    if (component.actions) options.actions = component.actions;
    if (component.authLevel) options.authLevel = component.authLevel;
    if (component.tags) options.tags = component.tags;
    if (component.path) options.path = component.path;
    
    // Register the component
    this.bridge.registerComponent(id, description, componentType, options);
  }

  /**
   * Register a function with AgentBridge
   * @param func The function definition to register
   */
  registerFunction(func: FunctionDefinition & { 
    handler: (params: any, context: ExecutionContext) => Promise<any> 
  }): void {
    const { name, description, parameters, handler } = func;
    
    // Extract the options
    const options: any = {};
    if (func.authLevel) options.authLevel = func.authLevel;
    if (func.tags) options.tags = func.tags;
    if (func.rateLimit) options.rateLimit = func.rateLimit;
    
    // Register the function
    this.bridge.registerFunction(name, description, parameters, handler, options);
  }

  /**
   * Get the underlying AgentBridge instance
   */
  getInstance(): AgentBridge {
    return this.bridge;
  }

  /**
   * Disconnect and clean up when service is destroyed
   */
  ngOnDestroy(): void {
    if (this.bridge) {
      // Use dispose instead of disconnect as that's the API in the core package
      this.bridge.dispose();
    }
  }
} 