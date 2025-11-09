/**
 * WebSocket Communication Adapter for AgentBridge
 * 
 * Provides WebSocket-based communication for self-hosted mode
 */

import { Message, MessageType } from './types';
import { CommunicationManager } from './agent-bridge';

export interface WebSocketAdapterConfig {
  /** WebSocket server URL */
  url: string;
  /** Auto-reconnect on disconnect */
  autoReconnect?: boolean;
  /** Reconnect delay in milliseconds */
  reconnectDelay?: number;
  /** Maximum reconnect attempts */
  maxReconnectAttempts?: number;
  /** Enable debug logging */
  debug?: boolean;
}

export class WebSocketAdapter implements CommunicationManager {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketAdapterConfig>;
  private messageHandler: ((message: Message) => void) | null = null;
  private reconnectAttempts = 0;
  private isConnecting = false;
  private messageQueue: Message[] = [];
  private connectionCallbacks: (() => void)[] = [];

  constructor(config: WebSocketAdapterConfig) {
    this.config = {
      url: config.url,
      autoReconnect: config.autoReconnect ?? true,
      reconnectDelay: config.reconnectDelay ?? 3000,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 10,
      debug: config.debug ?? false
    };
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.log('Already connected');
      return;
    }

    if (this.isConnecting) {
      this.log('Connection already in progress');
      return;
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        this.log(`Connecting to ${this.config.url}`);
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          this.log('Connected successfully');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // Flush queued messages
          this.flushMessageQueue();
          
          // Call connection callbacks
          this.connectionCallbacks.forEach(cb => cb());
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as Message;
            this.log('Received message:', message.type);
            
            if (this.messageHandler) {
              this.messageHandler(message);
            }
          } catch (error) {
            this.error('Error parsing message:', error);
          }
        };

        this.ws.onclose = (event) => {
          this.log('Connection closed', event.code, event.reason);
          this.isConnecting = false;
          this.ws = null;

          // Attempt to reconnect if enabled
          if (this.config.autoReconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.reconnectAttempts++;
            this.log(`Reconnecting in ${this.config.reconnectDelay}ms (attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);
            
            setTimeout(() => {
              this.connect().catch(err => {
                this.error('Reconnection failed:', err);
              });
            }, this.config.reconnectDelay);
          }
        };

        this.ws.onerror = (error) => {
          this.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        this.error('Failed to create WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  async disconnect(): Promise<void> {
    if (this.ws) {
      this.log('Disconnecting');
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Send a message to the server
   */
  sendMessage(message: Message): void {
    // If not connected, queue the message
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.log('Queueing message (not connected):', message.type);
      this.messageQueue.push(message);
      return;
    }

    try {
      const messageStr = JSON.stringify(message);
      this.ws.send(messageStr);
      this.log('Sent message:', message.type);
    } catch (error) {
      this.error('Error sending message:', error);
    }
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    if (this.messageQueue.length === 0) return;
    
    this.log(`Flushing ${this.messageQueue.length} queued messages`);
    
    // Send all queued messages
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }

  /**
   * Set message handler
   */
  onMessage(handler: (message: Message) => void): void {
    this.messageHandler = handler;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Register a callback to be called when connected
   */
  onConnected(callback: () => void): void {
    this.connectionCallbacks.push(callback);
    
    // If already connected, call immediately
    if (this.isConnected()) {
      callback();
    }
  }

  /**
   * Log debug message
   */
  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[WebSocketAdapter]', ...args);
    }
  }

  /**
   * Log error message
   */
  private error(...args: any[]): void {
    console.error('[WebSocketAdapter]', ...args);
  }
}

