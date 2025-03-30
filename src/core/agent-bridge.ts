import { MCPAdapter } from './mcp/interfaces';
import { ComponentTree } from './mcp/interfaces';
import { MCPManager } from './mcp/manager';

/**
 * Main AgentBridge class with optional MCP support
 * Note: This is a simplified version for demonstration purposes
 */
export class AgentBridge {
  // Existing properties would be here in a real implementation
  private registry: any; // Registry would be properly typed in real implementation
  private mcpManager: MCPManager | null = null;
  private designInfo: ComponentTree | null = null;
  
  constructor() {
    // Initialize existing components
    this.registry = {}; // Mock registry
    
    // Initialize MCP support (but keep it optional)
    this.initializeMCP();
  }
  
  /**
   * Initialize MCP support if needed
   * This is separated to keep it optional
   */
  private initializeMCP(): void {
    // Only initialize if MCP support is needed
    this.mcpManager = new MCPManager();
  }
  
  /**
   * Register an MCP adapter
   * This method is optional and only available if MCP support is enabled
   * @param name Protocol name
   * @param adapter The MCP adapter
   */
  registerMCPAdapter(name: string, adapter: MCPAdapter): void {
    if (!this.mcpManager) {
      this.initializeMCP();
    }
    
    this.mcpManager?.registerAdapter(name, adapter);
  }
  
  /**
   * Get the schema for registered functions in the format required by a specific MCP
   * @param protocol The protocol name
   * @returns The schema in the protocol's format
   */
  getMCPSchema(protocol: string): any {
    if (!this.mcpManager) {
      throw new Error('MCP support not enabled');
    }
    
    return this.mcpManager.getMCPSchema(protocol);
  }
  
  /**
   * Handle a function call from an MCP
   * @param protocol The protocol name
   * @param call The function call in the protocol's format
   * @returns The result in the protocol's format
   */
  async handleMCPFunctionCall(protocol: string, call: any): Promise<any> {
    if (!this.mcpManager) {
      throw new Error('MCP support not enabled');
    }
    
    return this.mcpManager.handleMCPFunctionCall(protocol, call, this.registry);
  }
  
  /**
   * Register design information for UI components
   * @param componentTree The component tree with design information
   */
  registerDesignInfo(componentTree: ComponentTree): void {
    this.designInfo = componentTree;
  }
  
  /**
   * Get the component tree with design information
   * @returns The component tree
   */
  getComponentTree(): ComponentTree | null {
    return this.designInfo;
  }
  
  /**
   * Check if MCP support is enabled
   * @returns True if MCP support is enabled
   */
  hasMCPSupport(): boolean {
    return this.mcpManager !== null;
  }
  
  /**
   * Get a list of supported MCP protocols
   * @returns Array of protocol names
   */
  getSupportedMCPProtocols(): string[] {
    if (!this.mcpManager) {
      return [];
    }
    
    return this.mcpManager.getSupportedProtocols();
  }
  
  // Other existing methods would be here in a real implementation
} 