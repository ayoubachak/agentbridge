/**
 * AgentButton Component
 * 
 * A button component that can be registered with AgentBridge to allow
 * AI agents to trigger actions in the UI.
 */
import * as React from 'react';
import { AgentComponentOptions } from '../core/types';
import { useAgentComponent } from '../hooks/useAgentComponent';

/**
 * Button props
 */
export interface AgentButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Component ID */
  componentId?: string;
  /** Component type identifier */
  componentType?: string;
  /** Button label */
  label?: string;
  /** Button description */
  description?: string;
  /** Called when button is clicked */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Called when button state changes */
  onStateChange?: (state: Record<string, any>) => void;
  /** Action handler */
  onAction?: (action: string, params: any) => any;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Size */
  size?: 'small' | 'medium' | 'large';
}

/**
 * Button component that registers with AgentBridge
 */
export const AgentButton: React.FC<AgentButtonProps> = ({
  componentId,
  componentType = 'button',
  label,
  description,
  onClick,
  onStateChange,
  onAction,
  children,
  className = '',
  style = {},
  variant = 'primary',
  size = 'medium',
  disabled = false,
  ...props
}) => {
  // Default component ID based on label
  const defaultId = `button-${label?.toLowerCase().replace(/\s+/g, '-') || 'unnamed'}-${Math.floor(Math.random() * 10000)}`;
  
  // Track disabled state for agent
  const [isDisabled, setIsDisabled] = React.useState(disabled);
  
  // Update disabled state when prop changes
  React.useEffect(() => {
    setIsDisabled(disabled);
  }, [disabled]);
  
  // Register with AgentBridge
  const component = useAgentComponent({
    componentId: componentId || defaultId,
    componentType: componentType,
    description: description || `Button: ${label || children}`,
    initialState: { disabled: isDisabled },
    properties: {
      label: label || (typeof children === 'string' ? children : undefined) || '',
      variant,
      size,
      disabled: isDisabled
    },
    actions: {
      click: {
        description: 'Click the button',
        parameters: { type: 'object', properties: {} },
        handler: async () => {
          if (isDisabled) {
            return { success: false, error: 'Button is disabled' };
          }
          
          // Call the onClick handler if provided
          if (onClick) {
            try {
              // Since we can't create a proper synthetic event,
              // call the handler directly and note that the event will be undefined
              onClick(undefined as unknown as React.MouseEvent<HTMLButtonElement>);
              return { success: true };
            } catch (err) {
              return { 
                success: false, 
                error: err instanceof Error ? err.message : String(err)
              };
            }
          }
          
          return { success: true };
        }
      },
      enable: {
        description: 'Enable the button',
        parameters: { type: 'object', properties: {} },
        handler: async () => {
          setIsDisabled(false);
          return { success: true };
        }
      },
      disable: {
        description: 'Disable the button',
        parameters: { type: 'object', properties: {} },
        handler: async () => {
          setIsDisabled(true);
          return { success: true };
        }
      }
    },
    onStateChange: (updates) => {
      // Update disabled state if changed
      if (updates.disabled !== undefined) {
        setIsDisabled(updates.disabled);
      }
      
      // Call custom state change handler
      onStateChange?.(updates);
    },
    onAction: (actionName, params) => {
      // Call custom action handler
      return onAction?.(actionName, params);
    }
  });
  
  // Update component state when disabled changes
  React.useEffect(() => {
    component.updateState({ disabled: isDisabled });
  }, [isDisabled, component]);
  
  // Compute CSS classes
  const variantClass = `agent-button-${variant}`;
  const sizeClass = `agent-button-${size}`;
  const disabledClass = isDisabled ? 'agent-button-disabled' : '';
  
  return (
    <button
      className={`agent-button ${variantClass} ${sizeClass} ${disabledClass} ${className}`}
      style={style}
      onClick={onClick}
      disabled={isDisabled}
      {...props}
    >
      {label || children}
    </button>
  );
};

export default AgentButton; 