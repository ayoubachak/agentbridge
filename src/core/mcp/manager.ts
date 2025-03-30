import { MCPAdapter } from './interfaces';

/**
 * Manages Model Context Protocol adapters and provides methods to interact with them
 */
export class MCPManager {
  private adapters: Map<string, MCPAdapter> = new Map();
  
  /**
   * Register an MCP adapter
   * @param name The name of the protocol (e.g., 'openai', 'anthropic')
   * @param adapter The adapter implementation
   */
  registerAdapter(name: string, adapter: MCPAdapter): void {
    this.adapters.set(name.toLowerCase(), adapter);
  }
  
  /**
   * Get an MCP adapter by name
   * @param name The name of the protocol
   * @returns The adapter for the specified protocol
   * @throws Error if the adapter is not found
   */
  getAdapter(name: string): MCPAdapter {
    const adapter = this.adapters.get(name.toLowerCase());
    if (!adapter) {
      throw new Error(`MCP adapter '${name}' not found`);
    }
    return adapter;
  }
  
  /**
   * Get the schema for all registered functions in the format required by a specific protocol
   * @param protocol The name of the protocol
   * @returns The schema in the protocol's format
   */
  getMCPSchema(protocol: string): any {
    const adapter = this.getAdapter(protocol);
    return adapter.getFunctionSchema();
  }
  
  /**
   * Handle a function call from an MCP
   * @param protocol The name of the protocol
   * @param mcpCall The function call in the protocol's format
   * @returns The result in the protocol's format
   */
  async handleMCPFunctionCall(protocol: string, mcpCall: any, registry: any): Promise<any> {
    const adapter = this.getAdapter(protocol);
    
    // Convert the MCP call to an AgentBridge function call request
    const request = adapter.convertFromMCPCall(mcpCall);
    
    // Execute the function
    // Note: This implementation assumes that the registry provides a method to execute functions
    // The actual implementation will depend on the AgentBridge core structure
    const result = await registry.executeFunction(request.name, request.params, request.context);
    
    // Convert the result back to the MCP format
    return adapter.mapResponse(result);
  }
  
  /**
   * Get a list of supported protocols
   * @returns Array of protocol names
   */
  getSupportedProtocols(): string[] {
    return Array.from(this.adapters.keys());
  }
} 