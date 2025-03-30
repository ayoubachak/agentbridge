import { Injectable, Inject, OnDestroy } from '@angular/core';
import { AgentBridge, createAgentBridge, ComponentDefinition, FunctionDefinition } from '@agentbridge/core';
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
    this.bridge = createAgentBridge({
      communicationProvider: config.communicationProvider,
      debug: config.debug || false
    });

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

    // Initialize connection
    this.bridge.connect();
  }

  /**
   * Register a component with AgentBridge
   * @param component The component definition to register
   */
  registerComponent(component: ComponentDefinition): void {
    this.bridge.registerComponent(component);
  }

  /**
   * Register a function with AgentBridge
   * @param func The function definition to register
   */
  registerFunction(func: FunctionDefinition): void {
    this.bridge.registerFunction(func);
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
    this.bridge.disconnect();
  }
} 