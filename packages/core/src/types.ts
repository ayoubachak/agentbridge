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
 * Context provided during function execution
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
 * Result of a function call
 */
export interface FunctionCallResult<T = any> {
  /** Whether the function call was successful */
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
    /** Function execution duration in milliseconds */
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
 * Configuration options for the AgentBridge framework
 */
export interface AgentBridgeConfig {
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