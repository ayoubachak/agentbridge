import { MCPAdapter } from '../../core/mcp/interfaces';

/**
 * OpenAI function call parameter schema
 */
interface OpenAIParameterSchema {
  type: string;
  description?: string;
  enum?: string[];
  format?: string;
  properties?: Record<string, OpenAIParameterSchema>;
  items?: OpenAIParameterSchema;
  required?: string[];
  minimum?: number;
  maximum?: number;
}

/**
 * OpenAI function definition schema
 */
interface OpenAIFunctionSchema {
  name: string;
  description: string;
  parameters: OpenAIParameterSchema;
}

/**
 * OpenAI function call
 */
interface OpenAIFunctionCall {
  id: string;
  name: string;
  arguments: string; // JSON string of arguments
}

/**
 * OpenAI MCP adapter for AgentBridge
 * Implements conversion between AgentBridge and OpenAI function calling formats
 */
export class OpenAIMCPAdapter implements MCPAdapter {
  constructor(private registry: any) {}
  
  /**
   * Convert an AgentBridge function definition to OpenAI schema
   * @param functionDef AgentBridge function definition
   * @returns OpenAI function schema
   */
  convertToMCPSchema(functionDef: any): OpenAIFunctionSchema {
    return {
      name: functionDef.name,
      description: functionDef.description || '',
      parameters: this.convertTypeToOpenAISchema(functionDef.parameters),
    };
  }
  
  /**
   * Convert an OpenAI function call to AgentBridge format
   * @param mcpCall OpenAI function call
   * @returns AgentBridge function call request
   */
  convertFromMCPCall(mcpCall: OpenAIFunctionCall): any {
    // Parse the arguments from JSON string
    const args = JSON.parse(mcpCall.arguments);
    
    return {
      name: mcpCall.name,
      params: args,
      context: {}, // Context will be filled in by AgentBridge
    };
  }
  
  /**
   * Map AgentBridge context to OpenAI context
   * @param context AgentBridge context
   * @returns OpenAI context
   */
  mapContext(context: any): any {
    // OpenAI doesn't have a specific context format
    // This is a placeholder for future extensions
    return {};
  }
  
  /**
   * Map AgentBridge function result to OpenAI response
   * @param response AgentBridge function result
   * @returns OpenAI response
   */
  mapResponse(response: any): any {
    // Convert to a format that OpenAI can understand
    // For now, just return the response as-is
    return {
      content: JSON.stringify(response),
    };
  }
  
  /**
   * Get the schema for all registered functions in OpenAI format
   * @returns OpenAI tools schema
   */
  getFunctionSchema(): any {
    // Get all registered functions from the registry
    const functions = this.registry.getAllFunctions();
    
    // Convert each function to OpenAI schema
    const openAIFunctions = functions.map(func => this.convertToMCPSchema(func));
    
    // Return in the format expected by OpenAI
    return {
      tools: openAIFunctions.map(func => ({
        type: 'function',
        function: func,
      })),
    };
  }
  
  /**
   * Convert AgentBridge type to OpenAI parameter schema
   * @param type AgentBridge type definition
   * @returns OpenAI parameter schema
   */
  private convertTypeToOpenAISchema(type: any): OpenAIParameterSchema {
    if (!type) {
      return { type: 'object', properties: {} };
    }
    
    switch (type.type) {
      case 'string':
        return {
          type: 'string',
          description: type.description,
          enum: type.enum,
        };
        
      case 'number':
      case 'integer':
        return {
          type: type.type,
          description: type.description,
          minimum: type.min,
          maximum: type.max,
        };
        
      case 'boolean':
        return {
          type: 'boolean',
          description: type.description,
        };
        
      case 'array':
        return {
          type: 'array',
          description: type.description,
          items: type.items ? this.convertTypeToOpenAISchema(type.items) : { type: 'string' },
        };
        
      case 'object':
      default:
        const properties: Record<string, OpenAIParameterSchema> = {};
        const required: string[] = [];
        
        // Convert properties
        if (type.properties) {
          Object.entries(type.properties).forEach(([key, propType]: [string, any]) => {
            properties[key] = this.convertTypeToOpenAISchema(propType);
            
            // Add to required list if necessary
            if (propType.required === true) {
              required.push(key);
            }
          });
        }
        
        // Get required fields from the required array if present
        if (type.required && Array.isArray(type.required)) {
          type.required.forEach((field: string) => {
            if (!required.includes(field)) {
              required.push(field);
            }
          });
        }
        
        return {
          type: 'object',
          description: type.description,
          properties,
          required: required.length > 0 ? required : undefined,
        };
    }
  }
} 