import { ComponentDefinition, FunctionDefinition } from '@agentbridge/core';
import { Type } from '@angular/core';

// Custom interface for Angular components with AgentBridge metadata
interface AgentBridgeComponent extends Type<any> {
  ɵfac?: any;
  __agentbridge__?: {
    componentDefinition?: Omit<ComponentDefinition, 'component'> & { component: Type<any> };
    functions?: Array<Omit<FunctionDefinition, 'implementation'> & { 
      implementation: Function;
      methodName: string;
    }>;
  };
}

/**
 * Decorator for registering a component with AgentBridge
 * @param definition The component definition
 */
export function RegisterComponent(definition: Omit<ComponentDefinition, 'component'>) {
  return function (target: AgentBridgeComponent) {
    const originalFactory = target.ɵfac;
    
    if (originalFactory) {
      // Ensure we set metadata that can be read later during module initialization
      if (!target.__agentbridge__) {
        target.__agentbridge__ = {};
      }

      target.__agentbridge__.componentDefinition = {
        ...definition,
        component: target
      };
    }

    return target;
  };
}

/**
 * Decorator for registering a function with AgentBridge
 * @param definition The function definition (excluding the implementation)
 */
export function RegisterFunction(definition: Omit<FunctionDefinition, 'implementation'>) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;
    const constructor = target.constructor as AgentBridgeComponent;

    // Store the definition on the class for later registration
    if (!constructor.__agentbridge__) {
      constructor.__agentbridge__ = { functions: [] };
    } else if (!constructor.__agentbridge__.functions) {
      constructor.__agentbridge__.functions = [];
    }

    constructor.__agentbridge__.functions!.push({
      ...definition,
      implementation: method,
      methodName: propertyKey
    });

    return descriptor;
  };
} 