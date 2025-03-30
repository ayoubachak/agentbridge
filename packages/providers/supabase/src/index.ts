import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  AgentBridge, 
  CommunicationManager, 
  Message 
} from '@agentbridge/core';

/**
 * Configuration options for the Supabase communication provider
 */
export interface SupabaseCommunicationConfig {
  /** Supabase URL */
  supabaseUrl: string;
  /** Supabase API key */
  supabaseKey: string;
  /** Custom Supabase client (optional, for testing or custom setups) */
  client?: SupabaseClient;
  /** Channel name prefix (without trailing slash) */
  channelPrefix: string;
  /** Name of the capabilities channel */
  capabilitiesChannel?: string;
  /** Name of the commands channel */
  commandsChannel?: string;
  /** Name of the responses channel */
  responsesChannel?: string;
  /** Table name for storing messages (defaults to 'agent_bridge_messages') */
  tableName?: string;
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
 * Implements the CommunicationManager interface using Supabase Realtime as the transport
 */
export class SupabaseCommunicationManager implements CommunicationManager {
  private client: SupabaseClient;
  private subscriptions: { unsubscribe: () => void }[] = [];
  private messageHandler: ((message: Message) => void) | null = null;
  private connected = false;
  private config: SupabaseCommunicationConfig;
  private tableName: string;
  
  /**
   * Create a new Supabase communication manager
   * @param config Configuration options
   */
  constructor(config: SupabaseCommunicationConfig) {
    this.config = config;
    this.tableName = config.tableName || 'agent_bridge_messages';
    
    // Create Supabase client
    if (config.client) {
      this.client = config.client;
    } else {
      this.client = createClient(config.supabaseUrl, config.supabaseKey);
    }
  }
  
  /**
   * Send a message
   * @param message The message to send
   */
  sendMessage(message: Message): void {
    if (!this.connected) {
      console.warn('[AgentBridge Supabase] Attempting to send message while disconnected');
      return;
    }
    
    // Determine channel based on message type
    let channel: string;
    
    if (message.type.includes('CAPABILITIES')) {
      channel = this.config.capabilitiesChannel || DEFAULT_CHANNELS.capabilities;
    } else if (message.type.includes('FUNCTION_CALL') || 
               message.type.includes('UPDATE_COMPONENT') || 
               message.type.includes('CALL_COMPONENT_ACTION') ||
               message.type.includes('QUERY_CAPABILITIES')) {
      channel = this.config.commandsChannel || DEFAULT_CHANNELS.commands;
    } else {
      channel = this.config.responsesChannel || DEFAULT_CHANNELS.responses;
    }
    
    // Insert the message into the database
    this.client
      .from(this.tableName)
      .insert({
        channel_prefix: this.config.channelPrefix,
        channel,
        message,
        created_at: new Date().toISOString()
      })
      .then((result) => {
        if (result.error) {
          console.error('[AgentBridge Supabase] Error sending message:', result.error);
        }
      })
      .catch((error) => {
        console.error('[AgentBridge Supabase] Error sending message:', error);
      });
  }
  
  /**
   * Set a message handler to receive incoming messages
   * @param handler The message handler function
   */
  onMessage(handler: (message: Message) => void): void {
    this.messageHandler = handler;
    
    // If we're already connected, set up the subscribers
    if (this.connected) {
      this.setupSubscriptions();
    }
  }
  
  /**
   * Set up subscriptions for all channels
   */
  private setupSubscriptions(): void {
    if (!this.messageHandler) return;
    
    // Clean up any existing subscriptions
    this.removeSubscriptions();
    
    // Prepare channel names
    const capabilitiesChannel = this.config.capabilitiesChannel || DEFAULT_CHANNELS.capabilities;
    const commandsChannel = this.config.commandsChannel || DEFAULT_CHANNELS.commands;
    const responsesChannel = this.config.responsesChannel || DEFAULT_CHANNELS.responses;
    
    // Subscribe to realtime changes on the table
    
    // Capabilities channel subscription
    const capabilitiesSub = this.client
      .from(`${this.tableName}:channel_prefix=eq.${this.config.channelPrefix}:channel=eq.${capabilitiesChannel}`)
      .on('INSERT', (payload) => {
        if (this.messageHandler && payload.new && payload.new.message) {
          this.messageHandler(payload.new.message as Message);
        }
      })
      .subscribe();
    
    this.subscriptions.push(capabilitiesSub);
    
    // Commands channel subscription
    const commandsSub = this.client
      .from(`${this.tableName}:channel_prefix=eq.${this.config.channelPrefix}:channel=eq.${commandsChannel}`)
      .on('INSERT', (payload) => {
        if (this.messageHandler && payload.new && payload.new.message) {
          this.messageHandler(payload.new.message as Message);
        }
      })
      .subscribe();
    
    this.subscriptions.push(commandsSub);
    
    // Responses channel subscription
    const responsesSub = this.client
      .from(`${this.tableName}:channel_prefix=eq.${this.config.channelPrefix}:channel=eq.${responsesChannel}`)
      .on('INSERT', (payload) => {
        if (this.messageHandler && payload.new && payload.new.message) {
          this.messageHandler(payload.new.message as Message);
        }
      })
      .subscribe();
    
    this.subscriptions.push(responsesSub);
  }
  
  /**
   * Remove all subscriptions
   */
  private removeSubscriptions(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
    this.subscriptions = [];
  }
  
  /**
   * Connect to Supabase and set up subscriptions
   */
  async connect(): Promise<void> {
    if (this.connected) return;
    
    try {
      // Check database connectivity by querying the table
      const { error } = await this.client
        .from(this.tableName)
        .select('id')
        .limit(1);
      
      // If the table doesn't exist, we need to create it
      if (error && error.code === '42P01') {
        console.warn(`[AgentBridge Supabase] Table '${this.tableName}' not found. Please create it with the following SQL:`);
        console.warn(`
          CREATE TABLE ${this.tableName} (
            id SERIAL PRIMARY KEY,
            channel_prefix TEXT NOT NULL,
            channel TEXT NOT NULL,
            message JSONB NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
          
          CREATE INDEX idx_${this.tableName}_channel_prefix ON ${this.tableName}(channel_prefix);
          CREATE INDEX idx_${this.tableName}_channel ON ${this.tableName}(channel);
          CREATE INDEX idx_${this.tableName}_created_at ON ${this.tableName}(created_at);
        `);
        throw new Error(`Table '${this.tableName}' not found`);
      }
      
      // Set up the subscriptions
      this.setupSubscriptions();
      
      // Set up a scheduled cleanup job to periodically delete old messages
      // This is important to prevent the database from growing indefinitely
      this.scheduleCleanup();
      
      this.connected = true;
    } catch (error) {
      console.error('[AgentBridge Supabase] Connection error:', error);
      throw error;
    }
  }
  
  /**
   * Schedule a periodic cleanup of old messages
   */
  private scheduleCleanup(): void {
    // Clean up messages older than 24 hours every hour
    setInterval(() => {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      this.client
        .from(this.tableName)
        .delete()
        .lt('created_at', oneDayAgo.toISOString())
        .then(({ error }) => {
          if (error) {
            console.error('[AgentBridge Supabase] Error cleaning up old messages:', error);
          }
        });
    }, 60 * 60 * 1000); // 1 hour
  }
  
  /**
   * Disconnect from Supabase
   */
  async disconnect(): Promise<void> {
    if (!this.connected) return;
    
    // Remove all subscriptions
    this.removeSubscriptions();
    
    // Mark as disconnected
    this.connected = false;
  }
}

/**
 * Initialize AgentBridge with Supabase-based communication
 * @param bridge AgentBridge instance
 * @param config Supabase configuration options
 */
export function initializeSupabaseProvider(
  bridge: AgentBridge,
  config: Omit<SupabaseCommunicationConfig, 'channelPrefix'> & {
    channelPrefix?: string;
    appId: string;
  }
): SupabaseCommunicationManager {
  // Create channel prefix if not provided
  const channelPrefix = config.channelPrefix || `agentbridge-${config.appId}`;
  
  // Create communication manager
  const manager = new SupabaseCommunicationManager({
    ...config,
    channelPrefix
  });
  
  // Set communication manager in AgentBridge
  bridge.setCommunicationManager(manager);
  
  // Connect to Supabase
  manager.connect().catch((err) => {
    console.error('[AgentBridge Supabase] Failed to connect:', err);
  });
  
  return manager;
} 