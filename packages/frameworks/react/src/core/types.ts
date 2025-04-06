/**
 * Type definitions for AgentBridge React integration
 */
import { 
  AgentBridge, 
  ComponentDefinition as CoreComponentDefinition, 
  ExecutionContext, 
  FunctionCallResult
} from '@agentbridge/core';
import type { ZodType } from 'zod';
import { ReactAdapter } from './ReactAdapter';
import { FC, ReactNode } from 'react';

// Forward declaration to avoid circular references
export type ReactAdapterType = any;

/**
 * Configuration for the React adapter
 */
export interface ReactAdapterConfiguration {
  /** Enable debug logging */
  debug?: boolean;
  /** Default component type */
  defaultComponentType?: string;
  /** Components path in the API */
  componentsPath?: string;
  /** Default auth level for components */
  defaultAuthLevel?: 'public' | 'user' | 'admin';
}

/**
 * Type for the function that updates the registry in context
 */
export type UpdateRegistryFunction = (registry: Map<string, ComponentData>) => void;

/**
 * Context type for AgentBridge React integration
 */
export interface AgentBridgeContextType {
  /** The AgentBridge instance */
  bridge: AgentBridge | null;
  /** The React adapter instance */
  adapter: any | null;
  /** Whether the bridge is initialized */
  initialized: boolean;
  /** Map of registered components */
  componentRegistry: Map<string, ComponentData>;
}

/**
 * Component data type for registry entries
 */
export interface ComponentData {
  /** The component ID */
  id: string;
  /** The component type */
  type?: string;
  /** The component props */
  props?: Record<string, any>;
  /** The component state */
  state?: Record<string, any>;
  /** Function to update component state */
  setState?: (update: any) => void;
  /** Last updated timestamp */
  lastUpdated?: Date;
  /** React component (if available) */
  Component?: FC<any>;
  /** Component definition */
  definition?: CoreComponentDefinition;
}

/**
 * Props for the AgentBridgeProvider component
 */
export interface AgentBridgeProviderProps {
  /** React children */
  children: ReactNode;
  /** Optional AgentBridge instance */
  bridge?: AgentBridge;
  /** Optional ReactAdapter instance */
  adapter?: ReactAdapter;
  /** Whether to enable debugging */
  debug?: boolean | { level?: 'debug' | 'info' | 'warn' | 'error' };
  /** Whether to auto-initialize */
  autoInitialize?: boolean;
  /** Error handler */
  onError?: (error: Error) => void;
  /** Initialization complete callback */
  onInitialized?: () => void;
  /** Adapter configuration */
  adapterConfig?: any;
  /** Bridge configuration */
  bridgeConfig?: any;
}

/**
 * Result of the useAgentComponent hook
 */
export interface UseAgentComponentResult<S = any> {
  /** The component ID */
  id: string;
  /** The component state */
  state: S;
  /** Function to update the component state */
  updateState: (newState: Partial<S>) => any;
}

/**
 * Options for creating an agent component
 */
export interface AgentComponentOptions<P = any, S = Record<string, any>> {
  /** Component ID (optional, will be generated if not provided) */
  componentId?: string;
  /** Component type */
  componentType?: string;
  /** Component description */
  description?: string;
  /** Component properties */
  properties?: Record<string, any>;
  /** Component actions */
  actions?: Record<string, AgentComponentAction<P, S>>;
  /** Component path */
  path?: string;
  /** Component tags */
  tags?: string[];
  /** Authorization level */
  authLevel?: string;
  /** Initial state */
  initialState?: S;
  /** State change handler */
  onStateChange?: (
    updates: Partial<S>,
    state: S,
    context?: any
  ) => Promise<void> | void;
  /** Global action handler */
  onAction?: (
    actionName: string,
    params: any,
    context?: any
  ) => Promise<any> | any;
}

/**
 * Action definition for agent components
 */
export interface AgentComponentAction<P = any, S = any> {
  /** Action description */
  description: string;
  /** Action parameters schema */
  parameters: Record<string, any>;
  /** Action handler */
  handler?: (
    params: any,
    state: S,
    context?: any
  ) => Promise<any> | any;
}

/**
 * Configuration for registering agent functions
 */
export interface AgentFunctionConfig {
  /** Function name */
  name: string;
  /** Function description */
  description: string;
  /** Function parameter schema */
  schema?: Record<string, any>;
}

/**
 * Result of the useAgentFunction hook
 */
export interface UseFunctionResult {
  /** Function to register the function */
  registerFunction: () => boolean;
  /** Function to unregister the function */
  unregisterFunction: () => boolean;
} 