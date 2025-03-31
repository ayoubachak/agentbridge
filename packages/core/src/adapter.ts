import { EventEmitter } from 'events';
import { ComponentDefinition, ExecutionContext, MessageQueue } from './types';

// Forward reference for AgentBridge (to avoid circular dependency)
export interface AgentBridge {
  registerComponent(component: any, definition: ComponentDefinition, handlers: any): void;
  unregisterComponent(componentId: string): void;
  
  // Add properties and methods that are accessed in agent-bridge.ts
  components?: any[];
  adapter?: any;
  removeAllListeners?(): void;
  callFunction(name: string, params: any, context?: any): Promise<any>;
  on(event: string, listener: (...args: any[]) => void): any;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

/**
 * Adapter interface for different UI frameworks
 * 
 * This enables AgentBridge to work with different UI frameworks (React, Angular, Vue, etc.)
 * by providing a standardized way to register and interact with UI components.
 */
export interface Adapter {
  /**
   * Initialize the adapter with an AgentBridge instance
   * @param bridge AgentBridge instance
   */
  initialize(bridge: AgentBridge): void;
  
  /**
   * Register a framework-specific UI component that can be controlled by AI agents
   * 
   * This method is called by framework-specific code to register a component with AgentBridge.
   * The implementation should translate framework-specific concepts to AgentBridge's component model.
   * 
   * @param component The framework-specific component object or reference
   * @param definition Component definition including ID, description, and type
   * @param handlers Object containing handlers for component updates and actions
   */
  registerComponent(
    component: any,
    definition: ComponentDefinition,
    handlers: {
      updateHandler?: (properties: any, context: ExecutionContext) => Promise<void>;
      actionHandlers?: Record<string, (params: any, context: ExecutionContext) => Promise<any>>;
    }
  ): void;
  
  /**
   * Unregister a UI component
   * @param componentId Component identifier
   */
  unregisterComponent(componentId: string): void;
  
  /**
   * Update a UI component based on properties received from an AI agent
   * 
   * This method is called by AgentBridge when an AI agent wants to update a component.
   * The implementation should translate AgentBridge's property model to framework-specific updates.
   * 
   * @param componentId Component identifier
   * @param properties New properties to apply to the component
   * @param context Execution context
   */
  updateComponent(
    componentId: string, 
    properties: any, 
    context: ExecutionContext
  ): Promise<void>;
  
  /**
   * Execute a component action triggered by an AI agent
   * 
   * This method is called by AgentBridge when an AI agent wants to trigger a component action.
   * The implementation should translate AgentBridge's action model to framework-specific actions.
   * 
   * @param componentId Component identifier
   * @param action Action name
   * @param params Action parameters
   * @param context Execution context
   */
  executeComponentAction(
    componentId: string,
    action: string,
    params: any,
    context: ExecutionContext
  ): Promise<any>;
  
  /**
   * Get component definitions for all registered components
   * 
   * This method is called by AgentBridge to gather information about all registered components
   * for sharing with AI agents.
   * 
   * @returns Array of component definitions
   */
  getComponentDefinitions(): ComponentDefinition[];
  
  /**
   * Disconnect from the framework and clean up resources
   */
  disconnect(): Promise<void>;
  
  /**
   * Called when the adapter should clean up resources
   */
  dispose(): void;
}

export abstract class CommunicationAdapter<MessageType = unknown> extends EventEmitter {
  protected connectionStatus: ConnectionStatus = 'disconnected';
  protected readonly messageQueue: MessageQueue<MessageType> = [];
  
  /**
   * Send a message to the agent
   * @param message Message to send to the agent
   */
  public abstract sendMessage(message: MessageType): void;

  /**
   * Connect to the agent
   */
  public abstract connect(): Promise<void>;

  /**
   * Disconnect from the agent
   */
  public abstract disconnect(): Promise<void>;

  /**
   * Get the current connection status
   */
  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }
  
  /**
   * Handle incoming message from the adapter
   * @param message Message received from the agent
   */
  protected handleIncomingMessage(message: any): void {
    this.emit('message', message);
  }
} 