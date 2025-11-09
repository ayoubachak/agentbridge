/**
 * AgentBridge Custom Server Example
 * 
 * A simple WebSocket server that acts as a bridge between AI agents and the UI.
 * This server:
 * 1. Accepts connections from React/Angular apps (UI side)
 * 2. Accepts connections from AI agents (agent side)
 * 3. Routes messages between them
 */

import { WebSocketServer } from 'ws';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 8080;
const AGENT_PORT = 8081;

// Store connected clients
const uiClients = new Set();
const agentClients = new Set();

// Store capabilities from UI
let registeredCapabilities = {
  functions: [],
  components: [],
  lastUpdated: null
};

/**
 * Create HTTP server for UI clients
 */
const uiServer = http.createServer();
const uiWss = new WebSocketServer({ server: uiServer });

/**
 * Create HTTP server for agent clients
 */
const agentServer = http.createServer();
const agentWss = new WebSocketServer({ server: agentServer });

/**
 * Handle UI client connections
 */
uiWss.on('connection', (ws, req) => {
  console.log('✅ UI client connected');
  uiClients.add(ws);

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('\n📨 Message from UI:', {
        type: message.type,
        id: message.id,
        timestamp: message.timestamp
      });

      // Handle different message types
      switch (message.type) {
        case 'register_capabilities':
          // Replace all capabilities (full sync)
          registeredCapabilities = {
            functions: message.functions || [],
            components: message.components || [],
            lastUpdated: new Date().toISOString()
          };
          
          console.log('\n📋 Registered Capabilities (Full Sync):');
          console.log(`   Functions: ${registeredCapabilities.functions.length}`);
          registeredCapabilities.functions.forEach(fn => {
            console.log(`     - ${fn.name}: ${fn.description}`);
          });
          console.log(`   Components: ${registeredCapabilities.components.length}`);
          registeredCapabilities.components.forEach(comp => {
            console.log(`     - ${comp.id} (${comp.componentType}): ${comp.description}`);
          });
          
          // Broadcast to all agents
          broadcastToAgents({
            type: 'capabilities_updated',
            capabilities: registeredCapabilities,
            timestamp: new Date().toISOString()
          });
          break;

        case 'update_capabilities':
          // Merge new capabilities with existing ones
          if (message.functions && message.functions.length > 0) {
            message.functions.forEach(fn => {
              const existingIndex = registeredCapabilities.functions.findIndex(
                existing => existing.name === fn.name
              );
              if (existingIndex >= 0) {
                // Update existing function
                registeredCapabilities.functions[existingIndex] = fn;
              } else {
                // Add new function
                registeredCapabilities.functions.push(fn);
              }
            });
          }
          
          if (message.components && message.components.length > 0) {
            message.components.forEach(comp => {
              const existingIndex = registeredCapabilities.components.findIndex(
                existing => existing.id === comp.id
              );
              if (existingIndex >= 0) {
                // Update existing component
                registeredCapabilities.components[existingIndex] = comp;
              } else {
                // Add new component
                registeredCapabilities.components.push(comp);
              }
            });
          }
          
          registeredCapabilities.lastUpdated = new Date().toISOString();
          
          console.log('\n📋 Updated Capabilities (Merged):');
          console.log(`   Functions: ${registeredCapabilities.functions.length}`);
          registeredCapabilities.functions.forEach(fn => {
            console.log(`     - ${fn.name}: ${fn.description}`);
          });
          console.log(`   Components: ${registeredCapabilities.components.length}`);
          registeredCapabilities.components.forEach(comp => {
            console.log(`     - ${comp.id} (${comp.componentType}): ${comp.description}`);
          });
          
          // Broadcast to all agents
          broadcastToAgents({
            type: 'capabilities_updated',
            capabilities: registeredCapabilities,
            timestamp: new Date().toISOString()
          });
          break;

        case 'function_result':
        case 'component_update_result':
        case 'component_action_result':
          // Forward result to agents
          broadcastToAgents(message);
          console.log(`   ✅ Forwarded ${message.type} to agents`);
          break;
        
        case 'error':
          // Forward errors to agents
          broadcastToAgents(message);
          console.log(`   ⚠️ Forwarded error to agents`);
          break;

        default:
          console.log(`   ⚠️ Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('❌ Error handling UI message:', error);
    }
  });

  ws.on('close', () => {
    console.log('❌ UI client disconnected');
    uiClients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('❌ UI WebSocket error:', error);
  });

  // Send initial connection acknowledgment
  ws.send(JSON.stringify({
    type: 'connection_ack',
    message: 'Connected to AgentBridge server',
    timestamp: new Date().toISOString()
  }));
});

/**
 * Handle agent client connections
 */
agentWss.on('connection', (ws, req) => {
  console.log('✅ Agent client connected');
  agentClients.add(ws);

  // Send current capabilities immediately
  if (registeredCapabilities.lastUpdated) {
    ws.send(JSON.stringify({
      type: 'capabilities_updated',
      capabilities: registeredCapabilities,
      timestamp: new Date().toISOString()
    }));
  }

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('\n📨 Message from Agent:', {
        type: message.type,
        id: message.id
      });

      // Handle different message types
      switch (message.type) {
        case 'query_capabilities':
          // Send current capabilities
          ws.send(JSON.stringify({
            type: 'capabilities_result',
            id: message.id,
            correlationId: message.id,
            functions: registeredCapabilities.functions,
            components: registeredCapabilities.components,
            timestamp: new Date().toISOString()
          }));
          console.log('   ✅ Sent capabilities to agent');
          break;

        case 'call_function':
        case 'update_component':
        case 'call_component_action':
          // Forward to UI
          broadcastToUI(message);
          console.log(`   ✅ Forwarded ${message.type} to UI`);
          break;

        default:
          console.log(`   ⚠️ Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('❌ Error handling agent message:', error);
    }
  });

  ws.on('close', () => {
    console.log('❌ Agent client disconnected');
    agentClients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('❌ Agent WebSocket error:', error);
  });
});

/**
 * Broadcast message to all UI clients
 */
function broadcastToUI(message) {
  const messageStr = JSON.stringify(message);
  uiClients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(messageStr);
    }
  });
}

/**
 * Broadcast message to all agent clients
 */
function broadcastToAgents(message) {
  const messageStr = JSON.stringify(message);
  agentClients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(messageStr);
    }
  });
}

/**
 * Start servers
 */
uiServer.listen(PORT, () => {
  console.log('\n🚀 AgentBridge Custom Server Started');
  console.log('=====================================');
  console.log(`📱 UI WebSocket Server: ws://localhost:${PORT}`);
  console.log(`🤖 Agent WebSocket Server: ws://localhost:${AGENT_PORT}`);
  console.log('=====================================\n');
  console.log('Waiting for connections...\n');
});

agentServer.listen(AGENT_PORT, () => {
  console.log(`✅ Agent server listening on port ${AGENT_PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down servers...');
  uiWss.close();
  agentWss.close();
  uiServer.close();
  agentServer.close();
  process.exit(0);
});
