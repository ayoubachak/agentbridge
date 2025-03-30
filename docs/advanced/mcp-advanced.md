# Advanced Model Context Protocol Usage

This guide covers advanced topics for working with Model Context Protocols (MCPs) in AgentBridge.

## Context Preservation

When working with MCPs, maintaining context across multiple interactions is crucial for a coherent agent experience.

### Session Context

```typescript
// JavaScript/TypeScript
const sessionContext = {
  userId: 'user-123',
  sessionStartTime: Date.now(),
  preferences: {
    language: 'en-US',
    theme: 'dark'
  }
};

// Register session context with the MCP manager
agentBridge.mcpManager.setGlobalContext(sessionContext);

// The context will be automatically included in function schemas and calls
```

```dart
// Flutter
final sessionContext = {
  'userId': 'user-123',
  'sessionStartTime': DateTime.now().millisecondsSinceEpoch,
  'preferences': {
    'language': 'en-US',
    'theme': 'dark'
  }
};

// Register session context with the MCP manager
agentBridge.mcpManager.setGlobalContext(sessionContext);
```

## Function Namespacing

Organize your functions into logical groups to make them more discoverable to AI agents.

```typescript
// JavaScript/TypeScript
agentBridge.registerFunction({
  name: 'ui.showNotification',
  description: 'Display a notification to the user',
  parameters: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        description: 'Message to display'
      },
      type: {
        type: 'string',
        enum: ['info', 'success', 'warning', 'error'],
        description: 'Type of notification'
      }
    },
    required: ['message']
  },
  handler: async (params) => {
    // Show notification logic
  }
});
```

## Dynamic Schema Generation

You can dynamically generate function schemas based on application state:

```typescript
// Generate schemas based on available features
function generateFunctionSchemas() {
  const schemas = [];
  
  // Core functions always available
  schemas.push({
    name: 'core.getStatus',
    description: 'Get application status',
    parameters: {/* ... */}
  });
  
  // Add payment functions only if payment module is enabled
  if (appConfig.modules.payment.enabled) {
    schemas.push({
      name: 'payment.processPayment',
      description: 'Process a payment',
      parameters: {/* ... */}
    });
  }
  
  return schemas;
}

// Register all dynamic functions
const schemas = generateFunctionSchemas();
schemas.forEach(schema => {
  agentBridge.registerFunction({
    ...schema,
    handler: functionHandlers[schema.name]
  });
});
```

## Function Result Formatting

Format function results consistently to improve AI agent understanding:

```typescript
// Standard result format
interface FunctionResult {
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
  };
  metadata?: {
    executionTime: number;
    [key: string]: any;
  };
}

// Example implementation
async function handleFunction(name, params) {
  const startTime = Date.now();
  try {
    const result = await executeFunction(name, params);
    return {
      success: true,
      data: result,
      metadata: {
        executionTime: Date.now() - startTime
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message
      },
      metadata: {
        executionTime: Date.now() - startTime
      }
    };
  }
}
```

## Custom Protocol Mappers

Create custom protocol mappers for specialized AI systems:

```typescript
class EnterpriseAIMCPAdapter implements MCPAdapter {
  constructor(private registry) {}
  
  convertToMCPSchema(functionDef) {
    // Custom enterprise AI format
    return {
      functionId: functionDef.name,
      functionDescription: functionDef.description,
      inputSchema: this._convertParameters(functionDef.parameters),
      accessLevel: functionDef.metadata?.accessLevel || 'standard'
    };
  }
  
  _convertParameters(parameters) {
    // Convert JSON Schema to enterprise format
    // ...
  }
  
  // Implement other required methods
  // ...
}
```

## Testing MCP Integrations

Best practices for testing MCP integrations:

```typescript
// Mock AI model for testing
class MockAIModel {
  constructor(private functions) {}
  
  async process(userInput) {
    // Simple rule-based system to simulate AI calling functions
    if (userInput.includes('weather')) {
      return {
        function_call: {
          name: 'getWeather',
          arguments: JSON.stringify({
            location: 'New York'
          })
        }
      };
    }
    return { content: "I don't know how to help with that." };
  }
}

// Test MCP integration
async function testMCPIntegration() {
  const agentBridge = new AgentBridge();
  
  // Register test functions
  agentBridge.registerFunction({
    name: 'getWeather',
    description: 'Get weather for a location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The location to get weather for'
        }
      },
      required: ['location']
    },
    handler: async (params) => {
      return { temperature: 72, conditions: 'sunny' };
    }
  });
  
  // Get OpenAI schema
  const schema = agentBridge.getMCPSchema('openai');
  
  // Create mock AI
  const mockAI = new MockAIModel(schema.functions);
  
  // Test interaction
  const aiResponse = await mockAI.process('What\'s the weather in New York?');
  
  if (aiResponse.function_call) {
    const result = await agentBridge.handleMCPFunctionCall(
      'openai', 
      aiResponse.function_call
    );
    console.log('Function result:', result);
  }
}
```

For more detailed information, refer to the following guides:
- [Component Registration](component-registration.md)
- [Design Information Collection](design-info.md) 