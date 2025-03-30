import Pusher from 'pusher-js';
import { 
  AgentBridge, 
  CommunicationManager, 
  Message 
} from '@agentbridge/core';

/**
 * Configuration options for the Pusher communication provider
 */
export interface PusherCommunicationConfig {
  /** Pusher API key */
  key: string;
  /** Pusher configuration options */
  options?: {
    /** Pusher cluster */
    cluster?: string;
    /** Whether to use TLS */
    forceTLS?: boolean;
    /** Authentication endpoint */
    authEndpoint?: string;
    /** Authentication parameters */
    auth?: {
      headers?: Record<string, string>;
      params?: Record<string, string>;
    };
    /** Custom Pusher host */
    host?: string;
    /** Custom Pusher port */
    wsPort?: number;
    /** Custom Pusher TLS port */
    wssPort?: number;
    /** Encryption options */
    encrypted?: boolean;
    /** Activity timeout */
    activityTimeout?: number;
    /** Pong timeout */
    pongTimeout?: number;
    /** Custom authorizer function */
    authorizer?: any;
  };
  /** Custom Pusher instance (optional, for testing or custom setups) */
  pusherInstance?: Pusher;
  /** Channel name prefix (without trailing slash) */
  channelPrefix: string;
  /** Name of the capabilities channel */
  capabilitiesChannel?: string;
  /** Name of the commands channel */
  commandsChannel?: string;
  /** Name of the responses channel */
  responsesChannel?: string;
}

/**
 * Default channel names
 */
const DEFAULT_CHANNELS = {
  capabilities: 'capabilities',
  commands: 'commands',
  responses: 'responses'
};

/**
 * Implements the CommunicationManager interface using Pusher as the transport
 */
export class PusherCommunicationManager implements CommunicationManager {
  private pusher: Pusher;
  private capabilitiesChannel: Pusher.Channel;
  private commandsChannel: Pusher.Channel;
  private responsesChannel: Pusher.Channel;
  private messageHandler: ((message: Message) => void) | null = null;
  private connected = false;
  private config: PusherCommunicationConfig;
  
  /**
   * Create a new Pusher communication manager
   * @param config Configuration options
   */
  constructor(config: PusherCommunicationConfig) {
    this.config = config;
    
    // Create Pusher client
    if (config.pusherInstance) {
      this.pusher = config.pusherInstance;
    } else {
      this.pusher = new Pusher(config.key, config.options);
    }
    
    // Prepare channel names
    const capabilitiesChannel = config.capabilitiesChannel || DEFAULT_CHANNELS.capabilities;
    const commandsChannel = config.commandsChannel || DEFAULT_CHANNELS.commands;
    const responsesChannel = config.responsesChannel || DEFAULT_CHANNELS.responses;
    
    // Initialize channels
    this.capabilitiesChannel = this.pusher.subscribe(
      `${config.channelPrefix}-${capabilitiesChannel}`
    );
    this.commandsChannel = this.pusher.subscribe(
      `${config.channelPrefix}-${commandsChannel}`
    );
    this.responsesChannel = this.pusher.subscribe(
      `${config.channelPrefix}-${responsesChannel}`
    );
  }
  
  /**
   * Send a message
   * @param message The message to send
   */
  sendMessage(message: Message): void {
    if (!this.connected) {
      console.warn('[AgentBridge Pusher] Attempting to send message while disconnected');
      return;
    }
    
    // Note: We determine the target channel but don't use it directly since
    // Pusher doesn't allow clients to publish directly
    // this.determineTargetChannel(message);
    
    // Publish the message via server endpoint
    // Note: Pusher doesn't allow clients to publish directly, so this is a placeholder.
    // In practice, you'd need a server endpoint to publish messages.
    console.warn('[AgentBridge Pusher] Direct client-side publishing not supported by Pusher. Use server-side endpoint to publish messages.');
    
    // For demo or development purposes, we can simulate publishing for local testing
    // This won't actually send the message to other clients
    this.simulateReceiveMessage(message);
  }
  
  /**
   * Determine which channel to use based on message type
   * @param message The message to determine channel for
   * @returns The target channel name
   */
  private determineTargetChannel(message: Message): string {
    if (message.type.includes('CAPABILITIES')) {
      return `${this.config.channelPrefix}-${this.config.capabilitiesChannel || DEFAULT_CHANNELS.capabilities}`;
    } else if (message.type.includes('FUNCTION_CALL') || 
               message.type.includes('UPDATE_COMPONENT') || 
               message.type.includes('CALL_COMPONENT_ACTION') ||
               message.type.includes('QUERY_CAPABILITIES')) {
      return `${this.config.channelPrefix}-${this.config.commandsChannel || DEFAULT_CHANNELS.commands}`;
    } else {
      return `${this.config.channelPrefix}-${this.config.responsesChannel || DEFAULT_CHANNELS.responses}`;
    }
  }
  
  /**
   * Simulate receiving a message (for local testing only)
   * @param message The message to simulate receiving
   */
  private simulateReceiveMessage(message: Message): void {
    // Only call the handler if we're connected and have a handler
    if (this.connected && this.messageHandler) {
      setTimeout(() => {
        if (this.messageHandler) {
          this.messageHandler(message);
        }
      }, 50); // Small delay to simulate network
    }
  }
  
  /**
   * Set a message handler to receive incoming messages
   * @param handler The message handler function
   */
  onMessage(handler: (message: Message) => void): void {
    this.messageHandler = handler;
    
    // If we're already connected, set up the subscribers
    if (this.connected) {
      this.setupSubscribers();
    }
  }
  
  /**
   * Set up subscribers for all channels
   */
  private setupSubscribers(): void {
    if (!this.messageHandler) return;
    
    // Subscribe to all channels
    this.capabilitiesChannel.bind('message', (data: any) => {
      if (this.messageHandler) {
        this.messageHandler(data as Message);
      }
    });
    
    this.commandsChannel.bind('message', (data: any) => {
      if (this.messageHandler) {
        this.messageHandler(data as Message);
      }
    });
    
    this.responsesChannel.bind('message', (data: any) => {
      if (this.messageHandler) {
        this.messageHandler(data as Message);
      }
    });
  }
  
  /**
   * Connect to Pusher and subscribe to channels
   */
  async connect(): Promise<void> {
    if (this.connected) return;
    
    return new Promise((resolve, reject) => {
      // Set up event handler for connect
      const connectionHandler = () => {
        this.connected = true;
        this.setupSubscribers();
        this.pusher.unbind('connected', connectionHandler);
        resolve();
      };
      
      // Set up event handler for error
      const errorHandler = (err: any) => {
        this.pusher.unbind('error', errorHandler);
        reject(new Error(`Failed to connect to Pusher: ${err.message}`));
      };
      
      // Bind event handlers
      this.pusher.bind('connected', connectionHandler);
      this.pusher.bind('error', errorHandler);
      
      // If already connected, resolve immediately
      if (this.pusher.connection.state === 'connected') {
        this.connected = true;
        this.setupSubscribers();
        this.pusher.unbind('connected', connectionHandler);
        this.pusher.unbind('error', errorHandler);
        resolve();
      }
      
      // Set a timeout for connection
      setTimeout(() => {
        if (!this.connected) {
          this.pusher.unbind('connected', connectionHandler);
          this.pusher.unbind('error', errorHandler);
          reject(new Error('Timeout connecting to Pusher'));
        }
      }, 10000); // 10 seconds timeout
    });
  }
  
  /**
   * Disconnect from Pusher
   */
  async disconnect(): Promise<void> {
    if (!this.connected) return;
    
    // Unsubscribe from all channels
    this.pusher.unsubscribe(`${this.config.channelPrefix}-${this.config.capabilitiesChannel || DEFAULT_CHANNELS.capabilities}`);
    this.pusher.unsubscribe(`${this.config.channelPrefix}-${this.config.commandsChannel || DEFAULT_CHANNELS.commands}`);
    this.pusher.unsubscribe(`${this.config.channelPrefix}-${this.config.responsesChannel || DEFAULT_CHANNELS.responses}`);
    
    // Disconnect from Pusher
    this.pusher.disconnect();
    this.connected = false;
  }

  /**
   * Subscribe to a channel
   * @param channel The channel name to subscribe to
   */
  private subscribeToChannel(channel: string): void {
    if (!this.pusher) {
      console.error('Pusher client not initialized');
      return;
    }

    // Subscribe to the channel
    this.pusherChannel = this.pusher.subscribe(channel);
  }
}

/**
 * Initialize AgentBridge with Pusher-based communication
 * @param bridge AgentBridge instance
 * @param config Pusher configuration options
 */
export function initializePusherProvider(
  bridge: AgentBridge,
  config: Omit<PusherCommunicationConfig, 'channelPrefix'> & {
    channelPrefix?: string;
    appId: string;
  }
): PusherCommunicationManager {
  // Create channel prefix if not provided
  const channelPrefix = config.channelPrefix || `agentbridge-${config.appId}`;
  
  // Create communication manager
  const manager = new PusherCommunicationManager({
    ...config,
    channelPrefix
  });
  
  // Set communication manager in AgentBridge
  bridge.setCommunicationManager(manager);
  
  // Connect to Pusher
  manager.connect().catch((err) => {
    console.error('[AgentBridge Pusher] Failed to connect:', err);
  });
  
  return manager;
} 