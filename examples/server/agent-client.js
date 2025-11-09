/**
 * Simple Agent Client for Testing
 * 
 * This simulates an AI agent connecting to the AgentBridge server
 * and querying/controlling components from both React and Angular apps
 */

import WebSocket from 'ws';
import readline from 'readline';

const AGENT_SERVER_URL = 'ws://localhost:8081';

let ws = null;
let capabilities = { functions: [], components: [] };

/**
 * Connect to the agent server
 */
function connect() {
  console.log('🤖 Agent Client Starting...\n');
  console.log(`Connecting to: ${AGENT_SERVER_URL}`);
  
  ws = new WebSocket(AGENT_SERVER_URL);

  ws.on('open', () => {
    console.log('✅ Connected to AgentBridge server\n');
    
    // Query capabilities immediately
    queryCapabilities();
    
    // Start interactive mode
    startInteractiveMode();
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleMessage(message);
    } catch (error) {
      console.error('❌ Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('\n❌ Disconnected from server');
    process.exit(0);
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });
}

/**
 * Handle incoming messages
 */
function handleMessage(message) {
  console.log('\n📨 Message received:', message.type);
  
  switch (message.type) {
    case 'capabilities_result':
    case 'capabilities_updated':
      capabilities = {
        functions: message.functions || message.capabilities?.functions || [],
        components: message.components || message.capabilities?.components || []
      };
      
      console.log('\n📋 Available Capabilities:');
      console.log('=========================');
      
      if (capabilities.functions.length > 0) {
        console.log('\n🔧 Functions:');
        capabilities.functions.forEach((fn, index) => {
          console.log(`  ${index + 1}. ${fn.name}`);
          console.log(`     Description: ${fn.description}`);
          console.log(`     Auth Level: ${fn.authLevel || 'public'}`);
          console.log(`     Tags: ${fn.tags?.join(', ') || 'none'}`);
        });
      }
      
      if (capabilities.components.length > 0) {
        console.log('\n🎨 Components:');
        capabilities.components.forEach((comp, index) => {
          console.log(`  ${index + 1}. ${comp.id} (${comp.componentType})`);
          console.log(`     Description: ${comp.description}`);
          if (comp.properties) {
            console.log(`     Properties: ${JSON.stringify(comp.properties)}`);
          }
          if (comp.actions) {
            console.log(`     Actions: ${Object.keys(comp.actions).join(', ')}`);
          }
        });
      }
      
      if (capabilities.functions.length === 0 && capabilities.components.length === 0) {
        console.log('  No capabilities registered yet.');
        console.log('  Make sure the UI app is connected and components are registered.');
      }
      
      console.log('\n');
      break;

    case 'function_result':
      console.log('\n✅ Function Result:');
      console.log(`   Success: ${message.success}`);
      if (message.data) {
        console.log(`   Data: ${JSON.stringify(message.data, null, 2)}`);
      }
      if (message.error) {
        console.log(`   Error: ${JSON.stringify(message.error, null, 2)}`);
      }
      console.log('\n');
      break;

    case 'component_action_result':
      console.log('\n✅ Component Action Result:');
      console.log(`   Success: ${message.success}`);
      if (message.data) {
        console.log(`   Data: ${JSON.stringify(message.data, null, 2)}`);
      }
      if (message.error) {
        console.log(`   Error: ${JSON.stringify(message.error, null, 2)}`);
      }
      console.log('\n');
      break;

    default:
      console.log(`   Message: ${JSON.stringify(message, null, 2)}`);
  }
}

/**
 * Query capabilities from the server
 */
function queryCapabilities() {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.log('❌ Not connected to server');
    return;
  }

  ws.send(JSON.stringify({
    type: 'query_capabilities',
    id: generateId(),
    timestamp: new Date().toISOString()
  }));
}

/**
 * Call a function
 */
function callFunction(name, parameters = {}) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.log('❌ Not connected to server');
    return;
  }

  console.log(`\n🔧 Calling function: ${name}`);
  
  ws.send(JSON.stringify({
    type: 'call_function',
    id: generateId(),
    timestamp: new Date().toISOString(),
    name,
    parameters
  }));
}

/**
 * Call a component action
 */
function callComponentAction(componentId, action, parameters = {}) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.log('❌ Not connected to server');
    return;
  }

  console.log(`\n🎨 Calling component action: ${componentId}.${action}`);
  
  ws.send(JSON.stringify({
    type: 'call_component_action',
    id: generateId(),
    timestamp: new Date().toISOString(),
    id: componentId,
    action,
    parameters
  }));
}

/**
 * Interactive mode
 */
function startInteractiveMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '🤖 > '
  });

  console.log('\n🎮 Interactive Mode');
  console.log('===================');
  console.log('Commands:');
  console.log('  list              - List all capabilities');
  console.log('  increment         - Increment the counter');
  console.log('  decrement         - Decrement the counter');
  console.log('  reset             - Reset the counter');
  console.log('  set <value>       - Set counter to specific value');
  console.log('  click <id>        - Click a button by ID');
  console.log('  help              - Show this help');
  console.log('  exit              - Exit the agent client');
  console.log('\n');

  rl.prompt();

  rl.on('line', (line) => {
    const input = line.trim().toLowerCase();
    const parts = input.split(' ');
    const command = parts[0];

    switch (command) {
      case 'list':
        queryCapabilities();
        break;

      case 'increment':
        callComponentAction('main-counter', 'increment', {});
        break;

      case 'decrement':
        callComponentAction('main-counter', 'decrement', {});
        break;

      case 'reset':
        callComponentAction('main-counter', 'reset', {});
        break;

      case 'set':
        const value = parseInt(parts[1]);
        if (isNaN(value)) {
          console.log('❌ Please provide a valid number');
        } else {
          callComponentAction('main-counter', 'setTo', { value });
        }
        break;

      case 'click':
        const buttonId = parts[1];
        if (!buttonId) {
          console.log('❌ Please provide a button ID');
        } else {
          callComponentAction(buttonId, 'click', {});
        }
        break;

      case 'help':
        console.log('\nAvailable commands:');
        console.log('  list, increment, decrement, reset, set <value>, click <id>, help, exit\n');
        break;

      case 'exit':
        console.log('👋 Goodbye!');
        ws.close();
        process.exit(0);
        break;

      case '':
        // Empty line, just re-prompt
        break;

      default:
        console.log(`❌ Unknown command: ${command}`);
        console.log('Type "help" for available commands\n');
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log('\n👋 Goodbye!');
    process.exit(0);
  });
}

/**
 * Generate a unique ID
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Start the agent client
connect();
