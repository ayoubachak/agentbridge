import { useEffect, useRef } from 'react';
import { 
  ComponentDefinition, 
  FunctionDefinition, 
  FunctionImplementation 
} from '@agentbridge/core';
import { useAgentBridge } from './AgentBridgeProvider';

/**
 * Hook for registering a component with AgentBridge
 * @param component The component definition to register
 */
export function useRegisterComponent(
  component: Omit<ComponentDefinition, 'id'> & { id?: string }
) {
  const { bridge } = useAgentBridge();
  const registered = useRef(false);

  useEffect(() => {
    if (!bridge || registered.current) return;

    const id = component.id || `${component.name}-${Date.now()}`;
    
    bridge.registerComponent({
      ...component,
      id
    });

    registered.current = true;
  }, [bridge, component]);
}

/**
 * Hook for registering a function with AgentBridge
 * @param definition The function definition excluding implementation
 * @param implementation The function implementation
 */
export function useRegisterFunction<T extends Record<string, any>, R>(
  definition: Omit<FunctionDefinition, 'implementation'>,
  implementation: FunctionImplementation<T, R>
) {
  const { bridge } = useAgentBridge();
  const registered = useRef(false);

  useEffect(() => {
    if (!bridge || registered.current) return;

    bridge.registerFunction({
      ...definition,
      implementation
    });

    registered.current = true;
  }, [bridge, definition, implementation]);
} 