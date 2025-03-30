import { Message, MessageType } from '@agentbridge/core';
import WebSocket from 'ws';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import { WebSocketServer } from 'ws';

/**
 * Client connection in the AgentBridge server
 */
interface ClientConnection {
  /** Client ID */
  id: string;
  /** WebSocket connection */
  socket: WebSocket;
  /** Client capabilities */
  capabilities?: {
    functions?: any[];
    components?: any[];
  };
  /** Session ID */
  sessionId?: string;
  /** Last active timestamp */
  lastActive: number;
}

/**
 * Agent connection in the AgentBridge server
 */
interface AgentConnection {
  /** Agent ID */
  id: string;
  /** WebSocket connection */
  socket: WebSocket;
  /** Last active timestamp */
  lastActive: number;
}

/**
 * Server configuration options
 */
export interface AgentBridgeServerConfig {
  /** WebSocket server options */
  websocket?: {
    /** Port to listen on */
    port?: number;
    /** Host to bind to */
    host?: string;
    /** Path for WebSocket connections */
    path?: string;
    /** Custom WebSocket server */
    server?: WebSocket.Server;
    /** HTTP server to attach to */
    httpServer?: http.Server;
  };
  /** Security options */
  security?: {
    /** Whether to use TLS */
    useTls?: boolean;
    /** API key for authentication */
    apiKey?: string;
    /** JWT secret for authentication */
    jwtSecret?: string;
    /** Whether to enable CORS */
    cors?: boolean;
    /** CORS origins */
    corsOrigins?: string[];
  };
  /** Logging options */
  logging?: {
    /** Log level */
    level?: 'debug' | 'info' | 'warn' | 'error';
    /** Whether to log message bodies */
    logBodies?: boolean;
  };
}

/**
 * Server implementation for AgentBridge
 * Manages WebSocket connections between clients and agents
 */
export class AgentBridgeServer {
  /** WebSocket server */
  private wss: WebSocket.Server;
  /** HTTP server (if created by this instance) */
  private httpServer?: http.Server;
  /** Client connections */
  private clients: Map<string, ClientConnection> = new Map();
  /** Agent connections */
  private agents: Map<string, AgentConnection> = new Map();
  /** Config options */
  private config: AgentBridgeServerConfig;
  /** Heartbeat interval ID */
  private heartbeatInterval?: NodeJS.Timeout;
  
  /**
   * Create a new AgentBridge server
   * @param config Server configuration options
   */
  constructor(config: AgentBridgeServerConfig = {}) {
    this.config = config;
    
    // Create WebSocket server
    if (config.websocket?.server) {
      this.wss = config.websocket.server;
    } else if (config.websocket?.httpServer) {
      this.wss = new WebSocket.Server({
        server: config.websocket.httpServer,
        path: config.websocket.path || '/agent-bridge'
      });
    } else {
      const port = config.websocket?.port || 3099;
      const host = config.websocket?.host || 'localhost';
      
      // Create HTTP server
      this.httpServer = http.createServer((req, res) => {
        // Handle CORS if enabled
        if (config.security?.cors) {
          const allowedOrigins = config.security.corsOrigins || ['*'];
          const origin = req.headers.origin || '';
          
          if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            
            if (req.method === 'OPTIONS') {
              res.writeHead(204);
              res.end();
              return;
            }
          }
        }
        
        // Simple health check endpoint
        if (req.url === '/health') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'ok',
            clients: this.clients.size,
            agents: this.agents.size
          }));
          return;
        }
        
        // Handle 404 for other endpoints
        res.writeHead(404);
        res.end();
      });
      
      // Create WebSocket server
      this.wss = new WebSocket.Server({
        server: this.httpServer,
        path: config.websocket?.path || '/agent-bridge'
      });
      
      // Start HTTP server
      this.httpServer.listen(port, host, () => {
        this.log('info', `AgentBridge server listening on ws://${host}:${port}${config.websocket?.path || '/agent-bridge'}`);
      });
    }
    
    // Set up WebSocket server event handlers
    this.wss.on('connection', this.handleConnection.bind(this));
    this.wss.on('error', (error) => {
      this.log('error', 'WebSocket server error:', error);
    });
    
    // Start heartbeat interval to detect dead connections
    this.heartbeatInterval = setInterval(this.checkHeartbeats.bind(this), 30000);
    
    this.log('info', 'AgentBridge server initialized');
  }
  
  /**
   * Log a message
   * @param level Log level
   * @param message Message to log
   * @param data Additional data to log
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
    const logLevel = this.config.logging?.level || 'info';
    
    // Skip if log level is too low
    if (
      (logLevel === 'error' && level !== 'error') ||
      (logLevel === 'warn' && !['warn', 'error'].includes(level)) ||
      (logLevel === 'info' && !['info', 'warn', 'error'].includes(level))
    ) {
      return;
    }
    
    const timestamp = new Date().toISOString();
    const prefix = `[AgentBridge Server] [${timestamp}] [${level.toUpperCase()}]`;
    
    // Log message
    if (data && this.config.logging?.logBodies) {
      console[level](`${prefix} ${message}`, data);
    } else {
      console[level](`${prefix} ${message}`);
    }
  }
  
  /**
   * Handle a new WebSocket connection
   * @param socket The WebSocket connection
   */
  private handleConnection(socket: WebSocket): void {
    // Generate a unique ID for this connection
    const connectionId = uuidv4();
    
    // Store the connection
    this.clients.set(connectionId, {
      id: connectionId,
      socket,
      lastActive: Date.now()
    });
    
    // Set up event handlers
    socket.on('message', (data) => {
      this.handleMessage(connectionId, socket, data);
    });
    
    socket.on('close', () => {
      this.handleClose(connectionId);
    });
    
    socket.on('error', (err) => {
      console.error(`[AgentBridge Server] Socket error for ${connectionId}:`, err);
      this.handleClose(connectionId);
    });
    
    // Log the connection
    this.log('info', `New connection: ${connectionId}`);
  }
  
  /**
   * Handle a message from a client or agent
   * @param connectionId Connection ID
   * @param socket WebSocket connection
   * @param data Message data
   */
  private handleMessage(connectionId: string, socket: WebSocket, data: WebSocket.Data): void {
    try {
      // Parse the message
      const message = JSON.parse(data.toString()) as Message;
      
      // Update last active timestamp
      if (this.clients.has(connectionId)) {
        const client = this.clients.get(connectionId)!;
        client.lastActive = Date.now();
      } else if (this.agents.has(connectionId)) {
        const agent = this.agents.get(connectionId)!;
        agent.lastActive = Date.now();
      }
      
      // Check if this is a client or agent based on message type
      if (message.type === MessageType.REGISTER_CAPABILITIES) {
        // This is a client registering its capabilities
        this.handleClientCapabilities(connectionId, socket, message);
      } else if (message.type === MessageType.QUERY_CAPABILITIES) {
        // This is an agent querying for capabilities
        this.handleAgentQuery(connectionId, socket, message);
      } else if (
        message.type === MessageType.CALL_FUNCTION ||
        message.type === MessageType.UPDATE_COMPONENT ||
        message.type === MessageType.CALL_COMPONENT_ACTION
      ) {
        // This is an agent sending a command to a client
        this.handleAgentCommand(connectionId, message);
      } else if (
        message.type === MessageType.FUNCTION_RESULT ||
        message.type === MessageType.COMPONENT_UPDATE_RESULT ||
        message.type === MessageType.COMPONENT_ACTION_RESULT
      ) {
        // This is a client sending a result to an agent
        this.handleClientResult(connectionId, message);
      } else if (message.type === MessageType.SESSION) {
        // Session management message
        this.handleSessionMessage(connectionId, message);
      } else {
        this.log('warn', `Unknown message type from ${connectionId}: ${message.type}`);
      }
    } catch (error) {
      this.log('error', `Error handling message from ${connectionId}:`, error);
    }
  }
  
  /**
   * Handle a client registering its capabilities
   * @param clientId Client ID
   * @param socket WebSocket connection
   * @param message Capabilities message
   */
  private handleClientCapabilities(clientId: string, socket: WebSocket, message: Message): void {
    const client = this.clients.get(clientId);
    
    if (!client) {
      this.log('warn', `Received capabilities from unknown client: ${clientId}`);
      return;
    }
    
    // Update client capabilities
    client.capabilities = {
      functions: (message as any).functions || [],
      components: (message as any).components || []
    };
    
    this.log('info', `Updated capabilities for client ${clientId}`);
  }
  
  /**
   * Handle an agent querying for capabilities
   * @param connectionId Connection ID
   * @param socket WebSocket connection
   * @param message Query message
   */
  private handleAgentQuery(connectionId: string, socket: WebSocket, message: Message): void {
    // If this is a new agent, register it
    if (!this.agents.has(connectionId)) {
      this.agents.set(connectionId, {
        id: connectionId,
        socket,
        lastActive: Date.now()
      });
      
      // Remove it from clients if it was there
      if (this.clients.has(connectionId)) {
        this.clients.delete(connectionId);
      }
    }
    
    // Collect capabilities from all clients
    const functions: any[] = [];
    const components: any[] = [];
    
    for (const client of this.clients.values()) {
      if (client.capabilities) {
        if (client.capabilities.functions) {
          functions.push(...client.capabilities.functions.map(func => ({
            ...func,
            clientId: client.id
          })));
        }
        
        if (client.capabilities.components) {
          components.push(...client.capabilities.components.map(comp => ({
            ...comp,
            clientId: client.id
          })));
        }
      }
    }
    
    // Send capabilities to the agent
    const response: Message = {
      type: MessageType.CAPABILITIES_RESULT,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      sessionId: message.sessionId
    };
    
    const fullResponse = {
      ...response,
      functions,
      components
    };
    
    socket.send(JSON.stringify(fullResponse));
  }
  
  /**
   * Handle an agent sending a command to a client
   * @param agentId Agent ID
   * @param message Command message
   */
  private handleAgentCommand(agentId: string, message: Message): void {
    // Determine which client to send the command to
    const targetClientId = (message as any).clientId;
    
    if (!targetClientId) {
      this.log('warn', `Agent ${agentId} sent command without target client ID`);
      
      // Send error response to agent
      const errorMessage: Message = {
        type: MessageType.ERROR,
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        sessionId: message.sessionId
      };
      
      const fullErrorMessage = {
        ...errorMessage,
        code: 'missing_client_id',
        message: 'Command message is missing a target client ID'
      };
      
      const agent = this.agents.get(agentId);
      
      if (agent) {
        agent.socket.send(JSON.stringify(fullErrorMessage));
      }
      
      return;
    }
    
    // Find the target client
    const client = this.clients.get(targetClientId);
    
    if (!client) {
      this.log('warn', `Agent ${agentId} sent command to unknown client: ${targetClientId}`);
      
      // Send error response to agent
      const errorMessage: Message = {
        type: MessageType.ERROR,
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        sessionId: message.sessionId
      };
      
      const fullErrorMessage = {
        ...errorMessage,
        code: 'client_not_found',
        message: `Client ${targetClientId} not found`
      };
      
      const agent = this.agents.get(agentId);
      
      if (agent) {
        agent.socket.send(JSON.stringify(fullErrorMessage));
      }
      
      return;
    }
    
    // Forward the command to the client
    const commandMessage = { ...message, agentId };
    client.socket.send(JSON.stringify(commandMessage));
  }
  
  /**
   * Handle a client sending a result to an agent
   * @param clientId Client ID
   * @param message Result message
   */
  private handleClientResult(clientId: string, message: Message): void {
    // Determine which agent to send the result to
    const targetAgentId = (message as any).agentId;
    
    if (!targetAgentId) {
      this.log('warn', `Client ${clientId} sent result without target agent ID`);
      return;
    }
    
    // Find the target agent
    const agent = this.agents.get(targetAgentId);
    
    if (!agent) {
      this.log('warn', `Client ${clientId} sent result to unknown agent: ${targetAgentId}`);
      return;
    }
    
    // Forward the result to the agent
    const resultMessage = { ...message, clientId };
    agent.socket.send(JSON.stringify(resultMessage));
  }
  
  /**
   * Handle a session management message
   * @param connectionId Connection ID
   * @param message Session message
   */
  private handleSessionMessage(connectionId: string, message: Message): void {
    const sessionMessage = message as any;
    
    if (sessionMessage.action === 'heartbeat') {
      // Update last active timestamp
      if (this.clients.has(connectionId)) {
        const client = this.clients.get(connectionId)!;
        client.lastActive = Date.now();
      } else if (this.agents.has(connectionId)) {
        const agent = this.agents.get(connectionId)!;
        agent.lastActive = Date.now();
      }
    } else if (sessionMessage.action === 'disconnect') {
      // Close the connection
      this.handleClose(connectionId);
      
      // If the socket is still open, close it
      if (this.clients.has(connectionId)) {
        const client = this.clients.get(connectionId)!;
        client.socket.close();
      } else if (this.agents.has(connectionId)) {
        const agent = this.agents.get(connectionId)!;
        agent.socket.close();
      }
    }
  }
  
  /**
   * Handle a WebSocket connection being closed
   * @param connectionId Connection ID
   */
  private handleClose(connectionId: string): void {
    // Remove client or agent
    if (this.clients.has(connectionId)) {
      this.clients.delete(connectionId);
      this.log('info', `Client disconnected: ${connectionId}`);
    } else if (this.agents.has(connectionId)) {
      this.agents.delete(connectionId);
      this.log('info', `Agent disconnected: ${connectionId}`);
    }
  }
  
  /**
   * Check for inactive connections
   */
  private checkHeartbeats(): void {
    const now = Date.now();
    const timeout = 60000; // 60 seconds
    
    // Check clients
    for (const [clientId, client] of this.clients.entries()) {
      if (now - client.lastActive > timeout) {
        this.log('info', `Client ${clientId} timed out`);
        client.socket.close();
        this.clients.delete(clientId);
      }
    }
    
    // Check agents
    for (const [agentId, agent] of this.agents.entries()) {
      if (now - agent.lastActive > timeout) {
        this.log('info', `Agent ${agentId} timed out`);
        agent.socket.close();
        this.agents.delete(agentId);
      }
    }
  }
  
  /**
   * Stop the server
   */
  stop(): void {
    // Clear heartbeat interval
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    // Close all connections
    for (const client of this.clients.values()) {
      try {
        client.socket.close();
      } catch (error) {
        // Ignore
      }
    }
    
    for (const agent of this.agents.values()) {
      try {
        agent.socket.close();
      } catch (error) {
        // Ignore
      }
    }
    
    // Clear connection maps
    this.clients.clear();
    this.agents.clear();
    
    // Close WebSocket server
    this.wss.close(() => {
      this.log('info', 'WebSocket server closed');
    });
    
    // Close HTTP server if created by this instance
    if (this.httpServer) {
      this.httpServer.close(() => {
        this.log('info', 'HTTP server closed');
      });
    }
    
    this.log('info', 'AgentBridge server stopped');
  }
  
  /**
   * Get the number of connected clients
   * @returns Number of connected clients
   */
  getClientCount(): number {
    return this.clients.size;
  }
  
  /**
   * Get the number of connected agents
   * @returns Number of connected agents
   */
  getAgentCount(): number {
    return this.agents.size;
  }

  /**
   * Handle WebSocket connections
   */
  private handleWebSocketConnections(): void {
    // Configure the WebSocket server
    this.wss = new WebSocketServer({ 
      noServer: true, 
      path: this.config.websocket?.path 
    });

    // Handle upgrade requests
    this.httpServer?.on('upgrade', (req: http.IncomingMessage, socket: any, head: Buffer) => {
      if (this.wss) {
        this.wss.handleUpgrade(req, socket, head, (ws) => {
          this.wss?.emit('connection', ws);
        });
      }
    });
  }
} 