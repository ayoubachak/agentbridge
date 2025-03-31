/**
 * Simple WebSocket server for AgentBridge in self-hosted mode
 * 
 * This server acts as the communication layer between AI agents and the Angular app.
 * It forwards messages between them and maintains connection state.
 */

const WebSocket = require('ws');
const http = require('http');
const { v4: uuidv4 } = require('uuid');

// Configuration
const PORT = process.env.PORT || 3001;
const PING_INTERVAL = 30000; // 30 seconds

// Create HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('AgentBridge WebSocket Server is running');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Map();
let appClient = null;

// Handle new connection
wss.on('connection', (ws) => {
  const clientId = uuidv4();
  const isAgent = appClient !== null; // First connection is assumed to be the app, others are agents
  
  // Set up the client
  const client = {
    id: clientId,
    ws,
    isAgent,
    isAlive: true,
    lastMessageTime: Date.now()
  };
  
  // Add client to the map
  clients.set(clientId, client);
  
  // If this is the app client, store a reference
  if (!isAgent) {
    appClient = client;
    console.log(`App connected (ID: ${clientId})`);
  } else {
    console.log(`Agent connected (ID: ${clientId})`);
  }
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection',
    clientId,
    isAgent,
    message: `Connected to AgentBridge WebSocket Server. You are ${isAgent ? 'an agent' : 'the app'}.`
  }));
  
  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      let parsedMessage;
      
      try {
        parsedMessage = JSON.parse(message);
      } catch (e) {
        console.error('Invalid JSON message:', message.toString());
        return;
      }
      
      // Update last message timestamp
      client.lastMessageTime = Date.now();
      
      // Handle ping messages
      if (parsedMessage.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', time: Date.now() }));
        return;
      }
      
      // Log the message
      console.log(`Message from ${isAgent ? 'agent' : 'app'} (${clientId}):`, parsedMessage);
      
      // Forward message to appropriate recipients
      if (isAgent) {
        // Agent message goes to the app
        if (appClient && appClient.ws.readyState === WebSocket.OPEN) {
          appClient.ws.send(JSON.stringify({
            ...parsedMessage,
            fromAgent: clientId
          }));
        }
      } else {
        // App message goes to all agents
        clients.forEach((c, id) => {
          if (c.isAgent && c.ws.readyState === WebSocket.OPEN) {
            c.ws.send(JSON.stringify({
              ...parsedMessage,
              fromApp: true
            }));
          }
        });
      }
    } catch (err) {
      console.error('Error handling message:', err);
    }
  });
  
  // Handle pong messages to keep connection alive
  ws.on('pong', () => {
    client.isAlive = true;
  });
  
  // Handle client disconnection
  ws.on('close', () => {
    if (isAgent) {
      console.log(`Agent disconnected (ID: ${clientId})`);
    } else {
      console.log(`App disconnected (ID: ${clientId})`);
      appClient = null;
    }
    
    // Remove client from the map
    clients.delete(clientId);
    
    // Notify other clients about disconnection
    if (isAgent && appClient && appClient.ws.readyState === WebSocket.OPEN) {
      appClient.ws.send(JSON.stringify({
        type: 'disconnection',
        clientId,
        message: `Agent (ID: ${clientId}) disconnected`
      }));
    } else if (!isAgent) {
      clients.forEach((c, id) => {
        if (c.isAgent && c.ws.readyState === WebSocket.OPEN) {
          c.ws.send(JSON.stringify({
            type: 'disconnection',
            clientId,
            message: 'App disconnected'
          }));
        }
      });
    }
  });
});

// Periodic ping to keep connections alive
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  });
  
  // Clean up dead connections
  clients.forEach((client, id) => {
    if (!client.isAlive) {
      client.ws.terminate();
      clients.delete(id);
      console.log(`Client ${id} terminated due to inactivity`);
      return;
    }
    
    client.isAlive = false;
  });
}, PING_INTERVAL);

// Stop the ping interval when server closes
wss.on('close', () => {
  clearInterval(interval);
});

// Start the server
server.listen(PORT, () => {
  console.log(`AgentBridge WebSocket Server running on port ${PORT}`);
  console.log(`WebSocket URL: ws://localhost:${PORT}`);
}); 