import { 
  AgentBridge, 
  CommunicationManager, 
  Message 
} from '@agentbridge/core';
import firebase from 'firebase/app';
import 'firebase/database';

/**
 * Configuration options for the Firebase communication provider
 */
export interface FirebaseCommunicationConfig {
  /** Firebase configuration object */
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
  };
  /** Custom Firebase app (optional, for testing or custom setups) */
  app?: firebase.app.App;
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
 * Implements the CommunicationManager interface using Firebase Realtime Database as the transport
 */
export class FirebaseCommunicationManager implements CommunicationManager {
  private app: firebase.app.App;
  private database: firebase.database.Database;
  private capabilitiesRef: firebase.database.Reference;
  private commandsRef: firebase.database.Reference;
  private responsesRef: firebase.database.Reference;
  private messageHandler: ((message: Message) => void) | null = null;
  private connected = false;
  private config: FirebaseCommunicationConfig;
  private listeners: (() => void)[] = [];
  
  /**
   * Create a new Firebase communication manager
   * @param config Configuration options
   */
  constructor(config: FirebaseCommunicationConfig) {
    this.config = config;
    
    // Initialize Firebase
    if (config.app) {
      this.app = config.app;
    } else {
      // Check if Firebase is already initialized
      if (firebase.apps.length === 0) {
        this.app = firebase.initializeApp(config.firebaseConfig);
      } else {
        this.app = firebase.app();
      }
    }
    
    this.database = this.app.database();
    
    // Prepare channel names
    const capabilitiesChannel = config.capabilitiesChannel || DEFAULT_CHANNELS.capabilities;
    const commandsChannel = config.commandsChannel || DEFAULT_CHANNELS.commands;
    const responsesChannel = config.responsesChannel || DEFAULT_CHANNELS.responses;
    
    // Initialize references
    this.capabilitiesRef = this.database.ref(`${config.channelPrefix}/${capabilitiesChannel}`);
    this.commandsRef = this.database.ref(`${config.channelPrefix}/${commandsChannel}`);
    this.responsesRef = this.database.ref(`${config.channelPrefix}/${responsesChannel}`);
  }
  
  /**
   * Send a message
   * @param message The message to send
   */
  sendMessage(message: Message): void {
    if (!this.connected) {
      console.warn('[AgentBridge Firebase] Attempting to send message while disconnected');
      return;
    }
    
    // Determine which reference to use based on message type
    let ref: firebase.database.Reference;
    
    if (message.type.includes('CAPABILITIES')) {
      ref = this.capabilitiesRef;
    } else if (message.type.includes('FUNCTION_CALL') || 
               message.type.includes('UPDATE_COMPONENT') || 
               message.type.includes('CALL_COMPONENT_ACTION') ||
               message.type.includes('QUERY_CAPABILITIES')) {
      ref = this.commandsRef;
    } else {
      ref = this.responsesRef;
    }
    
    // Generate a unique key for the message
    const newMessageRef = ref.push();
    
    // Save the message
    newMessageRef.set({
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      data: message
    });
    
    // Set up automatic cleanup for messages after 1 hour
    // This prevents the database from growing indefinitely
    newMessageRef.onDisconnect().remove();
  }
  
  /**
   * Set a message handler to receive incoming messages
   * @param handler The message handler function
   */
  onMessage(handler: (message: Message) => void): void {
    this.messageHandler = handler;
    
    // If we're already connected, set up the listeners
    if (this.connected) {
      this.setupListeners();
    }
  }
  
  /**
   * Set up listeners for all channels
   */
  private setupListeners(): void {
    if (!this.messageHandler) return;
    
    // Clean up any existing listeners
    this.removeListeners();
    
    // Listen for capabilities messages
    this.capabilitiesRef.limitToLast(50).on('child_added', (snapshot) => {
      const value = snapshot.val();
      if (value && value.data && this.messageHandler) {
        this.messageHandler(value.data as Message);
      }
    }, (error) => {
      console.error('[AgentBridge Firebase] Error listening to capabilities channel:', error);
    });
    
    // Store the callback to remove the listener later
    this.listeners.push(() => {
      this.capabilitiesRef.off('child_added');
    });
    
    // Listen for commands messages
    this.commandsRef.limitToLast(50).on('child_added', (snapshot) => {
      const value = snapshot.val();
      if (value && value.data && this.messageHandler) {
        this.messageHandler(value.data as Message);
      }
    }, (error) => {
      console.error('[AgentBridge Firebase] Error listening to commands channel:', error);
    });
    
    // Store the callback to remove the listener later
    this.listeners.push(() => {
      this.commandsRef.off('child_added');
    });
    
    // Listen for responses messages
    this.responsesRef.limitToLast(50).on('child_added', (snapshot) => {
      const value = snapshot.val();
      if (value && value.data && this.messageHandler) {
        this.messageHandler(value.data as Message);
      }
    }, (error) => {
      console.error('[AgentBridge Firebase] Error listening to responses channel:', error);
    });
    
    // Store the callback to remove the listener later
    this.listeners.push(() => {
      this.responsesRef.off('child_added');
    });
  }
  
  /**
   * Remove all listeners
   */
  private removeListeners(): void {
    // Call all listener removal callbacks
    for (const removeListener of this.listeners) {
      removeListener();
    }
    
    // Clear the listeners array
    this.listeners = [];
  }
  
  /**
   * Connect to Firebase and set up listeners
   */
  async connect(): Promise<void> {
    if (this.connected) return;
    
    return new Promise((resolve, reject) => {
      // Check connection status
      const connectedRef = this.database.ref('.info/connected');
      
      connectedRef.on('value', (snap) => {
        if (snap.val() === true) {
          this.connected = true;
          
          // Set up listeners for messages
          this.setupListeners();
          
          // Store callback to remove the listener
          this.listeners.push(() => {
            connectedRef.off('value');
          });
          
          resolve();
        }
      }, (error) => {
        reject(new Error(`Failed to connect to Firebase: ${error.message}`));
      });
      
      // Set a timeout for connection
      setTimeout(() => {
        if (!this.connected) {
          reject(new Error('Timeout connecting to Firebase'));
        }
      }, 10000); // 10 seconds timeout
    });
  }
  
  /**
   * Disconnect from Firebase
   */
  async disconnect(): Promise<void> {
    if (!this.connected) return;
    
    // Remove all listeners
    this.removeListeners();
    
    // Mark as disconnected
    this.connected = false;
    
    // Note: We don't actually close the Firebase connection here
    // because Firebase manages its own connection state.
    // However, we've removed all listeners so we won't receive any more events.
  }
}

/**
 * Initialize AgentBridge with Firebase-based communication
 * @param bridge AgentBridge instance
 * @param config Firebase configuration options
 */
export function initializeFirebaseProvider(
  bridge: AgentBridge,
  config: Omit<FirebaseCommunicationConfig, 'channelPrefix'> & {
    channelPrefix?: string;
    appId: string;
  }
): FirebaseCommunicationManager {
  // Create channel prefix if not provided
  const channelPrefix = config.channelPrefix || `agentbridge-${config.appId}`;
  
  // Create communication manager
  const manager = new FirebaseCommunicationManager({
    ...config,
    channelPrefix
  });
  
  // Set communication manager in AgentBridge
  bridge.setCommunicationManager(manager);
  
  // Connect to Firebase
  manager.connect().catch((err) => {
    console.error('[AgentBridge Firebase] Failed to connect:', err);
  });
  
  return manager;
} 