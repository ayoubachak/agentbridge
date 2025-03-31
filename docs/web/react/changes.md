# Change Log for React SDK

This page documents the changes and updates to the AgentBridge React SDK.

## Version 0.2.0

Released: October 2023

### Major Changes

- Added new `useRegisterComponent` hook with improved API
- Updated return values for component actions to support detailed responses
- Improved component state updates with automatic property tracking
- Added full TypeScript support for all hooks and components

### API Changes

#### New Hooks

- `useRegisterComponent`: New hook for registering components with better state management
- `useAgentFunctionCall`: New hook for calling functions registered with AgentBridge

#### Updated Hooks

- `useAgentFunction`: Updated parameter format to use a single configuration object
- `useAgentComponent`: Improved with better property handling and action results

### Breaking Changes

- `useAgentComponent` now uses a different return value structure
- Component actions now return an object with `success` and `message` properties
- Hook dependency arrays now require more careful management

### Migration Guide

#### Migrating from useAgentComponent to useRegisterComponent

**Before:**

```jsx
// Old way with useAgentComponent
const updateState = useAgentComponent(id, {
  type: 'counter',
  properties: {...},
  actions: {
    increment: () => {
      setCount(prev => prev + 1);
      return true;
    }
  }
});
```

**After:**

```jsx
// New way with useRegisterComponent
const { updateState } = useRegisterComponent({
  id: 'counter-1',
  componentType: 'counter',
  properties: {...},
  actions: {
    increment: {
      description: 'Increment the counter',
      handler: () => {
        setCount(prev => prev + 1);
        return { success: true, message: 'Counter incremented', newValue: count + 1 };
      }
    }
  }
});

// Add effect to update state when properties change
useEffect(() => {
  updateState({
    count, 
    isEven: count % 2 === 0
  });
}, [count, updateState]);
```

#### Updating Action Return Values

**Before:**

```jsx
actions: {
  increment: () => {
    setCount(prev => prev + 1);
    return true; // Simple boolean return
  }
}
```

**After:**

```jsx
actions: {
  increment: {
    description: 'Increment the counter',
    handler: () => {
      setCount(prev => prev + 1);
      return { 
        success: true, 
        message: 'Counter incremented', 
        newValue: count + 1 
      };
    }
  }
}
```

## Version 0.1.0

Released: July 2023

### Initial Release

- Basic component registration with `useAgentComponent`
- Function registration with `useAgentFunction`
- AgentBridge provider for React
- Pre-built components for common UI elements 