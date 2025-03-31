# Getting Started with React SDK

This guide will help you get started with the AgentBridge React SDK.

## Installation

First, install the core package and React SDK:

```bash
npm install @agentbridge/core @agentbridge/react
```

Then install a communication provider. You can choose between:

```bash 
# For Ably Pub/Sub provider
npm install @agentbridge/provider-ably

# For Firebase Pub/Sub provider
npm install @agentbridge/provider-firebase

# For Pusher Pub/Sub provider
npm install @agentbridge/provider-pusher

# For Supabase Pub/Sub provider
npm install @agentbridge/provider-supabase

# For WebSocket communication (self-hosted mode)
npm install @agentbridge/communication-websocket
```

## Basic Setup

Wrap your application with the `AgentBridgeProvider` component to provide access to AgentBridge throughout your React app:

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { AgentBridgeProvider } from '@agentbridge/react';
import { createAgentBridge } from '@agentbridge/core';
import { initializeWebSocketProvider } from '@agentbridge/communication-websocket';

// Create AgentBridge instance
const bridge = createAgentBridge();

// Setup WebSocket provider (or any other provider)
const provider = initializeWebSocketProvider(bridge, {
  url: 'ws://localhost:3001' // Your WebSocket server URL
});

function App() {
  return (
    <AgentBridgeProvider bridge={bridge}>
      {/* Your app components */}
    </AgentBridgeProvider>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
```

## Creating an AI-Controllable Component

Use the `useRegisterComponent` hook to make your components controllable by AI agents:

```jsx
import React, { useState, useEffect } from 'react';
import { useRegisterComponent } from '@agentbridge/react';

function Counter() {
  const [count, setCount] = useState(0);
  
  // Register component with AgentBridge
  const { updateState } = useRegisterComponent({
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
          return { success: true, message: 'Counter incremented', newValue: count + 1 };
        }
      },
      decrement: {
        description: 'Decrease the counter by 1',
        handler: () => {
          setCount(prev => prev - 1);
          return { success: true, message: 'Counter decremented', newValue: count - 1 };
        }
      },
      reset: {
        description: 'Reset the counter to 0',
        handler: () => {
          setCount(0);
          return { success: true, message: 'Counter reset', newValue: 0 };
        }
      }
    }
  });
  
  // Update state when count changes
  useEffect(() => {
    updateState({
      count,
      isEven: count % 2 === 0,
      isPositive: count > 0
    });
  }, [count, updateState]);
  
  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

## Registering Functions

Use the `useAgentFunction` hook to make application functions callable by AI agents:

```jsx
import { useAgentFunction } from '@agentbridge/react';

function WeatherWidget() {
  const [weatherData, setWeatherData] = useState(null);
  
  useAgentFunction({
    name: 'getWeather',
    description: 'Get weather information for a location',
    parameters: {
      type: 'object',
      properties: {
        location: { 
          type: 'string', 
          description: 'City name or postal code' 
        },
        units: { 
          type: 'string', 
          enum: ['metric', 'imperial'],
          default: 'metric',
          description: 'Temperature units' 
        }
      },
      required: ['location']
    },
    handler: async (params) => {
      const { location, units = 'metric' } = params;
      
      try {
        // Simulate API call (replace with actual API call)
        const data = {
          location,
          temperature: 22,
          conditions: 'Sunny',
          humidity: 50,
          units
        };
        
        setWeatherData(data);
        return { success: true, data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  });
  
  return (
    <div>
      <h2>Weather Function</h2>
      {weatherData && (
        <div>
          <h3>{weatherData.location}</h3>
          <p>Temperature: {weatherData.temperature}°{weatherData.units === 'metric' ? 'C' : 'F'}</p>
          <p>Conditions: {weatherData.conditions}</p>
          <p>Humidity: {weatherData.humidity}%</p>
        </div>
      )}
    </div>
  );
}
```

## Next Steps

Now that you have a basic understanding of the AgentBridge React SDK, you can:

1. [Learn more about hooks](hooks.md)
2. [Explore pre-built components](components.md)
3. [Check out example applications](../../getting-started/examples.md)
4. [Read about communication modes](../../getting-started/communication-modes.md) 