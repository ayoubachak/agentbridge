import * as Ably from 'ably';
import { 
  AgentBridge, 
  CommunicationManager, 
  Message 
} from '@agentbridge/core';

/**
 * Configuration options for the Ably communication provider
 */
export interface AblyCommunicationConfig {
  /** Ably API key (required if clientOptions not provided) */
  apiKey?: string;
  /** Ably client options (alternative to using apiKey) */
  clientOptions?: Ably.Types.ClientOptions;
  /** Custom Ably client (optional, for testing or custom setups) */
  client?: Ably.Realtime;
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
 * Implements the CommunicationManager interface using Ably as the transport
 */
export class AblyCommunicationManager implements CommunicationManager {
  private client: Ably.Realtime;
  private capabilitiesChannel: any; // Use 'any' to avoid type issues
  private commandsChannel: any;
  private responsesChannel: any;
  private messageHandler: ((message: Message) => void) | null = null;
  private connected = false;
  private config: AblyCommunicationConfig;
  
  /**
   * Create a new Ably communication manager
   * @param config Configuration options
   */
  constructor(config: AblyCommunicationConfig) {
    this.config = config;
    
    // Create Ably client
    if (config.client) {
      this.client = config.client;
    } else if (config.clientOptions) {
      this.client = new Ably.Realtime(config.clientOptions);
    } else if (config.apiKey) {
      this.client = new Ably.Realtime({ key: config.apiKey });
    } else {
      throw new Error('Either client, clientOptions, or apiKey must be provided');
    }
    
    // Prepare channel names
    const capabilitiesChannel = config.capabilitiesChannel || DEFAULT_CHANNELS.capabilities;
    const commandsChannel = config.commandsChannel || DEFAULT_CHANNELS.commands;
    const responsesChannel = config.responsesChannel || DEFAULT_CHANNELS.responses;
    
    // Initialize channels
    this.capabilitiesChannel = this.client.channels.get(
      `${config.channelPrefix}/${capabilitiesChannel}`
    );
    this.commandsChannel = this.client.channels.get(
      `${config.channelPrefix}/${commandsChannel}`
    );
    this.responsesChannel = this.client.channels.get(
      `${config.channelPrefix}/${responsesChannel}`
    );
  }
  
  /**
   * Send a message
   * @param message The message to send
   */
  sendMessage(message: Message): void {
    if (!this.connected) {
      console.warn('[AgentBridge Ably] Attempting to send message while disconnected');
      return;
    }
    
    // Determine which channel to use based on message type
    let channel: any;
    
    if (message.type.includes('CAPABILITIES')) {
      channel = this.capabilitiesChannel;
    } else if (message.type.includes('FUNCTION_CALL') || 
               message.type.includes('UPDATE_COMPONENT') || 
               message.type.includes('CALL_COMPONENT_ACTION') ||
               message.type.includes('QUERY_CAPABILITIES')) {
      channel = this.commandsChannel;
    } else {
      channel = this.responsesChannel;
    }
    
    // Publish the message
    channel.publish('message', message);
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
    this.capabilitiesChannel.subscribe('message', (message: any) => {
      if (this.messageHandler) {
        this.messageHandler(message.data as Message);
      }
    });
    
    this.commandsChannel.subscribe('message', (message: any) => {
      if (this.messageHandler) {
        this.messageHandler(message.data as Message);
      }
    });
    
    this.responsesChannel.subscribe('message', (message: any) => {
      if (this.messageHandler) {
        this.messageHandler(message.data as Message);
      }
    });
  }
  
  /**
   * Connect to Ably and subscribe to channels
   */
  async connect(): Promise<void> {
    if (this.connected) return;
    
    // Connect to Ably
    return new Promise((resolve, reject) => {
      const connectionHandler = () => {
        this.connected = true;
        this.setupSubscribers();
        resolve();
      };
      
      const errorHandler = (error: any) => {
        reject(new Error(`Failed to connect to Ably: ${error.message || 'Unknown error'}`));
      };
      
      this.client.connection.once('connected', connectionHandler);
      this.client.connection.once('failed', errorHandler);
      
      // If already connected, resolve immediately
      if (this.client.connection.state === 'connected') {
        this.connected = true;
        this.setupSubscribers();
        this.client.connection.off('connected', connectionHandler);
        this.client.connection.off('failed', errorHandler);
        resolve();
      }
    });
  }
  
  /**
   * Disconnect from Ably
   */
  async disconnect(): Promise<void> {
    if (!this.connected) return;
    
    // Unsubscribe from all channels
    this.capabilitiesChannel.unsubscribe();
    this.commandsChannel.unsubscribe();
    this.responsesChannel.unsubscribe();
    
    // Close the Ably connection
    return new Promise((resolve) => {
      this.client.connection.once('closed', () => {
        this.connected = false;
        resolve();
      });
      
      this.client.close();
      
      // If already closed, resolve immediately
      if (this.client.connection.state === 'closed') {
        this.connected = false;
        resolve();
      }
    });
  }
}

/**
 * Initialize AgentBridge with Ably-based communication
 * @param bridge AgentBridge instance
 * @param config Ably configuration options
 */
export function initializeAblyProvider(
  bridge: AgentBridge,
  config: Omit<AblyCommunicationConfig, 'channelPrefix'> & {
    channelPrefix?: string;
    appId: string;
  }
): AblyCommunicationManager {
  // Create channel prefix if not provided
  const channelPrefix = config.channelPrefix || `agentbridge-${config.appId}`;
  
  // Create communication manager
  const manager = new AblyCommunicationManager({
    ...config,
    channelPrefix
  });
  
  // Set communication manager in AgentBridge
  bridge.setCommunicationManager(manager);
  
  // Connect to Ably
  manager.connect().catch((err) => {
    console.error('[AgentBridge Ably] Failed to connect:', err);
  });
  
  return manager;
} 