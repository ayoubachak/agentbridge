import { AgentBridge } from './agent-bridge';
import { FunctionCallResult } from './types';

/**
 * Adapter interface for different frameworks
 * This will allow AgentBridge to work with different UI frameworks
 */
export interface FrameworkAdapter {
  /**
   * Initialize the adapter with an AgentBridge instance
   * @param bridge AgentBridge instance
   */
  initialize(bridge: AgentBridge): void;
  
  /**
   * Register a UI component that can be controlled by the AI agent
   * @param componentId Unique identifier for the component
   * @param componentType Type of the component (e.g., 'button', 'input', 'list')
   * @param props Additional properties for the component
   */
  registerComponent(componentId: string, componentType: string, props?: Record<string, any>): void;
  
  /**
   * Unregister a UI component
   * @param componentId Component identifier
   */
  unregisterComponent(componentId: string): void;
  
  /**
   * Update a UI component's state
   * @param componentId Component identifier
   * @param state New state object
   */
  updateComponentState(componentId: string, state: Record<string, any>): void;
  
  /**
   * Handle a function call made by an AI agent
   * @param functionName Name of the function to call
   * @param params Parameters for the function
   * @param context Context information
   * @returns Result of the function call
   */
  handleFunctionCall(
    functionName: string, 
    params: any, 
    context: Record<string, any>
  ): Promise<FunctionCallResult>;
  
  /**
   * Get the list of registered components
   * @returns Map of component IDs to component information
   */
  getComponents(): Map<string, {
    type: string;
    props: Record<string, any>;
    state: Record<string, any>;
  }>;
  
  /**
   * Convert the adapter to a different framework
   * @param targetFramework Name of the target framework
   * @returns A new adapter for the target framework
   */
  convertTo(targetFramework: string): FrameworkAdapter | null;
} 