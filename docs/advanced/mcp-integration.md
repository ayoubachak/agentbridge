# Model Context Protocols Integration Guide

This guide explains how to integrate Model Context Protocols (MCPs) with your AgentBridge application.

## Overview

Model Context Protocols provide standardized ways for AI models to discover and call functions in your application. AgentBridge supports these protocols through adapter components that translate between the framework's internal API and the protocol-specific formats.

## Supported MCP Implementations

AgentBridge supports the following Model Context Protocols:

- OpenAI Function Calling (ChatGPT, GPT-4)
- Anthropic Tool Use (Claude)
- Gemini Tools

## Setup

To set up MCP support in your application, you need to:

1. Install the appropriate adapter packages
2. Register the MCP adapters with AgentBridge
3. Configure your application to expose the appropriate schemas

### Installation

```bash
# For npm/yarn
npm install @agentbridge/mcp-openai @agentbridge/mcp-anthropic @agentbridge/mcp-gemini

# For Flutter
flutter pub add agentbridge_mcp
```

### Basic Setup

```typescript
// JavaScript/TypeScript
import { AgentBridge } from '@agentbridge/core';
import { OpenAIMCPAdapter } from '@agentbridge/mcp-openai';
import { AnthropicMCPAdapter } from '@agentbridge/mcp-anthropic';

const agentBridge = new AgentBridge();

// Register MCP adapters
agentBridge.registerMCPAdapter('openai', new OpenAIMCPAdapter(agentBridge.registry));
agentBridge.registerMCPAdapter('anthropic', new AnthropicMCPAdapter(agentBridge.registry));

// For Flutter
```dart
import 'package:agentbridge/agentbridge.dart';
import 'package:agentbridge_mcp/agentbridge_mcp.dart';

void main() {
  final agentBridge = AgentBridge();
  
  // Register MCP adapters
  agentBridge.registerMCPAdapter('openai', OpenAIMCPAdapter(agentBridge.registry));
  agentBridge.registerMCPAdapter('anthropic', AnthropicMCPAdapter(agentBridge.registry));
  
  runApp(MyApp());
}
```

## Getting Schema for AI Models

To get the function schema in the format required by a specific AI model:

```typescript
// Get schema for OpenAI
const openaiSchema = agentBridge.getMCPSchema('openai');

// Use in API call
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "What's the weather like?" }],
  tools: openaiSchema.functions,
});
```

## Handling Function Calls from AI Models

When an AI model makes a function call through an MCP, you can handle it like this:

```typescript
// For OpenAI
const functionCall = response.choices[0].message.tool_calls[0];

// Process the call through AgentBridge's MCP adapter
const result = await agentBridge.handleMCPFunctionCall('openai', functionCall);

// Send the result back to the AI model
// ...
```

## Design Information Collection

To enable AI agents to understand your UI structure, you need to collect design information:

```typescript
// React example
import { ReactDesignInfoCollector } from '@agentbridge/react';

// In your root component
const App = () => {
  const designCollector = new ReactDesignInfoCollector();
  
  useEffect(() => {
    // Capture component tree after render
    const componentTree = designCollector.captureComponentTree(rootElement);
    
    // Register the design information with AgentBridge
    agentBridge.registerDesignInfo(componentTree);
  }, []);
  
  // ...
}
```

```dart
// Flutter example
import 'package:agentbridge/design_collector.dart';

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final designCollector = FlutterDesignInfoCollector();
  
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // Capture component tree after first frame
      final componentTree = designCollector.captureComponentTree(context);
      
      // Register the design information with AgentBridge
      AgentBridge.instance.registerDesignInfo(componentTree);
    });
  }
  
  // ...
}
```

## Exposing Component Structure to AI Agents

To allow AI agents to discover and interact with UI components:

```typescript
// Register a function to get UI components
agentBridge.registerFunction({
  name: 'getUIComponents',
  description: 'Get information about the UI components in the application',
  parameters: {},
  handler: async () => {
    // Return the component tree
    return agentBridge.getComponentTree();
  }
});

// Register a function to interact with a component
agentBridge.registerFunction({
  name: 'interactWithComponent',
  description: 'Interact with a UI component by ID',
  parameters: {
    type: 'object',
    properties: {
      componentId: { 
        type: 'string',
        description: 'ID of the component to interact with'
      },
      action: {
        type: 'string',
        description: 'Action to perform (click, input, etc.)'
      },
      value: {
        type: 'any',
        description: 'Value to set (for input components)'
      }
    },
    required: ['componentId', 'action']
  },
  handler: async (params) => {
    // Handle the interaction
    return agentBridge.interactWithComponent(params.componentId, params.action, params.value);
  }
});
```

## Custom MCP Adapters

You can create custom MCP adapters for other AI platforms:

```typescript
import { MCPAdapter } from '@agentbridge/core';

class CustomMCPAdapter implements MCPAdapter {
  constructor(private registry) {}
  
  convertToMCPSchema(functionDef) {
    // Convert function definition to your custom schema
    return {
      // Your custom schema
    };
  }
  
  convertFromMCPCall(mcpCall) {
    // Convert from your custom call format to AgentBridge format
    return {
      name: mcpCall.functionName,
      params: mcpCall.args,
      context: this.mapContext(mcpCall.context)
    };
  }
  
  mapContext(context) {
    // Map context
    return {
      // Mapped context
    };
  }
  
  mapResponse(response) {
    // Map response
    return {
      // Mapped response
    };
  }
  
  getFunctionSchema() {
    // Return complete schema for all functions
    return {
      // Your custom schema
    };
  }
}

// Register the custom adapter
agentBridge.registerMCPAdapter('custom', new CustomMCPAdapter(agentBridge.registry));
```

## Best Practices

1. **Schema Documentation**: Ensure your function descriptions and parameter descriptions are clear and detailed
2. **Type Safety**: Use specific types rather than "any" for better documentation in MCP schemas
3. **Context Handling**: Maintain consistent context across function calls for better agent interactions
4. **Design Information**: Regularly update design information when the UI changes
5. **Error Handling**: Provide meaningful error responses that agents can understand and adapt to

## Troubleshooting

### Common Issues

- **Schema Conversion Errors**: Check that your function parameters follow the type system supported by the MCP
- **Missing Design Information**: Ensure design collection is triggered after component rendering
- **Function Not Found**: Verify that functions are registered before generating MCP schemas
- **Context Mapping Failures**: Check that context objects contain all required fields

## Next Steps

- Explore advanced MCP features in our [MCP Advanced Guide](./mcp-advanced.md)
- Learn about [UI Component Registration](./component-registration.md)
- See [Design Information Collection](./design-info.md) for more details on capturing UI structure 