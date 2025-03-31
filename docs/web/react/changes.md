# React Framework Improvements

## Overview of Changes

We've made significant improvements to the React SDK to align it with the React Native SDK for consistency across frameworks. These changes make the SDK more intuitive, maintainable, and powerful for developers building AI-enabled applications.

## Key Improvements

### 1. Added `useRegisterComponent` Hook

We implemented the `useRegisterComponent` hook to provide a more modern, flexible API for registering React components with AgentBridge. This hook follows the same pattern as the React Native implementation, ensuring consistency across frameworks.

```jsx
// New hook usage
const updateState = useRegisterComponent({
  id: 'counter-1',
  componentType: 'counter',
  name: 'Counter Component',
  description: 'A counter that can be incremented or decremented',
  properties: {
    count,
    isEven: count % 2 === 0,
    isPositive: count > 0
  },
  actions: {
    increment: {
      description: 'Increase the counter by 1',
      handler: () => {
        setCount(prev => prev + 1);
        return true;
      }
    }
    // Other actions...
  }
});
```

### 2. Updated ReactAdapter Implementation

The ReactAdapter implementation was updated to match the React Native adapter's structure, ensuring consistent behavior across frameworks:

- Updated the `registerComponent` method to accept a ComponentDefinition and handlers
- Enhanced the component registration process for better type safety
- Ensured proper cleanup on component unmounting

### 3. Updated Component Utils

The built-in components (`AgentButton`, `AgentInput`, etc.) were updated to use the new hook signature, maintaining backward compatibility while offering improved functionality.

### 4. Improved Documentation

- Added detailed documentation for the new `useRegisterComponent` hook
- Created a new README.md with clear examples and use cases
- Updated existing docs to reflect the new API patterns

### 5. Enhanced Type Safety

- Improved TypeScript definitions for better developer experience
- Used more consistent types across the codebase
- Made accommodations for Zod schema types while maintaining ease of use

## Migration Notes

The original `useAgentComponent` hook is still available for backward compatibility, but we recommend migrating to the new `useRegisterComponent` hook for new projects.

### Migrating from useAgentComponent

```jsx
// Old approach
useAgentComponent('counter-id', 'counter', { 
  count: 0, 
  isEven: true 
});

// New approach
useRegisterComponent({
  id: 'counter-id',
  componentType: 'counter',
  name: 'Counter',
  description: 'A simple counter component',
  properties: {
    count: 0,
    isEven: true
  },
  actions: {
    // Define actions here
  }
});
```

## Future Improvements

Potential future enhancements include:

1. Full Zod schema support for component properties and actions
2. Additional pre-built components for common UI patterns
3. Enhanced debugging and developer tools
4. Example projects demonstrating advanced integration patterns 