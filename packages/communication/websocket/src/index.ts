import WebSocket from 'isomorphic-ws';
import { 
  AgentBridge, 
  CommunicationManager, 
  Message 
} from '@agentbridge/core';

/**
 * Configuration options for the WebSocket communication provider
 */
export interface WebSocketCommunicationConfig {
  /** WebSocket server URL */
  url: string;
  /** Custom WebSocket implementation (optional) */
  WebSocketImpl?: typeof WebSocket;
  /** Reconnection options */
  reconnect?: {
    /** Whether to automatically reconnect */
    enabled: boolean;
    /** Maximum number of reconnection attempts */
    maxAttempts?: number;
    /** Initial delay before reconnecting (ms) */
    initialDelay?: number;
    /** Maximum delay between reconnection attempts (ms) */
    maxDelay?: number;
    /** Factor by which to increase delay between reconnection attempts */
    factor?: number;
  };
  /** Optional headers to include in the WebSocket connection */
  headers?: Record<string, string>;
  /** Optional query parameters to include in the WebSocket URL */
  queryParams?: Record<string, string>;
}

/**
 * Default reconnection options
 */
const DEFAULT_RECONNECT_OPTIONS = {
  enabled: true,
  maxAttempts: 10,
  initialDelay: 1000,
  maxDelay: 30000,
  factor: 1.5
};

/**
 * Connection states for the WebSocket communication manager
 */
type ConnectionState = 'closed' | 'connecting' | 'connected' | 'reconnecting' | 'failed';

/**
 * Implements the CommunicationManager interface using WebSockets as the transport
 */
export class WebSocketCommunicationManager implements CommunicationManager {
  private ws: WebSocket | null = null;
  private WebSocketImpl: typeof WebSocket;
  private messageHandler: ((message: Message) => void) | null = null;
  private config: WebSocketCommunicationConfig;
  private connectionState: ConnectionState = 'closed';
  private reconnectAttempts = 0;
  private reconnectTimer: any = null;
  private messageQueue: Message[] = [];
  
  /**
   * Create a new WebSocket communication manager
   * @param config Configuration options
   */
  constructor(config: WebSocketCommunicationConfig) {
    this.config = {
      ...config,
      reconnect: {
        ...DEFAULT_RECONNECT_OPTIONS,
        ...config.reconnect
      }
    };
    
    // Use provided WebSocket implementation or default
    this.WebSocketImpl = config.WebSocketImpl || WebSocket;
  }
  
  /**
   * Send a message over the WebSocket
   * @param message The message to send
   */
  sendMessage(message: Message): void {
    if (this.connectionState !== 'connected') {
      // Queue message for later if not connected
      this.messageQueue.push(message);
      return;
    }
    
    if (!this.ws) return;
    
    try {
      this.ws.send(JSON.stringify(message));
    } catch (err) {
      console.error('[AgentBridge WebSocket] Error sending message:', err);
    }
  }
  
  /**
   * Set a message handler to receive incoming messages
   * @param handler The message handler function
   */
  onMessage(handler: (message: Message) => void): void {
    this.messageHandler = handler;
  }
  
  /**
   * Build the complete WebSocket URL with query parameters
   * @returns The complete WebSocket URL
   */
  private buildUrl(): string {
    const { url, queryParams } = this.config;
    
    if (!queryParams || Object.keys(queryParams).length === 0) {
      return url;
    }
    
    const urlObj = new URL(url);
    
    // Add query parameters
    Object.entries(queryParams).forEach(([key, value]) => {
      urlObj.searchParams.set(key, value);
    });
    
    return urlObj.toString();
  }
  
  /**
   * Create a new WebSocket connection
   */
  private createWebSocket(): WebSocket {
    const wsUrl = this.buildUrl();
    
    // Create WebSocket
    const ws = new this.WebSocketImpl(wsUrl);
    
    // Set up event handlers
    ws.onopen = this.handleOpen.bind(this);
    ws.onclose = this.handleClose.bind(this);
    ws.onerror = this.handleError.bind(this);
    ws.onmessage = this.handleMessage.bind(this);
    
    return ws;
  }
  
  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    this.connectionState = 'connected';
    this.reconnectAttempts = 0;
    
    console.log('[AgentBridge WebSocket] Connected');
    
    // Send any queued messages
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) this.sendMessage(message);
    }
  }
  
  /**
   * Handle WebSocket close event
   * @param _event Close event (unused but kept for type compatibility)
   */
  private handleClose(/* _: WebSocket.CloseEvent */): void {
    if (this.connectionState === 'failed') return;
    
    const { reconnect } = this.config;
    
    // Check if we should reconnect
    if (reconnect?.enabled && (reconnect.maxAttempts === undefined || 
                             this.reconnectAttempts < reconnect.maxAttempts)) {
      this.connectionState = 'reconnecting';
      this.scheduleReconnect();
    } else {
      this.connectionState = 'closed';
      console.log('[AgentBridge WebSocket] Connection closed');
    }
  }
  
  /**
   * Handle WebSocket error event
   */
  private handleError(): void {
    // Only reject if we're still in connecting state
    if (this.connectionState === 'connecting') {
      this.connectionState = 'failed';
    }
  }
  
  /**
   * Handle WebSocket message event
   * @param event Message event
   */
  private handleMessage(event: WebSocket.MessageEvent): void {
    try {
      const message = JSON.parse(event.data as string) as Message;
      
      if (this.messageHandler) {
        this.messageHandler(message);
      }
    } catch (err) {
      console.error('[AgentBridge WebSocket] Error parsing message:', err);
    }
  }
  
  /**
   * Schedule a reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    const { reconnect } = this.config;
    
    if (!reconnect?.enabled) return;
    
    // Calculate delay
    const initialDelay = reconnect.initialDelay || DEFAULT_RECONNECT_OPTIONS.initialDelay;
    const factor = reconnect.factor || DEFAULT_RECONNECT_OPTIONS.factor;
    const maxDelay = reconnect.maxDelay || DEFAULT_RECONNECT_OPTIONS.maxDelay;
    
    const delay = Math.min(initialDelay * Math.pow(factor, this.reconnectAttempts), maxDelay);
    
    console.log(`[AgentBridge WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
    
    // Schedule reconnection
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connectionState = 'connecting';
      this.connect().catch((err) => {
        console.error('[AgentBridge WebSocket] Reconnection failed:', err);
      });
    }, delay);
  }
  
  /**
   * Connect to the WebSocket server
   */
  async connect(): Promise<void> {
    if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
      return;
    }
    
    this.connectionState = 'connecting';
    
    // Close existing connection if any
    if (this.ws) {
      try {
        this.ws.close();
      } catch (err) {
        // Ignore
      }
    }
    
    // Create new WebSocket
    this.ws = this.createWebSocket();
    
    // Wait for connection
    return new Promise((resolve, reject) => {
      // Set up one-time event handlers
      const onOpen = () => {
        cleanup();
        resolve();
      };
      
      const onError = (/* _: any */): void => {
        cleanup();
        reject(new Error('Failed to connect to WebSocket server'));
      };
      
      const onClose = () => {
        cleanup();
        reject(new Error('WebSocket connection closed before it could connect'));
      };
      
      // Cleanup function
      const cleanup = () => {
        this.ws?.removeEventListener('open', onOpen);
        this.ws?.removeEventListener('error', onError);
        this.ws?.removeEventListener('close', onClose);
      };
      
      // Add event listeners
      this.ws?.addEventListener('open', onOpen);
      this.ws?.addEventListener('error', onError);
      this.ws?.addEventListener('close', onClose);
      
      // If already connected, resolve immediately
      if (this.ws?.readyState === WebSocket.OPEN) {
        cleanup();
        this.connectionState = 'connected';
        resolve();
      }
    });
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  async disconnect(): Promise<void> {
    // Clear reconnection timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (!this.ws) return;
    
    // Close WebSocket connection
    return new Promise((resolve) => {
      const onClose = () => {
        if (this.ws) {
          this.ws.removeEventListener('close', onClose);
        }
        resolve();
      };
      
      this.ws.addEventListener('close', onClose);
      
      this.connectionState = 'closed';
      this.ws.close();
      
      // If already closed, resolve immediately
      if (this.ws.readyState === WebSocket.CLOSED) {
        this.ws.removeEventListener('close', onClose);
        resolve();
      }
    });
  }

  // Handle specific events
  private handleEvents() {
    if (this.ws) {
      // Handle opening of connection
      this.ws.addEventListener('open', () => {
        this.connectionState = 'connected';
        this.reconnectAttempts = 0;
        console.log('[AgentBridge WebSocket] Connected');
        // Send any queued messages
        while (this.messageQueue.length > 0) {
          const message = this.messageQueue.shift();
          if (message) this.sendMessage(message);
        }
      });

      // Handle incoming messages
      this.ws.addEventListener('message', (message: WebSocket.MessageEvent) => {
        this.handleIncomingMessage(message);
      });

      // Handle connection closing
      this.ws.addEventListener('close', () => {
        this.connectionState = 'closed';
        console.log('[AgentBridge WebSocket] Connection closed');
        if (this.config.reconnect?.enabled && (this.config.reconnect.maxAttempts === undefined || 
                                             this.reconnectAttempts < (this.config.reconnect.maxAttempts || DEFAULT_RECONNECT_OPTIONS.maxAttempts))) {
          this.connectionState = 'reconnecting';
          this.scheduleReconnect();
        }
      });

      // Handle errors
      this.ws.addEventListener('error', (/* _ */): void => {
        console.error('[AgentBridge WebSocket] Error:');
        // If we're connecting and get an error, mark as failed
        if (this.connectionState === 'connecting') {
          this.connectionState = 'failed';
        }
      });
    }
  }

  /**
   * Handle an incoming message from the WebSocket
   * @param message The incoming message event
   */
  private handleIncomingMessage(message: WebSocket.MessageEvent): void {
    try {
      // Parse the message content
      const parsedMessage = JSON.parse(message.data as string);
      // Call the message handler instead of using emit
      if (this.messageHandler) {
        this.messageHandler(parsedMessage);
      }
    } catch (_event) {
      console.error('[AgentBridge WebSocket] Error parsing message');
    }
  }

  /**
   * Close the WebSocket connection gracefully
   */
  public close(): void {
    try {
      if (this.ws) {
        this.ws.close();
      }
      // Set the connection state
      this.connectionState = 'closed';
      console.log('[AgentBridge WebSocket] Connection closed');
    } catch (_err) {
      console.error('Error closing WebSocket connection');
    }
  }

  /**
   * Publish a message to the WebSocket
   * @param message The message to publish
   */
  private publish(message: Message): void {
    if (!this.ws) return;
    
    try {
      this.ws.send(JSON.stringify(message));
    } catch (_err) {
      console.error('[AgentBridge WebSocket] Error publishing message');
    }
  }
}

/**
 * Initialize AgentBridge with WebSocket-based communication
 * @param bridge AgentBridge instance
 * @param config WebSocket configuration options
 */
export function initializeWebSocketProvider(
  bridge: AgentBridge,
  config: WebSocketCommunicationConfig
): WebSocketCommunicationManager {
  // Create communication manager
  const manager = new WebSocketCommunicationManager(config);
  
  // Set communication manager in AgentBridge
  bridge.setCommunicationManager(manager);
  
  // Connect to WebSocket server
  manager.connect().catch((err) => {
    console.error('[AgentBridge WebSocket] Failed to connect:', err);
  });
  
  return manager;
} 