/**
 * Standardized error handling for AgentBridge React
 */

import { error as logError } from './debug';

/**
 * Error codes for AgentBridge React
 */
export enum ErrorCode {
  // Initialization errors
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  BRIDGE_NOT_INITIALIZED = 'BRIDGE_NOT_INITIALIZED',
  ADAPTER_NOT_INITIALIZED = 'ADAPTER_NOT_INITIALIZED',
  
  // Component errors
  COMPONENT_REGISTRATION_FAILED = 'COMPONENT_REGISTRATION_FAILED',
  COMPONENT_NOT_FOUND = 'COMPONENT_NOT_FOUND',
  COMPONENT_UPDATE_FAILED = 'COMPONENT_UPDATE_FAILED',
  COMPONENT_ACTION_FAILED = 'COMPONENT_ACTION_FAILED',
  COMPONENT_ALREADY_REGISTERED = 'COMPONENT_ALREADY_REGISTERED',
  
  // Function errors
  FUNCTION_REGISTRATION_FAILED = 'FUNCTION_REGISTRATION_FAILED', 
  FUNCTION_CALL_FAILED = 'FUNCTION_CALL_FAILED',
  FUNCTION_NOT_FOUND = 'FUNCTION_NOT_FOUND',
  FUNCTION_ALREADY_REGISTERED = 'FUNCTION_ALREADY_REGISTERED',
  
  // Communication errors
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  MESSAGE_SEND_FAILED = 'MESSAGE_SEND_FAILED',
  RESPONSE_TIMEOUT = 'RESPONSE_TIMEOUT',
  
  // Context errors
  CONTEXT_NOT_FOUND = 'CONTEXT_NOT_FOUND',
  PROVIDER_MISSING = 'PROVIDER_MISSING',
  
  // Schema errors
  SCHEMA_VALIDATION_FAILED = 'SCHEMA_VALIDATION_FAILED',
  INVALID_SCHEMA = 'INVALID_SCHEMA',
  
  // Other errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
  OPERATION_CANCELED = 'OPERATION_CANCELED',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  TIMEOUT = 'TIMEOUT'
}

/**
 * Base error class for AgentBridge React
 */
export class AgentBridgeError extends Error {
  /** Error code for categorization */
  code: ErrorCode;
  /** Original error that caused this error */
  cause?: Error;
  /** Additional context for the error */
  context?: Record<string, any>;
  
  constructor(
    message: string, 
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    cause?: Error,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AgentBridgeError';
    this.code = code;
    this.cause = cause;
    this.context = context;
    
    // Properly set the prototype for instanceof to work
    Object.setPrototypeOf(this, AgentBridgeError.prototype);
    
    // Log error by default
    logError(this.toString());
  }
  
  /**
   * Convert the error to a string with all context
   */
  toString(): string {
    let result = `[${this.name}] ${this.code}: ${this.message}`;
    
    if (this.cause) {
      result += `\nCaused by: ${this.cause.toString()}`;
    }
    
    if (this.context && Object.keys(this.context).length > 0) {
      result += `\nContext: ${JSON.stringify(this.context, null, 2)}`;
    }
    
    return result;
  }
  
  /**
   * Convert the error to a simple object for serialization
   */
  toObject(): Record<string, any> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      cause: this.cause ? this.cause.toString() : undefined,
      context: this.context
    };
  }
}

/**
 * Error for component-related issues
 */
export class ComponentError extends AgentBridgeError {
  /** ID of the component that had an error */
  componentId: string;
  
  constructor(
    message: string,
    componentId: string,
    code: ErrorCode = ErrorCode.COMPONENT_NOT_FOUND,
    cause?: Error,
    context?: Record<string, any>
  ) {
    super(message, code, cause, { ...context, componentId });
    this.name = 'ComponentError';
    this.componentId = componentId;
    
    // Properly set the prototype
    Object.setPrototypeOf(this, ComponentError.prototype);
  }
}

/**
 * Error for function-related issues
 */
export class FunctionError extends AgentBridgeError {
  /** Name of the function that had an error */
  functionName: string;
  
  constructor(
    message: string,
    functionName: string,
    code: ErrorCode = ErrorCode.FUNCTION_NOT_FOUND,
    cause?: Error,
    context?: Record<string, any>
  ) {
    super(message, code, cause, { ...context, functionName });
    this.name = 'FunctionError';
    this.functionName = functionName;
    
    // Properly set the prototype
    Object.setPrototypeOf(this, FunctionError.prototype);
  }
}

/**
 * Error for context-related issues
 */
export class ContextError extends AgentBridgeError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.CONTEXT_NOT_FOUND,
    cause?: Error,
    context?: Record<string, any>
  ) {
    super(message, code, cause, context);
    this.name = 'ContextError';
    
    // Properly set the prototype
    Object.setPrototypeOf(this, ContextError.prototype);
  }
}

/**
 * Error for initialization-related issues
 */
export class InitializationError extends AgentBridgeError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.INITIALIZATION_FAILED,
    cause?: Error,
    context?: Record<string, any>
  ) {
    super(message, code, cause, context);
    this.name = 'InitializationError';
    
    // Properly set the prototype
    Object.setPrototypeOf(this, InitializationError.prototype);
  }
}

/**
 * Error for schema validation issues
 */
export class SchemaError extends AgentBridgeError {
  /** The schema that failed validation */
  schema?: any;
  /** The data that failed validation */
  data?: any;
  
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.SCHEMA_VALIDATION_FAILED,
    schema?: any,
    data?: any,
    cause?: Error,
    context?: Record<string, any>
  ) {
    super(message, code, cause, { ...context, schema, data });
    this.name = 'SchemaError';
    this.schema = schema;
    this.data = data;
    
    // Properly set the prototype
    Object.setPrototypeOf(this, SchemaError.prototype);
  }
}

/**
 * Wrap a function to catch and transform any errors to AgentBridgeErrors
 */
export function withErrorHandling<T, A extends any[]>(
  fn: (...args: A) => T,
  errorTransformer: (error: unknown) => AgentBridgeError = defaultErrorTransformer
): (...args: A) => T {
  return (...args: A) => {
    try {
      return fn(...args);
    } catch (err) {
      throw errorTransformer(err);
    }
  };
}

/**
 * Wrap an async function to catch and transform any errors to AgentBridgeErrors
 */
export function withAsyncErrorHandling<T, A extends any[]>(
  fn: (...args: A) => Promise<T>,
  errorTransformer: (error: unknown) => AgentBridgeError = defaultErrorTransformer
): (...args: A) => Promise<T> {
  return async (...args: A) => {
    try {
      return await fn(...args);
    } catch (err) {
      throw errorTransformer(err);
    }
  };
}

/**
 * Default error transformer that converts any error to an AgentBridgeError
 */
export function defaultErrorTransformer(error: unknown): AgentBridgeError {
  if (error instanceof AgentBridgeError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AgentBridgeError(
      error.message,
      ErrorCode.UNKNOWN_ERROR,
      error
    );
  }
  
  return new AgentBridgeError(
    String(error),
    ErrorCode.UNKNOWN_ERROR
  );
}

/**
 * Utility function to create an error for a missing component
 */
export function createComponentNotFoundError(componentId: string): ComponentError {
  return new ComponentError(
    `Component with ID '${componentId}' not found`,
    componentId,
    ErrorCode.COMPONENT_NOT_FOUND
  );
}

/**
 * Utility function to create an error for a missing function
 */
export function createFunctionNotFoundError(functionName: string): FunctionError {
  return new FunctionError(
    `Function '${functionName}' not found`,
    functionName,
    ErrorCode.FUNCTION_NOT_FOUND
  );
}

/**
 * Utility function to create an error for context not found
 * @param contextName Optional name of the context item not found
 */
export function createContextNotFoundError(contextName?: string): ContextError {
  const message = contextName 
    ? `${contextName} not found in AgentBridge context. Make sure you are using hooks within an AgentBridgeProvider`
    : 'AgentBridge context not found. Make sure you are using hooks within an AgentBridgeProvider';
    
  return new ContextError(
    message,
    ErrorCode.CONTEXT_NOT_FOUND
  );
}

/**
 * Utility function to create an error for a non-initialized bridge
 */
export function createBridgeNotInitializedError(): InitializationError {
  return new InitializationError(
    'AgentBridge is not initialized',
    ErrorCode.BRIDGE_NOT_INITIALIZED
  );
}

/**
 * Utility function to create an error for schema validation failure
 */
export function createSchemaValidationError(
  message: string,
  schema?: any,
  data?: any
): SchemaError {
  return new SchemaError(
    message,
    ErrorCode.SCHEMA_VALIDATION_FAILED,
    schema,
    data
  );
} 