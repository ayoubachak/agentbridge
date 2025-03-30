import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { 
  AgentBridgeConfig, 
  ExecutionContext, 
  FunctionCallResult, 
  FunctionImplementation 
} from './types';
import { InMemoryFunctionRegistry } from './registry';

/**
 * Main AgentBridge class that manages function registration and execution
 */
export class AgentBridge {
  private registry: InMemoryFunctionRegistry;
  private config: AgentBridgeConfig;
  
  /**
   * Create a new AgentBridge instance
   * @param config Configuration options
   */
  constructor(config: AgentBridgeConfig = {}) {
    this.registry = new InMemoryFunctionRegistry();
    this.config = config;
  }

  /**
   * Register a new function
   * @param definition Function metadata
   * @param handler Function implementation
   */
  registerFunction<T = any, R = any>(
    name: string,
    description: string,
    parameters: z.ZodType<T>,
    handler: (params: T, context: ExecutionContext) => Promise<R>,
    options: {
      authLevel?: 'public' | 'user' | 'admin';
      tags?: string[];
      rateLimit?: {
        maxRequests: number;
        windowSeconds: number;
      };
    } = {}
  ): void {
    const func: FunctionImplementation<T, R> = {
      definition: {
        name,
        description,
        parameters,
        ...options
      },
      handler
    };
    
    this.registry.register(func);
  }

  /**
   * Unregister a function by name
   * @param name The name of the function to unregister
   */
  unregisterFunction(name: string): void {
    this.registry.unregister(name);
  }

  /**
   * Call a function by name
   * @param name Function name
   * @param params Function parameters
   * @param contextParams Additional context parameters
   * @returns Function call result
   */
  async callFunction<T = any, R = any>(
    name: string,
    params: any,
    contextParams: {
      agent: {
        id: string;
        name?: string;
      };
      user?: {
        id: string;
        roles?: string[];
      };
      application: {
        id: string;
        name: string;
        environment: 'development' | 'production';
      };
      ip?: string;
    }
  ): Promise<FunctionCallResult<R>> {
    const startTime = new Date();
    const requestId = uuidv4();
    
    try {
      // Get function implementation
      const func = this.registry.get(name) as FunctionImplementation<T, R> | undefined;
      
      if (!func) {
        return {
          success: false,
          error: {
            code: 'FUNCTION_NOT_FOUND',
            message: `Function '${name}' not found`
          },
          meta: {
            durationMs: new Date().getTime() - startTime.getTime(),
            startedAt: startTime,
            completedAt: new Date()
          }
        };
      }
      
      // Validate parameters against schema
      try {
        params = func.definition.parameters.parse(params);
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'INVALID_PARAMETERS',
            message: 'Invalid parameters',
            details: error
          },
          meta: {
            durationMs: new Date().getTime() - startTime.getTime(),
            startedAt: startTime,
            completedAt: new Date()
          }
        };
      }
      
      // Check authorization
      if (func.definition.authLevel === 'user' || func.definition.authLevel === 'admin') {
        if (!contextParams.user) {
          return {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required'
            },
            meta: {
              durationMs: new Date().getTime() - startTime.getTime(),
              startedAt: startTime,
              completedAt: new Date()
            }
          };
        }
        
        if (func.definition.authLevel === 'admin' && 
            (!contextParams.user.roles || !contextParams.user.roles.includes('admin'))) {
          return {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Admin privileges required'
            },
            meta: {
              durationMs: new Date().getTime() - startTime.getTime(),
              startedAt: startTime,
              completedAt: new Date()
            }
          };
        }
      }
      
      // Build execution context
      const context: ExecutionContext = {
        agent: contextParams.agent,
        user: contextParams.user,
        application: contextParams.application,
        request: {
          id: requestId,
          timestamp: startTime,
          ip: contextParams.ip
        }
      };
      
      // Execute function
      const result = await func.handler(params, context);
      
      // Return successful result
      return {
        success: true,
        data: result,
        meta: {
          durationMs: new Date().getTime() - startTime.getTime(),
          startedAt: startTime,
          completedAt: new Date()
        }
      };
    } catch (error) {
      // Log error
      if (this.config.logging?.level === 'debug' || this.config.logging?.level === 'info') {
        console.error('Error executing function:', error);
      }
      
      // Return error result
      return {
        success: false,
        error: {
          code: 'EXECUTION_ERROR',
          message: 'Error executing function',
          details: this.config.security?.enableDetailedErrors ? error : undefined
        },
        meta: {
          durationMs: new Date().getTime() - startTime.getTime(),
          startedAt: startTime,
          completedAt: new Date()
        }
      };
    }
  }
  
  /**
   * Get all registered functions
   * @returns Array of all registered function implementations
   */
  listFunctions(): FunctionImplementation[] {
    return this.registry.list();
  }
  
  /**
   * Query functions that match certain criteria
   * @param options Query options
   * @returns Array of function implementations that match the criteria
   */
  queryFunctions(options: { tags?: string[]; authLevel?: 'public' | 'user' | 'admin' }): FunctionImplementation[] {
    return this.registry.query(options);
  }
  
  /**
   * Get OpenAPI-like function definitions
   * @returns Object containing function definitions in a format similar to OpenAPI
   */
  getFunctionDefinitions() {
    const functions = this.registry.list();
    
    return functions.map(func => ({
      name: func.definition.name,
      description: func.definition.description,
      parameters: func.definition.parameters.describe(),
      authLevel: func.definition.authLevel || 'public',
      tags: func.definition.tags || []
    }));
  }
} 