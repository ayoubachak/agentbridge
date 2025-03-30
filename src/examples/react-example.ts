import { AgentBridge } from '../core/agent-bridge';
import { ReactAdapter } from '../react/adapter';
import { OpenAIMCPAdapter } from '../mcp/openai/adapter';

/**
 * Example of using AgentBridge with React and MCP support
 */
function setupAgentBridgeWithMCP() {
  // Create AgentBridge instance
  const agentBridge = new AgentBridge();
  
  // Create React adapter
  const reactAdapter = new ReactAdapter(agentBridge);
  
  // Initialize with optional MCP support
  if (process.env.USE_MCP === 'true') {
    // Register OpenAI MCP adapter
    const openaiAdapter = new OpenAIMCPAdapter(agentBridge.registry);
    agentBridge.registerMCPAdapter('openai', openaiAdapter);
    
    console.log('MCP support enabled');
    console.log('Supported protocols:', agentBridge.getSupportedMCPProtocols());
  } else {
    console.log('MCP support not enabled');
  }
  
  return { agentBridge, reactAdapter };
}

/**
 * Example of getting OpenAI schema
 */
async function getOpenAISchema(agentBridge: AgentBridge) {
  // Only if MCP support is enabled
  if (agentBridge.hasMCPSupport()) {
    try {
      const schema = agentBridge.getMCPSchema('openai');
      console.log('OpenAI schema:', schema);
      return schema;
    } catch (error) {
      console.error('Error getting OpenAI schema:', error);
    }
  }
  
  return null;
}

/**
 * Example of handling an OpenAI function call
 */
async function handleOpenAIFunctionCall(agentBridge: AgentBridge, functionCall: any) {
  // Only if MCP support is enabled
  if (agentBridge.hasMCPSupport()) {
    try {
      const result = await agentBridge.handleMCPFunctionCall('openai', functionCall);
      console.log('Function call result:', result);
      return result;
    } catch (error) {
      console.error('Error handling function call:', error);
    }
  }
  
  return null;
}

/**
 * Example of React component that uses AgentBridge
 */
function ExampleReactComponent({ agentBridge, reactAdapter }) {
  // In a real React component, this would be JSX
  // This is a simplified representation
  
  // Register this component with AgentBridge
  const ref = reactAdapter.useComponentRegistration('example-component', 'ExampleComponent');
  
  // In the component's render method
  return {
    type: 'div',
    props: {
      id: 'example-component',
      className: 'example-container',
      style: {
        width: 200,
        height: 100,
        position: 'relative',
      },
      children: [
        {
          type: 'button',
          props: {
            id: 'example-button',
            className: 'primary-button',
            onClick: () => {
              console.log('Button clicked');
            },
            children: 'Click me',
          },
        },
      ],
      ref, // Register with AgentBridge
    },
  };
}

/**
 * Export everything for use in other files
 */
export {
  setupAgentBridgeWithMCP,
  getOpenAISchema,
  handleOpenAIFunctionCall,
  ExampleReactComponent,
}; 