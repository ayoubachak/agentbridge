# Communication Modes

AgentBridge offers two distinct communication modes to accommodate different application architectures and requirements. This guide explains each mode, helping you choose the right one for your application.

## Overview

The communication mode determines how AI agents communicate with your application through AgentBridge. The two available modes are:

1. **Pub/Sub Mode**: Uses third-party real-time messaging services (like Ably, Firebase, etc.)
2. **Self-Hosted Mode**: Uses WebSockets with your own backend server

## Pub/Sub Mode

![Pub/Sub Architecture](../assets/images/pubsub-architecture.png)

### How It Works

1. Your frontend application initializes AgentBridge with a Pub/Sub provider
2. AgentBridge connects to the Pub/Sub service (e.g., Ably) and creates/subscribes to channels
3. Your frontend registers components and functions with AgentBridge
4. AgentBridge publishes these capabilities to the Pub/Sub service
5. AI agents connect to the same Pub/Sub service using the same channel names
6. AI agents discover capabilities by listening to the capabilities channel
7. AI agents send commands (function calls, component updates) through the commands channel
8. Your frontend app receives these commands and executes them
9. Results are published back to the responses channel

### When to Use Pub/Sub Mode

✅ **Ideal for**:
- Frontend-only applications without a backend
- Static websites (e.g., hosted on Netlify, Vercel, GitHub Pages)
- Quick prototyping and rapid development
- Applications that want to avoid managing server infrastructure
- Projects with tight deadlines where setting up a backend would be time-consuming

❌ **Not ideal for**:
- Applications with strict security requirements (though you can implement authentication)
- Applications that need fine-grained control over the communication layer
- Applications that already have a backend infrastructure

### Supported Providers

AgentBridge currently supports the following Pub/Sub providers:

#### Ably

[Ably](https://ably.com/) offers a robust real-time messaging platform with features like presence, history, and guaranteed message delivery.

**Pros**:
- Generous free tier (3M messages/month)
- Reliable message delivery with ordering guarantees
- Message history capability

**Setup**:
```bash
npm install @agentbridge/provider-ably ably
```

#### Firebase Realtime Database

[Firebase Realtime Database](https://firebase.google.com/docs/database) is Google's real-time NoSQL database that allows for synchronized data across clients.

**Pros**:
- Integrates well with other Firebase services
- Strong authentication options
- Familiar to many developers

**Setup**:
```bash
npm install @agentbridge/pubsub-firebase firebase
```

#### Pusher

[Pusher](https://pusher.com/) is a popular hosted service for adding real-time functionality to web and mobile applications.

**Pros**:
- Simple API
- Good dashboard monitoring
- Widely used in production applications

**Setup**:
```bash
npm install @agentbridge/pubsub-pusher pusher-js
```

#### Supabase Realtime

[Supabase Realtime](https://supabase.io/docs/guides/realtime) is an open-source alternative to Firebase, offering real-time capabilities.

**Pros**:
- Open-source alternative to Firebase
- PostgreSQL-backed (if using other Supabase features)
- Self-hostable or hosted service options

**Setup**:
```bash
npm install @agentbridge/pubsub-supabase @supabase/supabase-js
```

### Custom Pub/Sub Provider

If you need to use a different Pub/Sub provider, you can implement your own by following our [custom provider guide](../advanced/custom-pubsub.md).

## Self-Hosted Mode

![Self-Hosted Architecture](../assets/images/self-hosted-architecture.png)

### How It Works

1. You set up a backend server with WebSocket support
2. Your frontend application initializes AgentBridge with the WebSocket provider
3. AgentBridge establishes a WebSocket connection to your backend server
4. Your frontend registers components and functions with AgentBridge
5. AgentBridge sends these capabilities to your backend through the WebSocket
6. AI agents connect to your backend server through a REST API or another WebSocket
7. Your backend relays AI agent commands to the appropriate frontend instance
8. Your frontend executes the commands and sends results back through the WebSocket
9. Your backend relays the results back to the AI agent

### When to Use Self-Hosted Mode

✅ **Ideal for**:
- Applications that already have a backend
- Applications with strict security requirements
- Applications that need to maintain control over all data and communication
- Enterprise applications where data privacy is critical
- Applications that need integration with existing backend services
- Production applications that need custom scaling and monitoring

❌ **Not ideal for**:
- Simple applications without a backend
- Quick prototypes or MVPs
- Applications with tight deadlines where setting up backend infrastructure would be time-consuming

### Setting Up a WebSocket Server

For the Self-Hosted mode, you'll need to set up a WebSocket server. Here are some examples using popular backend frameworks:

#### Node.js with Express and ws

```javascript
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { AgentBridgeServer } = require('@agentbridge/server');

// Create Express app
const app = express();
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Create AgentBridge server
const agentBridgeServer = new AgentBridgeServer();

// Set up WebSocket connection handler
wss.on('connection', (ws) => {
  // Handle new connection
  const clientId = generateClientId(); // Implement this function
  
  // Register client with AgentBridge server
  agentBridgeServer.registerClient(clientId, {
    send: (message) => {
      ws.send(JSON.stringify(message));
    }
  });
  
  // Handle messages from client
  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      agentBridgeServer.handleMessage(clientId, parsedMessage);
    } catch (err) {
      console.error('Error handling message:', err);
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    agentBridgeServer.unregisterClient(clientId);
  });
});

// AI agent API endpoints
app.post('/api/agent/capabilities', (req, res) => {
  const capabilities = agentBridgeServer.getCapabilities();
  res.json(capabilities);
});

app.post('/api/agent/execute', (req, res) => {
  const { clientId, action, params } = req.body;
  
  agentBridgeServer.executeAction(clientId, action, params)
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

For other backend frameworks (Python with FastAPI, Ruby on Rails, etc.), please refer to our [server implementations guide](../advanced/server-implementations.md).

## Choosing the Right Mode

| Consideration | Pub/Sub Mode | Self-Hosted Mode |
|---------------|--------------|------------------|
| **Ease of Setup** | Simpler - Just API keys | More complex - Requires server setup |
| **Backend Required** | No | Yes |
| **Security Control** | Limited to provider options | Full control |
| **Scalability** | Handled by provider | Custom implementation required |
| **Cost** | Provider pricing (often has free tier) | Server hosting costs |
| **Development Speed** | Faster to implement | More setup time required |
| **Infrastructure Control** | Minimal | Complete |
| **Privacy** | Data passes through third party | Data stays within your infrastructure |

## Switching Between Modes

You can switch between communication modes without changing your component and function registration code. Only the initialization code needs to be updated.

### From Pub/Sub to Self-Hosted

1. Set up your WebSocket server
2. Update your AgentBridge initialization code to use the WebSocket provider
3. Remove the Pub/Sub initialization code

### From Self-Hosted to Pub/Sub

1. Register with your chosen Pub/Sub provider
2. Update your AgentBridge initialization code to use the Pub/Sub provider
3. Remove the WebSocket initialization code

## Next Steps

- [Pub/Sub Configuration](../core/pubsub-config.md): Detailed configuration for Pub/Sub providers
- [WebSocket Configuration](../core/websocket-config.md): Detailed configuration for self-hosted WebSockets
- [Security Best Practices](../advanced/security.md): Securing your AgentBridge implementation 