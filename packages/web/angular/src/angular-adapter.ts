import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  AgentBridge,
  FrameworkAdapter,
  FunctionCallResult
} from '@agentbridge/core';

/**
 * Interface for component registry entries
 */
export interface ComponentInfo {
  type: string;
  props: Record<string, any>;
  state: Record<string, any>;
}

/**
 * Interface for AgentBridge state in Angular
 */
export interface AgentBridgeState {
  isInitialized: boolean;
  componentRegistry: Map<string, ComponentInfo>;
}

/**
 * Angular implementation of the FrameworkAdapter interface.
 * This service manages integration between AgentBridge and Angular applications.
 */
@Injectable({
  providedIn: 'root'
})
export class AngularAdapter implements FrameworkAdapter {
  private bridge: AgentBridge | null = null;
  private components: Map<string, ComponentInfo> = new Map();
  
  // Observable state for component changes
  private stateSubject = new BehaviorSubject<AgentBridgeState>({
    isInitialized: false,
    componentRegistry: this.components
  });
  
  /**
   * Observable state that components can subscribe to
   */
  public state$: Observable<AgentBridgeState> = this.stateSubject.asObservable();
  
  constructor(private zone: NgZone) {}
  
  /**
   * Get the current state
   */
  get currentState(): AgentBridgeState {
    return this.stateSubject.getValue();
  }
  
  /**
   * Get the AgentBridge instance
   */
  get agentBridge(): AgentBridge | null {
    return this.bridge;
  }
  
  /**
   * Initialize the adapter with an AgentBridge instance
   * @param bridge AgentBridge instance
   */
  initialize(bridge: AgentBridge): void {
    this.bridge = bridge;
    
    // Register built-in functions
    this.registerBuiltInFunctions();
    
    // Update state
    this.updateState({
      isInitialized: true,
      componentRegistry: this.components
    });
  }
  
  /**
   * Update the state and notify subscribers
   * @param newState The new state
   */
  private updateState(newState: Partial<AgentBridgeState>): void {
    this.zone.run(() => {
      const currentState = this.stateSubject.getValue();
      this.stateSubject.next({
        ...currentState,
        ...newState
      });
    });
  }
  
  /**
   * Register built-in functions for Angular components
   */
  private registerBuiltInFunctions(): void {
    if (!this.bridge) return;
    
    // Function to get all registered components
    this.bridge.registerFunction(
      'getComponents',
      'Get all registered components',
      // Using any instead of Zod schema for simplicity
      { type: 'object', properties: {} } as any,
      async (_, context) => {
        return Array.from(this.components.entries()).map(([id, info]) => ({
          id,
          type: info.type,
          props: info.props,
          state: info.state
        }));
      },
      { authLevel: 'public', tags: ['ui', 'component'] }
    );
    
    // Function to update a component's state
    this.bridge.registerFunction(
      'updateComponentState',
      'Update the state of a UI component',
      // Using any instead of Zod schema for simplicity
      {
        type: 'object',
        properties: {
          componentId: { type: 'string' },
          state: { type: 'object' }
        },
        required: ['componentId', 'state']
      } as any,
      async (params, context) => {
        const { componentId, state } = params;
        this.updateComponentState(componentId, state);
        return { success: true };
      },
      { authLevel: 'public', tags: ['ui', 'component'] }
    );
    
    // Function to trigger events on components
    this.bridge.registerFunction(
      'triggerComponentEvent',
      'Trigger an event on a UI component',
      // Using any instead of Zod schema for simplicity
      {
        type: 'object',
        properties: {
          componentId: { type: 'string' },
          event: { type: 'string' },
          payload: { type: 'object' }
        },
        required: ['componentId', 'event']
      } as any,
      async (params, context) => {
        const { componentId, event, payload } = params;
        const component = this.components.get(componentId);
        
        if (!component) {
          return {
            success: false,
            error: `Component with ID '${componentId}' not found`
          };
        }
        
        // In a real implementation, we would use Angular's event system
        // For now, just update the component state
        const updatedState = {
          ...component.state,
          lastEvent: { type: event, payload, timestamp: new Date() }
        };
        
        this.updateComponentState(componentId, updatedState);
        
        return { success: true, componentId, event };
      },
      { authLevel: 'public', tags: ['ui', 'component', 'event'] }
    );
  }
  
  /**
   * Register a UI component that can be controlled by the AI agent
   * @param componentId Unique identifier for the component
   * @param componentType Type of the component (e.g., 'button', 'input', 'list')
   * @param props Additional properties for the component
   */
  registerComponent(componentId: string, componentType: string, props: Record<string, any> = {}): void {
    if (this.components.has(componentId)) {
      console.warn(`Component with ID '${componentId}' is already registered. It will be overwritten.`);
    }
    
    this.components.set(componentId, {
      type: componentType,
      props,
      state: {}
    });
    
    // Update state to notify subscribers
    this.updateState({ componentRegistry: this.components });
  }
  
  /**
   * Unregister a UI component
   * @param componentId Component identifier
   */
  unregisterComponent(componentId: string): void {
    this.components.delete(componentId);
    
    // Update state to notify subscribers
    this.updateState({ componentRegistry: this.components });
  }
  
  /**
   * Update a UI component's state
   * @param componentId Component identifier
   * @param state New state object
   */
  updateComponentState(componentId: string, state: Record<string, any>): void {
    const component = this.components.get(componentId);
    
    if (!component) {
      console.warn(`Cannot update state: Component with ID '${componentId}' not found`);
      return;
    }
    
    // Update component state
    this.components.set(componentId, {
      ...component,
      state: { ...component.state, ...state }
    });
    
    // Notify subscribers of the change
    this.updateState({ componentRegistry: new Map(this.components) });
  }
  
  /**
   * Handle a function call made by an AI agent
   * @param functionName Name of the function to call
   * @param params Parameters for the function
   * @param context Context information
   * @returns Result of the function call
   */
  async handleFunctionCall(
    functionName: string,
    params: any,
    context: Record<string, any>
  ): Promise<FunctionCallResult> {
    if (!this.bridge) {
      return {
        success: false,
        error: {
          code: 'NOT_INITIALIZED',
          message: 'AgentBridge is not initialized'
        },
        meta: {
          durationMs: 0,
          startedAt: new Date(),
          completedAt: new Date()
        }
      };
    }
    
    return this.bridge.callFunction(functionName, params, {
      agent: {
        id: context.agentId || 'unknown',
        name: context.agentName
      },
      user: context.user,
      application: {
        id: context.appId || 'angular-app',
        name: context.appName || 'Angular Application',
        environment: context.environment || 'development'
      },
      ip: context.ip
    });
  }
  
  /**
   * Get the list of registered components
   * @returns Map of component IDs to component information
   */
  getComponents(): Map<string, ComponentInfo> {
    return this.components;
  }
  
  /**
   * Convert the adapter to a different framework
   * @param targetFramework Name of the target framework
   * @returns A new adapter for the target framework or null if not supported
   */
  convertTo(targetFramework: string): FrameworkAdapter | null {
    // Implementation would convert this adapter to another framework
    // This is a placeholder for future implementation
    console.warn(`Conversion to ${targetFramework} is not implemented yet`);
    return null;
  }
} 