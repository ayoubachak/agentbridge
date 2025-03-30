import { ReactDesignInfoCollector } from './design-collector';
import { AgentBridge } from '../core/agent-bridge';

/**
 * React adapter for AgentBridge
 * This adapter integrates AgentBridge with React applications
 */
export class ReactAdapter {
  private agentBridge: AgentBridge;
  private designCollector: ReactDesignInfoCollector;
  
  constructor(agentBridge: AgentBridge) {
    this.agentBridge = agentBridge;
    this.designCollector = new ReactDesignInfoCollector();
  }
  
  /**
   * Initialize the adapter
   * @param rootElement Optional root element to capture design information
   */
  initialize(rootElement?: any): void {
    // Capture design information if a root element is provided
    if (rootElement) {
      this.captureDesignInfo(rootElement);
    }
  }
  
  /**
   * Capture design information from a React component tree
   * @param rootElement The root React element
   */
  captureDesignInfo(rootElement: any): void {
    // Use the design collector to create a component tree
    const componentTree = this.designCollector.captureComponentTree(rootElement);
    
    // Register the design information with AgentBridge
    this.agentBridge.registerDesignInfo(componentTree);
  }
  
  /**
   * Register a component
   * @param component The React component
   * @param id Component ID
   * @param type Component type
   */
  registerComponent(component: any, id: string, type: string): void {
    // In a real implementation, you would register the component with AgentBridge
    // For now, we just collect design information
    this.captureDesignInfo(component);
  }
  
  /**
   * Create a hook for registering a component
   * @param id Component ID
   * @param type Component type
   * @returns A hook function
   */
  useComponentRegistration(id: string, type: string): (ref: any) => void {
    return (ref: any) => {
      if (ref) {
        this.registerComponent(ref, id, type);
      }
    };
  }
} 