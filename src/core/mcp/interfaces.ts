/**
 * Model Context Protocols (MCPs) Interfaces
 * These interfaces define the contracts for MCP integration in AgentBridge.
 */

/**
 * The base interface for MCP adapters that translate between AgentBridge and MCP formats
 */
export interface MCPAdapter {
  /**
   * Convert an AgentBridge function definition to an MCP schema
   * @param functionDef The function definition to convert
   * @returns The converted schema in the format required by the MCP
   */
  convertToMCPSchema(functionDef: any): any;
  
  /**
   * Convert an MCP function call to an AgentBridge function call request
   * @param mcpCall The MCP function call to convert
   * @returns A function call request in AgentBridge format
   */
  convertFromMCPCall(mcpCall: any): any;
  
  /**
   * Map AgentBridge context to MCP context
   * @param context The AgentBridge context
   * @returns The mapped context in MCP format
   */
  mapContext(context: any): any;
  
  /**
   * Map AgentBridge function call result to MCP response
   * @param response The function call result
   * @returns The mapped response in MCP format
   */
  mapResponse(response: any): any;
  
  /**
   * Get the complete function schema for all registered functions
   * @returns The schema in MCP format
   */
  getFunctionSchema(): any;
}

/**
 * Interface for the component design information
 */
export interface ComponentDesignInfo {
  layout: LayoutInfo;
  styling: StylingInfo;
  screen?: ScreenInfo;
}

/**
 * Layout information for a component
 */
export interface LayoutInfo {
  parent?: string;
  children: string[];
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  zIndex?: number;
}

/**
 * Styling information for a component
 */
export interface StylingInfo {
  theme?: string;
  styleClasses?: string[];
  customStyles?: Record<string, any>;
}

/**
 * Screen/route information for a component
 */
export interface ScreenInfo {
  name: string;
  route?: string;
  isActive: boolean;
}

/**
 * Represents the complete component tree
 */
export interface ComponentTree {
  rootComponents: string[];
  components: Map<string, ComponentInfo>;
  structure: Record<string, string[]>; // parent ID -> child IDs
}

/**
 * Information about a component
 */
export interface ComponentInfo {
  id: string;
  type: string;
  props: Record<string, any>;
  state: Record<string, any>;
  designInfo?: ComponentDesignInfo;
} 