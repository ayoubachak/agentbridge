import React, { forwardRef, ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';
import { useAgentComponent } from './hooks';

// Props interface for components that can be controlled by AI agents
interface AgentControlledProps {
  /** Unique ID for the component */
  agentId: string;
  /** Component type identifier */
  agentType?: string;
  /** Additional properties to expose to the AI */
  agentProps?: Record<string, any>;
}

// Button component that can be controlled by AI agents
interface AgentButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, AgentControlledProps {
  children: ReactNode;
}

export const AgentButton = forwardRef<HTMLButtonElement, AgentButtonProps>(
  ({ agentId, agentType = 'button', agentProps = {}, onClick, children, ...props }, ref) => {
    const { state: _state, updateState } = useAgentComponent(agentId, agentType, {
      ...agentProps,
      ...props
    });
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Update state to reflect the click
      updateState({
        lastClicked: new Date().toISOString()
      });
      
      // Call the original onClick handler if provided
      if (onClick) {
        onClick(e);
      }
    };
    
    return (
      <button
        ref={ref}
        onClick={handleClick}
        {...props}
        data-agent-id={agentId}
        data-agent-type={agentType}
      >
        {children}
      </button>
    );
  }
);

AgentButton.displayName = 'AgentButton';

// Input component that can be controlled by AI agents
interface AgentInputProps extends InputHTMLAttributes<HTMLInputElement>, AgentControlledProps {}

export const AgentInput = forwardRef<HTMLInputElement, AgentInputProps>(
  ({ agentId, agentType = 'input', agentProps = {}, onChange, ...props }, ref) => {
    const { state, updateState } = useAgentComponent(agentId, agentType, {
      ...agentProps,
      ...props
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Update state to reflect the new value
      updateState({
        value: e.target.value,
        lastChanged: new Date().toISOString()
      });
      
      // Call the original onChange handler if provided
      if (onChange) {
        onChange(e);
      }
    };
    
    // Use value from state if available
    const value = state.value !== undefined ? state.value : props.value;
    
    return (
      <input
        ref={ref}
        {...props}
        value={value}
        onChange={handleChange}
        data-agent-id={agentId}
        data-agent-type={agentType}
      />
    );
  }
);

AgentInput.displayName = 'AgentInput';

// Select component that can be controlled by AI agents
interface AgentSelectProps extends AgentControlledProps {
  children: ReactNode;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  value?: string;
  [key: string]: any;
}

export const AgentSelect = forwardRef<HTMLSelectElement, AgentSelectProps>(
  ({ agentId, agentType = 'select', agentProps = {}, onChange, children, ...props }, ref) => {
    const { state, updateState } = useAgentComponent(agentId, agentType, {
      ...agentProps,
      ...props
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      // Update state to reflect the new value
      updateState({
        value: e.target.value,
        lastChanged: new Date().toISOString()
      });
      
      // Call the original onChange handler if provided
      if (onChange) {
        onChange(e);
      }
    };
    
    // Use value from state if available
    const value = state.value !== undefined ? state.value : props.value;
    
    return (
      <select
        ref={ref}
        {...props}
        value={value}
        onChange={handleChange}
        data-agent-id={agentId}
        data-agent-type={agentType}
      >
        {children}
      </select>
    );
  }
);

AgentSelect.displayName = 'AgentSelect';

// Container component that exposes its children to AI agents
interface AgentContainerProps extends AgentControlledProps {
  children: ReactNode;
  as?: React.ElementType;
  [key: string]: any;
}

export const AgentContainer = forwardRef<HTMLDivElement, AgentContainerProps>(
  ({ agentId, agentType = 'container', agentProps = {}, as: Component = 'div', children, ...props }, ref) => {
    useAgentComponent(agentId, agentType, {
      ...agentProps,
      ...props,
      childCount: React.Children.count(children)
    });
    
    return (
      <Component
        ref={ref}
        {...props}
        data-agent-id={agentId}
        data-agent-type={agentType}
      >
        {children}
      </Component>
    );
  }
);

AgentContainer.displayName = 'AgentContainer'; 