# React Native SDK Overview

The AgentBridge React Native SDK provides tools and components for integrating AI agent capabilities into your React Native mobile applications. This SDK allows AI agents to interact with your application's UI components and functions, enabling rich interactions between users and AI.

## Features

- **Component Registration**: Make React Native components controllable by AI agents
- **Function Registration**: Expose application functions to AI agents
- **Communication Providers**: Connect to AI agents through various communication methods
- **Consistent API**: Similar API to the web React SDK for familiarity across platforms
- **Mobile Optimizations**: Optimized for mobile performance and battery life

## Installation

```bash
# Install the SDK
npm install @agentbridge/react-native

# Install a communication provider
npm install @agentbridge/communication-websocket
# or any other provider
```

## Architecture

The React Native SDK follows the same architecture as the web React SDK, with additional optimizations for mobile:

- **ReactNativeAdapter**: A special adapter for React Native that handles platform-specific concerns
- **Higher Order Components**: HOCs like `withAgentBridge` for easy component integration
- **Hooks**: Custom hooks like `useRegisterComponent` and `useRegisterFunction` for functional components
- **Providers**: Communication providers optimized for mobile network conditions

## Component Structure

The SDK provides several ways to register components:

1. **Hooks-based registration** (for functional components):

```jsx
import { useRegisterComponent } from '@agentbridge/react-native';

function Counter() {
  const [count, setCount] = useState(0);
  
  const { updateState } = useRegisterComponent({
    id: 'counter-1',
    componentType: 'counter',
    name: 'Counter Component',
    description: 'A counter component',
    properties: {
      count,
      isEven: count % 2 === 0
    },
    actions: {
      increment: {
        description: 'Increment the counter',
        handler: () => {
          setCount(prev => prev + 1);
          return { success: true };
        }
      },
      // More actions...
    }
  });
  
  // Component UI...
}
```

2. **HOC-based registration** (for class components):

```jsx
import { withAgentBridge } from '@agentbridge/react-native';

class Counter extends Component {
  // Component implementation...
}

export default withAgentBridge({
  id: 'counter-1',
  componentType: 'counter',
  name: 'Counter Component',
  description: 'A counter component',
  properties: (props, state) => ({
    count: state.count,
    isEven: state.count % 2 === 0
  }),
  actions: {
    increment: {
      description: 'Increment the counter',
      handler: (component) => {
        component.setState(prev => ({ count: prev.count + 1 }));
        return { success: true };
      }
    }
  }
})(Counter);
```

## Function Registration

You can register functions using the `useRegisterFunction` hook:

```jsx
import { useRegisterFunction } from '@agentbridge/react-native';

function WeatherWidget() {
  useRegisterFunction({
    name: 'getWeather',
    description: 'Get weather for a location',
    parameters: {
      type: 'object',
      properties: {
        location: { type: 'string' }
      },
      required: ['location']
    },
    handler: async ({ location }) => {
      try {
        // API call to get weather
        return { success: true, data: weatherData };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  });
  
  // Component UI...
}
```

## Integration with React Navigation

The SDK can be integrated with React Navigation:

```jsx
import { useRegisterFunction } from '@agentbridge/react-native';
import { useNavigation } from '@react-navigation/native';

function NavigationHandler() {
  const navigation = useNavigation();
  
  useRegisterFunction({
    name: 'navigateTo',
    description: 'Navigate to a screen',
    parameters: {
      type: 'object',
      properties: {
        screen: { type: 'string' },
        params: { type: 'object' }
      },
      required: ['screen']
    },
    handler: async ({ screen, params = {} }) => {
      try {
        navigation.navigate(screen, params);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  });
  
  return null; // This is a utility component with no UI
}
```

## Mobile-Specific Features

The React Native SDK includes features specifically designed for mobile:

- **Battery optimization**: Smart reconnection strategies to minimize battery impact
- **Network awareness**: Adaptation to changing network conditions
- **Offline support**: Graceful handling of offline scenarios
- **Deep linking**: Integration with app deep linking

## Next Steps

- [Learn about React Native components](components.md)
- [Explore React Native hooks](hooks.md)
- [View React Native examples](../../examples/react-native-examples.md)
