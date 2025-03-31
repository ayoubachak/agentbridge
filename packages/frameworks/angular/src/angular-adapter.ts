import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  AgentBridge,
  FrameworkAdapter,
  FunctionCallResult,
  ComponentDefinition,
  ExecutionContext,
  CallResult
} from '@agentbridge/core';

/**
 * Interface for component registry entries
 */
export interface ComponentInfo {
  type: string;
  props: Record<string, any>;
  state: Record<string, any>;
  definition: ComponentDefinition;
  handlers: any;
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
      async (_params, _context) => {
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
      async (params, _context) => {
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
      async (params, _context) => {
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
   * Render a component (implements FrameworkAdapter interface)
   * @param component Component to render
   * @param props Component properties
   */
  renderComponent(component: any, props: any): any {
    // This would be implemented for the Angular framework
    // For now, just return a basic representation
    return { 
      _type: 'angular-component', 
      component,
      props 
    };
  }

  /**
   * Register a UI component that can be controlled by the AI agent
   * @param component Component instance
   * @param definition Component definition
   * @param handlers Component handlers
   */
  registerComponent(component: any, definition: ComponentDefinition, handlers: any): void {
    const componentId = definition.id;
    
    if (this.components.has(componentId)) {
      console.warn(`Component with ID '${componentId}' is already registered. It will be overwritten.`);
    }
    
    this.components.set(componentId, {
      type: definition.componentType,
      props: {},
      state: {},
      definition,
      handlers
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
    const component = this.components.get(componentId);
    
    if (!component) {
      console.warn(`Cannot update component: Component with ID '${componentId}' not found`);
      return;
    }
    
    // Call updateHandler if provided
    if (component.handlers && component.handlers.updateHandler) {
      await component.handlers.updateHandler(properties, context);
    }
    
    // Update component props
    this.components.set(componentId, {
      ...component,
      props: { ...component.props, ...properties }
    });
    
    // Notify subscribers of the change
    this.updateState({ componentRegistry: new Map(this.components) });
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
    const component = this.components.get(componentId);
    
    if (!component) {
      return {
        success: false,
        error: {
          code: 'COMPONENT_NOT_FOUND',
          message: `Component with ID '${componentId}' not found`
        },
        meta: {
          durationMs: 0,
          startedAt: new Date(),
          completedAt: new Date()
        }
      };
    }
    
    if (!component.handlers || !component.handlers.actionHandlers || !component.handlers.actionHandlers[action]) {
      return {
        success: false,
        error: {
          code: 'ACTION_NOT_FOUND',
          message: `Action '${action}' not found for component '${componentId}'`
        },
        meta: {
          durationMs: 0,
          startedAt: new Date(),
          completedAt: new Date()
        }
      };
    }
    
    // Call the action handler
    try {
      const startTime = new Date();
      const result = await component.handlers.actionHandlers[action](params, context);
      const endTime = new Date();
      
      return {
        success: true,
        data: result,
        meta: {
          durationMs: endTime.getTime() - startTime.getTime(),
          startedAt: startTime,
          completedAt: endTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ACTION_EXECUTION_ERROR',
          message: error instanceof Error ? error.message : String(error)
        },
        meta: {
          durationMs: 0,
          startedAt: new Date(),
          completedAt: new Date()
        }
      };
    }
  }
  
  /**
   * Get component definitions
   */
  getComponentDefinitions(): ComponentDefinition[] {
    return Array.from(this.components.values()).map(component => component.definition);
  }
  
  /**
   * Update a UI component's state (helper function)
   * @param componentId Component identifier
   * @param state New state object
   */
  private updateComponentState(componentId: string, state: Record<string, any>): void {
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
  ): Promise<FunctionCallResult<any>> {
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
        },
        function: functionName,
        params
      };
    }
    
    try {
      // Convert context to required format 
      const agentContext = {
        agent: {
          id: context.agentId || 'anonymous',
          name: context.agentName
        },
        application: {
          id: context.appId || 'angular-app',
          name: context.appName || 'Angular Application',
          environment: (context.environment || 'development') as 'development' | 'production'
        },
        user: context.user,
        ip: context.ip
      };
      
      // Call the function through AgentBridge
      const result = await this.bridge.callFunction(functionName, params, agentContext);
      
      // Convert to FunctionCallResult
      return {
        ...result,
        function: functionName,
        params
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FUNCTION_EXECUTION_ERROR',
          message: error instanceof Error ? error.message : String(error)
        },
        meta: {
          durationMs: 0,
          startedAt: new Date(),
          completedAt: new Date()
        },
        function: functionName,
        params
      };
    }
  }
  
  /**
   * Get components registry
   */
  getComponents(): Map<string, ComponentInfo> {
    return this.components;
  }
  
  /**
   * Dispose the adapter
   */
  dispose(): void {
    // Clean up resources if needed
    this.components.clear();
    this.bridge = null;
    
    this.updateState({
      isInitialized: false,
      componentRegistry: this.components
    });
  }
} 