# React Native SDK Overview

The AgentBridge React Native SDK provides components, hooks, and utilities that make it easy to integrate the AgentBridge framework with React Native applications. This SDK is designed specifically for mobile environments, with performance and native integration in mind.

## Features

- **React Native Components**: Ready-to-use components that can be controlled by AI agents
- **Mobile-Specific Functionality**: Access to device features like camera, location, and vibration
- **Performance Optimized**: Built with mobile performance considerations in mind
- **Cross-Platform**: Works on both iOS and Android platforms
- **TypeScript Support**: Full TypeScript support with type definitions
- **Hooks API**: Similar API to the React web SDK for consistency

## Installation

Install the AgentBridge React Native SDK and core package:

```bash
npm install @agentbridge/core @agentbridge/react-native
```

Also install one of the communication providers:

```bash
# If using Ably
npm install @agentbridge/provider-ably

# If using Firebase
npm install @agentbridge/provider-firebase

# If using Pusher
npm install @agentbridge/provider-pusher

# If using Supabase
npm install @agentbridge/provider-supabase
```

### Additional Setup

#### iOS
For iOS, you may need to install pods:

```bash
cd ios && pod install && cd ..
```

#### Android
For Android, no additional setup is required beyond standard React Native setup.

## Basic Setup

To get started with AgentBridge in your React Native application, wrap your app with the `AgentBridgeProvider`:

```jsx
import React from 'react';
import { SafeAreaView, StatusBar, View } from 'react-native';
import { AgentBridgeProvider } from '@agentbridge/react-native';
import { AblyProvider } from '@agentbridge/provider-ably';

// Create a communication provider
const ablyProvider = new AblyProvider({
  apiKey: 'your-ably-api-key',
});

function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <AgentBridgeProvider 
        applicationId="your-app-id"
        communicationProvider={ablyProvider}
      >
        {/* Your app components */}
        <YourComponents />
      </AgentBridgeProvider>
    </SafeAreaView>
  );
}

export default App;
```

## Using AgentBridge Components

The React Native SDK provides several pre-built components that can be controlled by AI agents:

```jsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { 
  AgentButton, 
  AgentTextInput, 
  AgentSwitch 
} from '@agentbridge/react-native';

function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subscribe, setSubscribe] = useState(false);
  
  const handleSubmit = () => {
    console.log({ name, email, subscribe });
    // Handle form submission
  };
  
  return (
    <View style={styles.container}>
      <AgentTextInput 
        id="name-input"
        label="Your Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      
      <AgentTextInput 
        id="email-input"
        label="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
      />
      
      <AgentSwitch 
        id="subscribe-switch"
        label="Subscribe to newsletter"
        value={subscribe}
        onValueChange={setSubscribe}
        style={styles.switch}
      />
      
      <AgentButton 
        id="submit-button"
        title="Submit"
        onPress={handleSubmit}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    marginBottom: 16,
  },
  switch: {
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
  },
});
```

## Mobile-Specific Components

The React Native SDK includes mobile-specific components:

```jsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { 
  AgentCamera,
  AgentLocationPicker,
  AgentDatePicker,
  AgentBottomSheet
} from '@agentbridge/react-native';

function MobileFeatures() {
  const [imageUri, setImageUri] = useState(null);
  const [location, setLocation] = useState(null);
  const [date, setDate] = useState(new Date());
  const [sheetVisible, setSheetVisible] = useState(false);
  
  return (
    <View style={styles.container}>
      <AgentCamera
        id="profile-camera"
        onCapture={uri => setImageUri(uri)}
        style={styles.camera}
      />
      
      <AgentLocationPicker
        id="location-picker"
        onLocationSelected={coords => setLocation(coords)}
        style={styles.picker}
      />
      
      <AgentDatePicker
        id="date-picker"
        value={date}
        onChange={setDate}
        style={styles.picker}
      />
      
      <AgentBottomSheet
        id="options-sheet"
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        height={300}
      >
        {/* Bottom sheet content */}
        <View style={styles.sheetContent}>
          {/* Add your content here */}
        </View>
      </AgentBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  camera: {
    height: 200,
    marginBottom: 16,
  },
  picker: {
    marginBottom: 16,
  },
  sheetContent: {
    padding: 16,
  },
});
```

## Registering Custom Components

You can register your own React Native components to be controlled by AI agents:

### Using the useAgentComponent Hook

```jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAgentComponent } from '@agentbridge/react-native';

function CustomCard({ id, title, description, onAction }) {
  const [expanded, setExpanded] = useState(false);
  
  // Register this component with AgentBridge
  useAgentComponent(id, {
    // Define the component properties that agents can access
    properties: {
      title,
      description,
      expanded,
    },
    // Define actions that agents can perform
    actions: {
      expand: () => {
        setExpanded(true);
        return true;
      },
      collapse: () => {
        setExpanded(false);
        return true;
      },
      trigger: () => {
        if (onAction) onAction();
        return true;
      }
    }
  });
  
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {expanded && <Text style={styles.description}>{description}</Text>}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.buttonText}>
          {expanded ? 'Collapse' : 'Expand'}
        </Text>
      </TouchableOpacity>
      {onAction && (
        <TouchableOpacity 
          style={[styles.button, styles.actionButton]} 
          onPress={onAction}
        >
          <Text style={styles.buttonText}>Trigger Action</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
```

## Device-Specific Capabilities

The React Native SDK provides access to device-specific capabilities:

```jsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAgentBridge, useAgentFunction } from '@agentbridge/react-native';
import { Vibration } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

function DeviceCapabilities() {
  const { registerFunction } = useAgentBridge();
  
  // Register device functions
  useAgentFunction({
    name: 'vibrate',
    description: 'Vibrate the device',
    parameters: {
      type: 'object',
      properties: {
        duration: { type: 'number', default: 400 },
        pattern: { 
          type: 'array', 
          items: { type: 'number' },
          description: 'Vibration pattern (durations in ms)'
        }
      }
    },
    handler: async (params) => {
      const { duration = 400, pattern } = params;
      
      if (pattern && Array.isArray(pattern)) {
        Vibration.vibrate(pattern);
      } else {
        Vibration.vibrate(duration);
      }
      
      return { success: true };
    }
  });
  
  useAgentFunction({
    name: 'getCurrentLocation',
    description: 'Get the current device location',
    parameters: {
      type: 'object',
      properties: {
        enableHighAccuracy: { type: 'boolean', default: false }
      }
    },
    handler: async (params) => {
      const { enableHighAccuracy = false } = params;
      
      return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          position => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp
            });
          },
          error => {
            reject(new Error(`Failed to get location: ${error.message}`));
          },
          { enableHighAccuracy, timeout: 15000, maximumAge: 10000 }
        );
      });
    }
  });
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Device Capabilities</Text>
      <Text style={styles.description}>
        This component has registered device-specific functions that can be triggered by AI agents:
      </Text>
      <View style={styles.function}>
        <Text style={styles.functionName}>vibrate</Text>
        <Text style={styles.functionDescription}>
          Vibrates the device with a specified duration or pattern
        </Text>
      </View>
      <View style={styles.function}>
        <Text style={styles.functionName}>getCurrentLocation</Text>
        <Text style={styles.functionDescription}>
          Gets the current geographical location of the device
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  function: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  functionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  functionDescription: {
    fontSize: 14,
    color: '#666',
  },
});
```

## Performance Considerations

When working with React Native, keep these performance considerations in mind:

1. **Minimize component re-renders**: React Native rendering can be expensive, especially on older devices
2. **Optimize network usage**: Be mindful of data usage on mobile networks
3. **Battery impact**: Be conscious of battery consumption with continuous operations
4. **Responsive design**: Ensure the UI works across different screen sizes and orientations

## Next Steps

- Explore the [Core API](../../core/api-reference.md) for more information on underlying functionality
- Check the [React SDK documentation](../../web/react/overview.md) for additional features that are shared between React and React Native
- See the [Mobile Features Guide](../mobile-features.md) for mobile-specific functionality
