import { z } from 'zod';

/**
 * Represents metadata about a function that can be called by an AI agent
 */
export interface FunctionDefinition {
  /** Unique identifier for the function */
  name: string;
  /** Human-readable description of the function */
  description: string;
  /** Schema for function parameters */
  parameters: z.ZodType<any>;
  /** Optional authorization level required to call this function */
  authLevel?: 'public' | 'user' | 'admin';
  /** Optional tags for categorizing functions */
  tags?: string[];
  /** Optional rate limit for how often this function can be called */
  rateLimit?: {
    /** Maximum number of requests */
    maxRequests: number;
    /** Time window in seconds */
    windowSeconds: number;
  };
}

/**
 * Represents a function implementation that can be called by an AI agent
 */
export interface FunctionImplementation<T = any, R = any> {
  /** Function metadata */
  definition: FunctionDefinition;
  /** The actual implementation that will be executed */
  handler: (params: T, context: ExecutionContext) => Promise<R>;
}

/**
 * Represents a UI component that can be controlled by an AI agent
 */
export interface ComponentDefinition {
  /** Unique identifier for the component */
  id: string;
  /** Human-readable description of the component */
  description: string;
  /** Type of UI component */
  componentType: string;
  /** Component properties schema */
  properties?: z.ZodType<any>;
  /** Component actions schema */
  actions?: Record<string, {
    description: string;
    parameters?: z.ZodType<any>;
  }>;
  /** Optional authorization level required to control this component */
  authLevel?: 'public' | 'user' | 'admin';
  /** Optional tags for categorizing components */
  tags?: string[];
  /** Optional path in the application UI hierarchy (useful for locating components) */
  path?: string;
}

/**
 * Represents a UI component implementation that can be controlled by an AI agent
 */
export interface ComponentImplementation<P = any> {
  /** Component metadata */
  definition: ComponentDefinition;
  /** Handler for updating component properties */
  updateHandler?: (properties: P, context: ExecutionContext) => Promise<void>;
  /** Handlers for component actions */
  actionHandlers?: Record<string, (params: any, context: ExecutionContext) => Promise<any>>;
}

/**
 * Context provided during function or component execution
 */
export interface ExecutionContext {
  /** Information about the calling agent */
  agent: {
    /** Unique identifier for the agent */
    id: string;
    /** Optional name of the agent */
    name?: string;
  };
  /** Information about the user, if authenticated */
  user?: {
    /** Unique identifier for the user */
    id: string;
    /** Optional roles assigned to the user */
    roles?: string[];
  };
  /** Information about the application */
  application: {
    /** Unique identifier for the application */
    id: string;
    /** Application name */
    name: string;
    /** Application environment */
    environment: 'development' | 'production';
  };
  /** Request metadata */
  request: {
    /** Unique identifier for the request */
    id: string;
    /** Timestamp when the request was received */
    timestamp: Date;
    /** IP address of the client */
    ip?: string;
  };
}

/**
 * Result of a function or component action call
 */
export interface CallResult<T = any> {
  /** Whether the call was successful */
  success: boolean;
  /** The result data if successful */
  data?: T;
  /** Error information if unsuccessful */
  error?: {
    /** Error code */
    code: string;
    /** Error message */
    message: string;
    /** Additional error details */
    details?: any;
  };
  /** Execution metadata */
  meta: {
    /** Execution duration in milliseconds */
    durationMs: number;
    /** Timestamp when execution started */
    startedAt: Date;
    /** Timestamp when execution completed */
    completedAt: Date;
  };
}

/**
 * Registry for storing and managing functions
 */
export interface FunctionRegistry {
  /** Register a new function */
  register: (func: FunctionImplementation) => void;
  /** Unregister a function by name */
  unregister: (name: string) => void;
  /** Get a function by name */
  get: (name: string) => FunctionImplementation | undefined;
  /** List all registered functions */
  list: () => FunctionImplementation[];
  /** List functions that match certain criteria */
  query: (options: {
    tags?: string[];
    authLevel?: 'public' | 'user' | 'admin';
  }) => FunctionImplementation[];
}

/**
 * Registry for storing and managing UI components
 */
export interface ComponentRegistry {
  /** Register a new component */
  register: (component: ComponentImplementation) => void;
  /** Unregister a component by ID */
  unregister: (id: string) => void;
  /** Get a component by ID */
  get: (id: string) => ComponentImplementation | undefined;
  /** List all registered components */
  list: () => ComponentImplementation[];
  /** List components that match certain criteria */
  query: (options: {
    componentType?: string;
    tags?: string[];
    authLevel?: 'public' | 'user' | 'admin';
    path?: string;
  }) => ComponentImplementation[];
}

/**
 * Communication mode for AgentBridge
 */
export type CommunicationMode = 'self-hosted' | 'pubsub';

/**
 * Configuration options for the AgentBridge framework
 */
export interface AgentBridgeConfig {
  /** Communication configuration */
  communication?: {
    /** Communication mode */
    mode: CommunicationMode;
    /** Options for self-hosted mode */
    selfHosted?: {
      /** WebSocket endpoint */
      endpoint?: string;
      /** Custom WebSocket implementation */
      websocketImpl?: any;
    };
    /** Options for pubsub mode */
    pubsub?: {
      /** Pubsub provider */
      provider: 'ably' | 'firebase' | 'pusher' | 'supabase' | 'custom';
      /** Provider-specific options */
      options?: any;
      /** For custom providers, implementation details */
      implementation?: any;
      /** Channel/topic naming configuration */
      channels?: {
        /** Channel/topic prefix */
        prefix?: string;
        /** Channel/topic for capabilities */
        capabilities?: string;
        /** Channel/topic for commands */
        commands?: string;
        /** Channel/topic for responses */
        responses?: string;
      };
    };
  };
  /** Authentication configuration */
  auth?: {
    /** Authentication provider to use */
    provider: 'none' | 'api-key' | 'jwt' | 'oauth2';
    /** Options specific to the selected authentication provider */
    options?: any;
  };
  /** Security configuration */
  security?: {
    /** Enable detailed error messages (disable in production) */
    enableDetailedErrors?: boolean;
    /** CORS settings */
    cors?: {
      /** Allowed origins */
      origins?: string[];
      /** Whether to allow credentials */
      allowCredentials?: boolean;
    };
  };
  /** Logging configuration */
  logging?: {
    /** Log level */
    level?: 'debug' | 'info' | 'warn' | 'error';
    /** Whether to log request and response bodies */
    logBodies?: boolean;
    /** Custom logger implementation */
    logger?: any;
  };
}

/**
 * Message types for communication between AgentBridge instances
 */
export enum MessageType {
  /** Register capabilities (functions and components) */
  REGISTER_CAPABILITIES = 'register_capabilities',
  /** Update capabilities */
  UPDATE_CAPABILITIES = 'update_capabilities',
  /** Call a function */
  CALL_FUNCTION = 'call_function',
  /** Function call result */
  FUNCTION_RESULT = 'function_result',
  /** Update a component */
  UPDATE_COMPONENT = 'update_component',
  /** Component update result */
  COMPONENT_UPDATE_RESULT = 'component_update_result',
  /** Call a component action */
  CALL_COMPONENT_ACTION = 'call_component_action',
  /** Component action result */
  COMPONENT_ACTION_RESULT = 'component_action_result',
  /** Query capabilities */
  QUERY_CAPABILITIES = 'query_capabilities',
  /** Capabilities query result */
  CAPABILITIES_RESULT = 'capabilities_result',
  /** Error message */
  ERROR = 'error',
  /** Session management */
  SESSION = 'session'
}

/**
 * Base message interface for communication
 */
export interface Message {
  /** Message type */
  type: MessageType;
  /** Message ID for correlation */
  id: string;
  /** Timestamp when the message was created */
  timestamp: string;
  /** Session ID (when applicable) */
  sessionId?: string;
  /** Correlation ID for linking requests and responses */
  correlationId?: string;
  /** Error code */
  code?: string;
  /** Functions for capabilities */
  functions?: any[];
  /** Components for capabilities */
  components?: any[];
  /** Success status */
  success?: boolean;
  /** Result data */
  data?: any;
  /** Error details */
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  /** Function name */
  name?: string;
  /** Function parameters */
  parameters?: any;
  /** Component ID */
  componentId?: string;
  /** Component properties */
  properties?: any;
  /** Action name */
  action?: string;
  /** Text message content */
  message?: string;
  /** Additional error details */
  details?: any;
  /** Metadata about the operation */
  meta?: {
    /** Execution duration in milliseconds */
    durationMs: number;
    /** Timestamp when execution started */
    startedAt: Date;
    /** Timestamp when execution completed */
    completedAt: Date;
  };
}

/**
 * Capabilities message containing functions and components
 */
export interface CapabilitiesMessage extends Message {
  type: MessageType.REGISTER_CAPABILITIES | MessageType.UPDATE_CAPABILITIES | 
        MessageType.CAPABILITIES_RESULT;
  /** Function definitions */
  functions?: Array<{
    name: string;
    description: string;
    parameters: any; // Schema representation
    authLevel?: string;
    tags?: string[];
  }>;
  /** Component definitions */
  components?: Array<{
    id: string;
    description: string;
    componentType: string;
    properties?: any; // Schema representation
    actions?: Record<string, {
      description: string;
      parameters?: any; // Schema representation
    }>;
    authLevel?: string;
    tags?: string[];
    path?: string;
  }>;
}

/**
 * Function call message
 */
export interface FunctionCallMessage extends Message {
  type: MessageType.CALL_FUNCTION;
  /** Function name */
  name: string;
  /** Function parameters */
  parameters: any;
}

/**
 * Component update message
 */
export interface ComponentUpdateMessage extends Message {
  type: MessageType.UPDATE_COMPONENT;
  /** Component ID */
  id: string;
  /** Component properties to update */
  properties: any;
}

/**
 * Component action call message
 */
export interface ComponentActionMessage extends Message {
  type: MessageType.CALL_COMPONENT_ACTION;
  /** Component ID */
  id: string;
  /** Action name */
  action: string;
  /** Action parameters */
  parameters: any;
}

/**
 * Result message for function calls or component actions
 */
export interface ResultMessage extends Message {
  type: MessageType.FUNCTION_RESULT | MessageType.COMPONENT_UPDATE_RESULT | 
        MessageType.COMPONENT_ACTION_RESULT;
  /** Whether the operation was successful */
  success: boolean;
  /** Result data (if successful) */
  data?: any;
  /** Error information (if unsuccessful) */
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Error message
 */
export interface ErrorMessage extends Message {
  type: MessageType.ERROR;
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Additional error details */
  details?: any;
}

/**
 * Session message for managing connections
 */
export interface SessionMessage extends Message {
  type: MessageType.SESSION;
  /** Session action */
  action: 'connect' | 'disconnect' | 'heartbeat';
  /** Additional session data */
  data?: any;
}

/**
 * Query capabilities message
 */
export interface QueryCapabilitiesMessage extends Message {
  type: MessageType.QUERY_CAPABILITIES;
  /** Query filters */
  filters?: {
    functionTags?: string[];
    functionAuthLevel?: string;
    componentType?: string;
    componentTags?: string[];
    componentAuthLevel?: string;
    componentPath?: string;
  };
}

/**
 * Result of a function call operation
 */
export interface FunctionCallResult<T = any> extends CallResult<T> {
  /** The function that was called */
  function: string;
  /** The parameters that were passed */
  params: any;
}

/**
 * Queue for storing messages when disconnected
 */
export type MessageQueue<T = any> = Array<T>;

/**
 * Base framework adapter interface that all framework-specific adapters should implement
 */
export interface FrameworkAdapter {
  /**
   * Render a component based on its properties
   * @param component Component to render
   * @param props Component properties
   */
  renderComponent(component: any, props: any): any;
  
  // Include required Adapter methods
  initialize(bridge: any): void;
  registerComponent(component: any, definition: ComponentDefinition, handlers: any): void;
  unregisterComponent(componentId: string): void;
  updateComponent(componentId: string, properties: any, context: ExecutionContext): Promise<void>;
  executeComponentAction(componentId: string, action: string, params: any, context: ExecutionContext): Promise<any>;
  getComponentDefinitions(): ComponentDefinition[];
  dispose(): void;
}

/**
 * Command types for AI agent to UI component communication
 */
export enum CommandType {
  /** Call a function */
  CALL_FUNCTION = 'call_function',
  /** Update a component */
  UPDATE_COMPONENT = 'update_component',
  /** Call a component action */
  CALL_COMPONENT_ACTION = 'call_component_action',
  /** Query capabilities */
  QUERY_CAPABILITIES = 'query_capabilities'
}

/**
 * Command object for AI agent to UI component communication
 */
export interface Command {
  /** Command type */
  type: CommandType;
  /** Command ID for correlation */
  id: string;
  /** Command parameters */
  params: any;
  /** Target (function name or component ID) */
  target?: string;
  /** Action name (for component actions) */
  action?: string;
}

/**
 * Response status for UI component to AI agent communication
 */
export enum ResponseStatus {
  /** Success response */
  SUCCESS = 'success',
  /** Error response */
  ERROR = 'error'
}

/**
 * Response object for UI component to AI agent communication
 */
export interface Response {
  /** Response status */
  status: ResponseStatus;
  /** Response data */
  data?: any;
  /** Error information */
  error?: {
    /** Error code */
    code: string;
    /** Error message */
    message: string;
    /** Additional error details */
    details?: any;
  };
  /** Command ID that this response is for */
  commandId: string;
}

/**
 * Communication Provider interface for backend communication
 */
export interface CommunicationProvider {
  /** Connect to the communication channel */
  connect(): Promise<void>;
  /** Disconnect from the communication channel */
  disconnect(): Promise<void>;
  /** Send a message */
  send(message: any): void;
  /** Set a message handler */
  onMessage(handler: (message: any) => void): void;
  /** Get the current connection status */
  getStatus(): string;
} 