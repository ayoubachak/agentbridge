import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { EventEmitter } from './event-emitter';
import { 
  AgentBridgeConfig, 
  CallResult, 
  ComponentImplementation,
  ExecutionContext, 
  FunctionImplementation, 
  MessageType,
  Message
} from './types';
import { InMemoryFunctionRegistry } from './registry';
import { InMemoryComponentRegistry } from './component-registry';
import { Adapter } from './adapter';

/**
 * Main AgentBridge class that manages function and component registration and execution
 */
export class AgentBridge extends EventEmitter {
  private functionRegistry: InMemoryFunctionRegistry;
  private componentRegistry: InMemoryComponentRegistry;
  private config: AgentBridgeConfig;
  private communicationManager: CommunicationManager | null = null;
  private sessionId: string;
  private hasRegisteredCapabilities: boolean = false;
  /** Components registered with this instance */
  public components: any[] = [];
  /** Framework adapter */
  public adapter?: Adapter;
  
  /**
   * Create a new AgentBridge instance
   * @param config Configuration options
   */
  constructor(config: AgentBridgeConfig = {}) {
    super(); // Initialize EventEmitter
    this.functionRegistry = new InMemoryFunctionRegistry();
    this.componentRegistry = new InMemoryComponentRegistry();
    this.config = config;
    this.sessionId = uuidv4();
    
    // Initialize communication manager if configuration is provided
    if (config.communication) {
      this.initializeCommunication();
    }
  }

  /**
   * Initialize the appropriate communication manager based on configuration
   */
  private initializeCommunication(): void {
    if (!this.config.communication) return;
    
    const mode = this.config.communication.mode;
    
    if (mode === 'self-hosted') {
      // Initialize self-hosted communication (WebSocket)
      // This will be implemented in a separate package
      this.log('debug', 'Initializing self-hosted communication');
      // Communication manager will be set by the self-hosted package
    } else if (mode === 'pubsub') {
      // Initialize pubsub communication
      // This will be implemented in separate packages for different providers
      const provider = this.config.communication.pubsub?.provider;
      this.log('debug', `Initializing pubsub communication with provider: ${provider}`);
      // Communication manager will be set by the pubsub provider package
    } else {
      this.log('error', `Unsupported communication mode: ${mode}`);
    }
  }

  /**
   * Set the communication manager (called by communication packages)
   * @param manager The communication manager instance
   */
  setCommunicationManager(manager: CommunicationManager): void {
    this.communicationManager = manager;
    
    // Set up message handlers
    manager.onMessage(this.handleIncomingMessage.bind(this));
    
    // If the manager has an onConnected method (WebSocketAdapter), use it
    // @ts-ignore - WebSocketAdapter has an onConnected method
    if (typeof manager.onConnected === 'function') {
      // @ts-ignore
      manager.onConnected(() => {
        this.log('debug', 'Communication manager connected, sending capabilities');
        this.sendCapabilities();
      });
      
      // Also initiate connection if connect method exists
      // @ts-ignore
      if (typeof manager.connect === 'function') {
        // @ts-ignore
        manager.connect().catch((err: any) => {
          this.log('error', 'Failed to connect communication manager', err);
        });
      }
    } else {
      // For non-WebSocket adapters (like pub/sub), send immediately
      this.sendCapabilities();
    }
  }

  /**
   * Handle incoming messages from the communication manager
   * @param message The received message
   */
  private async handleIncomingMessage(message: Message): Promise<void> {
    try {
      switch (message.type) {
        case MessageType.CALL_FUNCTION:
          // Handle function call message
          await this.handleFunctionCallMessage(message as any);
          break;
        case MessageType.UPDATE_COMPONENT:
          // Handle component update message
          await this.handleComponentUpdateMessage(message as any);
          break;
        case MessageType.CALL_COMPONENT_ACTION:
          // Handle component action message
          await this.handleComponentActionMessage(message as any);
          break;
        case MessageType.QUERY_CAPABILITIES:
          // Handle capabilities query
          await this.handleQueryCapabilitiesMessage(message as any);
          break;
        case MessageType.SESSION:
          // Handle session message
          await this.handleSessionMessage(message as any);
          break;
        case 'connection_ack' as any:
          // Server acknowledgment - just log and ignore
          this.log('debug', 'Received connection acknowledgment from server');
          break;
        case 'capabilities_updated' as any:
          // Server notification that capabilities were updated - can be ignored on client side
          this.log('debug', 'Server confirmed capabilities update');
          break;
        default:
          // Only warn if it's actually a problem - some messages are informational
          if (message.type && !['connection_ack', 'capabilities_updated'].includes(message.type as string)) {
            this.log('warn', `Received unsupported message type: ${message.type}`);
          }
      }
    } catch (error) {
      this.log('error', 'Error handling message', error);
      this.sendErrorMessage(message.id, 'PROCESSING_ERROR', 'Error processing message', error);
    }
  }

  /**
   * Send error message
   * @param correlationId Correlation ID of the original message
   * @param code Error code
   * @param message Error message
   * @param details Additional error details
   */
  private sendErrorMessage(correlationId: string, code: string, message: string, details?: any): void {
    if (!this.communicationManager) return;
    
    this.communicationManager.sendMessage({
      type: MessageType.ERROR,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      code,
      message,
      details: this.config.security?.enableDetailedErrors ? details : undefined
    });
  }

  /**
   * Send capabilities information
   */
  private sendCapabilities(): void {
    if (!this.communicationManager) return;
    
    const functionDefinitions = this.getFunctionDefinitions();
    const componentDefinitions = this.getComponentDefinitions();
    
    // Don't send empty capabilities on initial registration
    // Only send if we have capabilities OR if we've previously registered (for reconnection)
    if (
      (functionDefinitions.length === 0 && componentDefinitions.length === 0) &&
      !this.hasRegisteredCapabilities
    ) {
      this.log('debug', 'Skipping capability registration - no capabilities yet');
      return;
    }
    
    this.log('debug', `Sending capabilities: ${functionDefinitions.length} functions, ${componentDefinitions.length} components`);
    
    this.communicationManager.sendMessage({
      type: MessageType.REGISTER_CAPABILITIES,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      functions: functionDefinitions,
      components: componentDefinitions
    });
    
    // Mark that we've sent capabilities at least once
    this.hasRegisteredCapabilities = true;
  }

  /**
   * Handle function call message
   * @param message Function call message
   */
  private async handleFunctionCallMessage(message: any): Promise<void> {
    if (!this.communicationManager) return;
    
    const { name, parameters } = message;
    
    // Default context parameters
    const contextParams = {
      agent: {
        id: 'unknown',
        name: 'Agent'
      },
      application: {
        id: this.sessionId,
        name: 'Application',
        environment: 'development' as 'development' | 'production'
      }
    };
    
    // Call the function
    const result = await this.callFunction(name, parameters, contextParams);
    
    // Send result
    this.communicationManager.sendMessage({
      type: MessageType.FUNCTION_RESULT,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      correlationId: message.id,
      success: result.success,
      data: result.data,
      error: result.error
    });
  }

  /**
   * Handle component update message
   * @param message Component update message
   */
  private async handleComponentUpdateMessage(message: any): Promise<void> {
    if (!this.communicationManager) return;
    
    const { id, properties } = message;
    
    // Get the component
    const component = this.componentRegistry.get(id);
    
    if (!component) {
      this.sendErrorMessage(message.id, 'COMPONENT_NOT_FOUND', `Component '${id}' not found`);
      return;
    }
    
    // Check if component has an update handler
    if (!component.updateHandler) {
      this.sendErrorMessage(message.id, 'UPDATE_NOT_SUPPORTED', 
        `Component '${id}' does not support updates`);
      return;
    }
    
    const startTime = new Date();
    
    try {
      // Validate properties if schema is defined
      let validatedProps = properties;
      if (component.definition.properties) {
        try {
          validatedProps = component.definition.properties.parse(properties);
        } catch (error) {
          this.sendErrorMessage(message.id, 'INVALID_PROPERTIES', 'Invalid properties', error);
          return;
        }
      }
      
      // Create context
      const context: ExecutionContext = {
        agent: {
          id: 'unknown',
          name: 'Agent'
        },
        application: {
          id: this.sessionId,
          name: 'Application',
          environment: 'development' as 'development' | 'production'
        },
        request: {
          id: uuidv4(),
          timestamp: startTime
        }
      };
      
      // Call update handler
      await component.updateHandler(validatedProps, context);
      
      // Send success result
      this.communicationManager.sendMessage({
        type: MessageType.COMPONENT_UPDATE_RESULT,
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        correlationId: message.id,
        success: true,
        meta: {
          durationMs: new Date().getTime() - startTime.getTime(),
          startedAt: startTime,
          completedAt: new Date()
        }
      });
    } catch (error) {
      // Send error result
      this.communicationManager.sendMessage({
        type: MessageType.COMPONENT_UPDATE_RESULT,
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        correlationId: message.id,
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Error updating component',
          details: this.config.security?.enableDetailedErrors ? error : undefined
        },
        meta: {
          durationMs: new Date().getTime() - startTime.getTime(),
          startedAt: startTime,
          completedAt: new Date()
        }
      });
    }
  }

  /**
   * Handle component action message
   * @param message Component action message
   */
  private async handleComponentActionMessage(message: any): Promise<void> {
    if (!this.communicationManager) return;
    
    const { id, action, parameters } = message;
    
    // Get the component
    const component = this.componentRegistry.get(id);
    
    if (!component) {
      this.sendErrorMessage(message.id, 'COMPONENT_NOT_FOUND', `Component '${id}' not found`);
      return;
    }
    
    // Check if component has the action handler
    if (!component.actionHandlers || !component.actionHandlers[action]) {
      this.sendErrorMessage(message.id, 'ACTION_NOT_SUPPORTED', 
        `Component '${id}' does not support action '${action}'`);
      return;
    }
    
    const startTime = new Date();
    
    try {
      // Validate parameters if schema is defined
      let validatedParams = parameters;
      const actionDef = component.definition.actions?.[action];
      if (actionDef && actionDef.parameters) {
        try {
          validatedParams = actionDef.parameters.parse(parameters);
        } catch (error) {
          this.sendErrorMessage(message.id, 'INVALID_PARAMETERS', 'Invalid parameters', error);
          return;
        }
      }
      
      // Create context
      const context: ExecutionContext = {
        agent: {
          id: 'unknown',
          name: 'Agent'
        },
        application: {
          id: this.sessionId,
          name: 'Application',
          environment: 'development' as 'development' | 'production'
        },
        request: {
          id: uuidv4(),
          timestamp: startTime
        }
      };
      
      // Call action handler
      const result = await component.actionHandlers[action](validatedParams, context);
      
      // Send success result
      this.communicationManager.sendMessage({
        type: MessageType.COMPONENT_ACTION_RESULT,
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        correlationId: message.id,
        success: true,
        data: result,
        meta: {
          durationMs: new Date().getTime() - startTime.getTime(),
          startedAt: startTime,
          completedAt: new Date()
        }
      });
    } catch (error) {
      // Send error result
      this.communicationManager.sendMessage({
        type: MessageType.COMPONENT_ACTION_RESULT,
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        correlationId: message.id,
        success: false,
        error: {
          code: 'ACTION_ERROR',
          message: `Error executing action '${action}'`,
          details: this.config.security?.enableDetailedErrors ? error : undefined
        },
        meta: {
          durationMs: new Date().getTime() - startTime.getTime(),
          startedAt: startTime,
          completedAt: new Date()
        }
      });
    }
  }

  /**
   * Handle query capabilities message
   * @param message Query capabilities message
   */
  private handleQueryCapabilitiesMessage(message: any): void {
    if (!this.communicationManager) return;
    
    const { filters } = message;
    
    // Query functions based on filters
    const functions = this.functionRegistry.query({
      tags: filters?.functionTags,
      authLevel: filters?.functionAuthLevel
    });
    
    // Query components based on filters
    const components = this.componentRegistry.query({
      componentType: filters?.componentType,
      tags: filters?.componentTags,
      authLevel: filters?.componentAuthLevel,
      path: filters?.componentPath
    });
    
    // Convert to definitions
    const functionDefs = functions.map(func => ({
      name: func.definition.name,
      description: func.definition.description,
      parameters: func.definition.parameters.describe("Parameters"),
      authLevel: func.definition.authLevel || 'public',
      tags: func.definition.tags || []
    }));
    
    const componentDefs = components.map(comp => ({
      id: comp.definition.id,
      description: comp.definition.description,
      componentType: comp.definition.componentType,
      properties: comp.definition.properties?.describe("Properties"),
      actions: comp.definition.actions ? Object.entries(comp.definition.actions).reduce((acc, [name, def]) => {
        acc[name] = {
          description: def.description,
          parameters: def.parameters?.describe("Parameters")
        };
        return acc;
      }, {} as Record<string, any>) : undefined,
      authLevel: comp.definition.authLevel || 'public',
      tags: comp.definition.tags || [],
      path: comp.definition.path
    }));
    
    // Send capabilities result
    this.communicationManager.sendMessage({
      type: MessageType.CAPABILITIES_RESULT,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      correlationId: message.id,
      functions: functionDefs,
      components: componentDefs
    });
  }

  /**
   * Handle session message
   * @param message Session message
   */
  private handleSessionMessage(message: any): void {
    if (!this.communicationManager) return;
    
    const { action } = message;
    
    switch (action) {
      case 'connect':
        // New connection, send capabilities
        this.sendCapabilities();
        break;
      case 'disconnect':
        // Handle disconnect
        this.log('debug', 'Received disconnect request');
        break;
      case 'heartbeat':
        // Respond to heartbeat
        this.communicationManager.sendMessage({
          type: MessageType.SESSION,
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          sessionId: this.sessionId,
          correlationId: message.id,
          action: 'heartbeat'
        });
        break;
      default:
        this.log('warn', `Received unsupported session action: ${action}`);
    }
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
    
    this.functionRegistry.register(func);
    
    // Notify about new capability if communication is active
    if (this.communicationManager) {
      this.communicationManager.sendMessage({
        type: MessageType.UPDATE_CAPABILITIES,
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        functions: [{
          name,
          description,
          parameters: parameters.describe("Parameters"),
          authLevel: options.authLevel || 'public',
          tags: options.tags || []
        }]
      });
    }
  }

  /**
   * Register a new UI component
   * @param definition Component metadata
   * @param updateHandler Handler for updating component properties
   * @param actionHandlers Handlers for component actions
   */
  registerComponent<P = any>(
    id: string,
    description: string,
    componentType: string,
    options: {
      properties?: z.ZodType<P>;
      actions?: Record<string, {
        description: string;
        parameters?: z.ZodType<any>;
        handler: (params: any, context: ExecutionContext) => Promise<any>;
      }>;
      updateHandler?: (properties: P, context: ExecutionContext) => Promise<void>;
      authLevel?: 'public' | 'user' | 'admin';
      tags?: string[];
      path?: string;
    } = {}
  ): void {
    // Extract action definitions and handlers
    const actionDefs: Record<string, { description: string; parameters?: z.ZodType<any> }> = {};
    const actionHandlers: Record<string, (params: any, context: ExecutionContext) => Promise<any>> = {};
    
    if (options.actions) {
      for (const [name, action] of Object.entries(options.actions)) {
        actionDefs[name] = {
          description: action.description,
          parameters: action.parameters
        };
        actionHandlers[name] = action.handler;
      }
    }
    
    const component: ComponentImplementation<P> = {
      definition: {
        id,
        description,
        componentType,
        properties: options.properties,
        actions: actionDefs,
        authLevel: options.authLevel,
        tags: options.tags,
        path: options.path
      },
      updateHandler: options.updateHandler,
      actionHandlers
    };
    
    this.componentRegistry.register(component);
    
    // Notify about new capability if communication is active
    if (this.communicationManager) {
      this.communicationManager.sendMessage({
        type: MessageType.UPDATE_CAPABILITIES,
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        components: [{
          id,
          description,
          componentType,
          properties: options.properties?.describe("Properties"),
          actions: actionDefs ? Object.entries(actionDefs).reduce((acc, [name, def]) => {
            acc[name] = {
              description: def.description,
              parameters: def.parameters?.describe("Parameters")
            };
            return acc;
          }, {} as Record<string, any>) : undefined,
          authLevel: options.authLevel || 'public',
          tags: options.tags || [],
          path: options.path
        }]
      });
    }
  }

  /**
   * Unregister a function by name
   * @param name The name of the function to unregister
   */
  unregisterFunction(name: string): void {
    this.functionRegistry.unregister(name);
  }

  /**
   * Unregister a component by ID
   * @param id The ID of the component to unregister
   */
  unregisterComponent(id: string): void {
    this.componentRegistry.unregister(id);
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
  ): Promise<CallResult<R>> {
    const startTime = new Date();
    const requestId = uuidv4();
    
    try {
      // Get function implementation
      const func = this.functionRegistry.get(name) as FunctionImplementation<T, R> | undefined;
      
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
      this.log('error', 'Error executing function', error);
      
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
    return this.functionRegistry.list();
  }
  
  /**
   * Get all registered components
   * @returns Array of all registered component implementations
   */
  listComponents(): ComponentImplementation[] {
    return this.componentRegistry.list();
  }
  
  /**
   * Query functions that match certain criteria
   * @param options Query options
   * @returns Array of function implementations that match the criteria
   */
  queryFunctions(options: { tags?: string[]; authLevel?: 'public' | 'user' | 'admin' }): FunctionImplementation[] {
    return this.functionRegistry.query(options);
  }
  
  /**
   * Query components that match certain criteria
   * @param options Query options
   * @returns Array of component implementations that match the criteria
   */
  queryComponents(options: { 
    componentType?: string; 
    tags?: string[]; 
    authLevel?: 'public' | 'user' | 'admin';
    path?: string;
  }): ComponentImplementation[] {
    return this.componentRegistry.query(options);
  }
  
  /**
   * Get OpenAPI-like function definitions
   * @returns Array of function definitions in a format similar to OpenAPI
   */
  getFunctionDefinitions() {
    const functions = this.functionRegistry.list();
    
    return functions.map(func => ({
      name: func.definition.name,
      description: func.definition.description,
      parameters: func.definition.parameters.describe("Parameters"),
      authLevel: func.definition.authLevel || 'public',
      tags: func.definition.tags || []
    }));
  }
  
  /**
   * Get component definitions
   * @returns Array of component definitions
   */
  getComponentDefinitions() {
    const components = this.componentRegistry.list();
    
    return components.map(comp => ({
      id: comp.definition.id,
      description: comp.definition.description,
      componentType: comp.definition.componentType,
      properties: comp.definition.properties?.describe("Properties"),
      actions: comp.definition.actions ? Object.entries(comp.definition.actions).reduce((acc, [name, def]) => {
        acc[name] = {
          description: def.description,
          parameters: def.parameters?.describe("Parameters")
        };
        return acc;
      }, {} as Record<string, any>) : undefined,
      authLevel: comp.definition.authLevel || 'public',
      tags: comp.definition.tags || [],
      path: comp.definition.path
    }));
  }
  
  /**
   * Log a message based on the configured log level
   * @param level Log level
   * @param message Log message
   * @param data Additional log data
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
    const configLevel = this.config.logging?.level || 'info';
    
    // Check if we should log this level
    const levels = ['debug', 'info', 'warn', 'error'];
    const configLevelIndex = levels.indexOf(configLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    if (messageLevelIndex >= configLevelIndex) {
      if (this.config.logging?.logger) {
        // Use custom logger
        this.config.logging.logger[level](message, data);
      } else {
        // Use console
        switch (level) {
          case 'debug':
            console.debug(`[AgentBridge] ${message}`, data);
            break;
          case 'info':
            console.info(`[AgentBridge] ${message}`, data);
            break;
          case 'warn':
            console.warn(`[AgentBridge] ${message}`, data);
            break;
          case 'error':
            console.error(`[AgentBridge] ${message}`, data);
            break;
        }
      }
    }
  }

  public dispose(): void {
    this.components.forEach(component => {
      if (component.dispose) {
        component.dispose();
      }
    });
    
    // Disconnect the adapter
    if (this.adapter) {
      this.adapter.disconnect().catch((_error: any) => {
        console.error('Error disconnecting adapter');
      });
    }
    
    // Clear listeners
    this.removeAllListeners();
  }
}

/**
 * Interface for communication managers
 */
export interface CommunicationManager {
  /**
   * Send a message
   * @param message The message to send
   */
  sendMessage(message: Message): void;
  
  /**
   * Set a message handler to receive incoming messages
   * @param handler The message handler function
   */
  onMessage(handler: (message: Message) => void): void;
  
  /**
   * Connect to the communication channel
   */
  connect(): Promise<void>;
  
  /**
   * Disconnect from the communication channel
   */
  disconnect(): Promise<void>;
} 