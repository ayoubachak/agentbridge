# Mobile Features

This page documents the mobile-specific features available in AgentBridge for both Flutter and React Native platforms.

## Cross-Platform Features

The following features are available on both Flutter and React Native platforms:

### Native UI Components

AgentBridge provides platform-specific UI components that follow native design patterns while maintaining a consistent API for AI agent interactions:

- Buttons and action items
- Text fields and form inputs
- Selection components (dropdown, pickers)
- Toggle components (switch, checkbox)
- List views and collection views
- Cards and containers
- Navigation components
- Modals and dialogs

### Device Capabilities

Access to device-specific capabilities through consistent APIs:

```typescript
// React Native
import { DeviceCapabilities } from '@agentbridge/react-native';

// Check if a capability is available
const hasCamera = await DeviceCapabilities.isAvailable('camera');

// Request permission for a capability
const cameraPermission = await DeviceCapabilities.requestPermission('camera');

// Use a device capability
const photo = await DeviceCapabilities.useCapability('camera', {
  mode: 'photo',
  quality: 'high'
});
```

```dart
// Flutter
import 'package:agentbridge/device_capabilities.dart';

// Check if a capability is available
final hasCamera = await DeviceCapabilities.isAvailable('camera');

// Request permission for a capability
final cameraPermission = await DeviceCapabilities.requestPermission('camera');

// Use a device capability
final photo = await DeviceCapabilities.useCapability('camera', {
  'mode': 'photo',
  'quality': 'high'
});
```

### Offline Support

AgentBridge provides offline capabilities for mobile applications:

- Function queue for executing operations when connectivity is restored
- Local storage for persisting state and user data
- Synchronization mechanisms for resolving conflicts

```typescript
// React Native
import { OfflineSupport } from '@agentbridge/react-native';

// Queue a function for execution
OfflineSupport.queueFunction('submitForm', formData);

// Check sync status
const syncStatus = await OfflineSupport.getSyncStatus();

// Force synchronization
await OfflineSupport.synchronize();
```

```dart
// Flutter
import 'package:agentbridge/offline_support.dart';

// Queue a function for execution
OfflineSupport.queueFunction('submitForm', formData);

// Check sync status
final syncStatus = await OfflineSupport.getSyncStatus();

// Force synchronization
await OfflineSupport.synchronize();
```

### Responsive Design Support

Utilities for creating responsive designs that adapt to different screen sizes and orientations:

```typescript
// React Native
import { ResponsiveLayout } from '@agentbridge/react-native';

// Get current device info
const deviceInfo = ResponsiveLayout.getDeviceInfo();

// Use responsive dimensions
const cardWidth = ResponsiveLayout.getDimension('card.width');

// Respond to orientation changes
ResponsiveLayout.onOrientationChange((orientation) => {
  // Update layout
});
```

```dart
// Flutter
import 'package:agentbridge/responsive_layout.dart';

// Get current device info
final deviceInfo = ResponsiveLayout.getDeviceInfo();

// Use responsive dimensions
final cardWidth = ResponsiveLayout.getDimension('card.width');

// Respond to orientation changes
ResponsiveLayout.onOrientationChange((orientation) {
  // Update layout
});
```

## Flutter-Specific Features

Features specific to the Flutter platform:

### Widget Lifecycle Management

```dart
import 'package:agentbridge/lifecycle_manager.dart';

class MyStatefulWidget extends StatefulWidget with LifecycleAwareMixin {
  @override
  void onLifecycleEvent(LifecycleEvent event) {
    switch (event) {
      case LifecycleEvent.create:
        // Widget created
        break;
      case LifecycleEvent.mount:
        // Widget mounted
        break;
      case LifecycleEvent.update:
        // Widget updated
        break;
      case LifecycleEvent.unmount:
        // Widget unmounted
        break;
    }
  }
}
```

### Custom Painters

Support for AI-controlled custom painters in Flutter:

```dart
import 'package:agentbridge/custom_painter.dart';

class MyPainter extends AgentCustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // Standard painting logic
  }
  
  // Method that can be called by AI agents
  void drawCircleAtPosition(double x, double y, double radius) {
    // Implementation
  }
}
```

### Animation Control

Allow AI agents to control Flutter animations:

```dart
import 'package:agentbridge/animation_controller.dart';

final animationController = AgentAnimationController(
  id: 'fade-animation',
  duration: Duration(milliseconds: 500),
  vsync: this,
);

// In component definition
registerComponent(ComponentDefinition(
  id: 'fade-animation',
  type: 'animation',
  properties: {
    'duration': 500,
    'value': animationController.value,
    'status': animationController.status.toString(),
  },
  actions: ['play', 'pause', 'reset', 'reverse'],
));
```

## React Native-Specific Features

Features specific to the React Native platform:

### Native Module Bridge

Simplified access to native modules:

```typescript
import { NativeBridge } from '@agentbridge/react-native';

// Register a native module
NativeBridge.registerNativeModule('Biometrics', {
  authenticate: async () => {
    // Implementation
    return { success: true };
  }
});

// Use a native module
const result = await NativeBridge.callNativeMethod('Biometrics', 'authenticate');
```

### Component Hooks

React hooks for integrating with AgentBridge:

```typescript
import { useAgentState, useAgentAction } from '@agentbridge/react-native';

function MyComponent() {
  // State that can be observed and modified by AI agents
  const [value, setValue] = useAgentState('my-input', '');
  
  // Register an action that can be triggered by AI agents
  const handleSubmit = useAgentAction('submit-form', async () => {
    // Implementation
    return { success: true };
  });
  
  return (
    <View>
      <TextInput value={value} onChangeText={setValue} />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}
```

### JSI Optimizations

Performance optimizations using JavaScript Interface (JSI):

```typescript
import { JsiOptimizer } from '@agentbridge/react-native';

// Register JSI functions for performance-critical operations
JsiOptimizer.registerJsiFunction('processImageData', (imageData) => {
  // High-performance image processing
  return processedData;
});

// Use JSI function
const result = JsiOptimizer.callJsiFunction('processImageData', imageData);
```

## Integration with Mobile AI

AgentBridge provides integration with on-device AI models:

### On-Device Models

```typescript
// React Native
import { OnDeviceAI } from '@agentbridge/react-native';

// Initialize on-device model
await OnDeviceAI.initializeModel('text-classification');

// Use on-device model
const result = await OnDeviceAI.executeModel('text-classification', {
  text: 'Sample text to classify'
});
```

```dart
// Flutter
import 'package:agentbridge/on_device_ai.dart';

// Initialize on-device model
await OnDeviceAI.initializeModel('text-classification');

// Use on-device model
final result = await OnDeviceAI.executeModel('text-classification', {
  'text': 'Sample text to classify'
});
```

### Hybrid AI Execution

Intelligently switch between cloud and on-device AI based on connectivity, battery, and performance requirements:

```typescript
// React Native
import { HybridAI } from '@agentbridge/react-native';

// Configure hybrid execution
HybridAI.configure({
  preferOnDevice: true,
  batteryThreshold: 0.2, // Switch to cloud if battery below 20%
  networkRequirement: 'any', // 'wifi', 'any', or 'none'
});

// Execute AI function with automatic routing
const result = await HybridAI.execute('generateResponse', {
  prompt: 'Hello, how can you help me?'
});
```

```dart
// Flutter
import 'package:agentbridge/hybrid_ai.dart';

// Configure hybrid execution
HybridAI.configure({
  'preferOnDevice': true,
  'batteryThreshold': 0.2, // Switch to cloud if battery below 20%
  'networkRequirement': 'any', // 'wifi', 'any', or 'none'
});

// Execute AI function with automatic routing
final result = await HybridAI.execute('generateResponse', {
  'prompt': 'Hello, how can you help me?'
});
```

## Platform Integration

### Deep Linking

Support for deep linking to specific parts of your application:

```typescript
// React Native
import { DeepLinking } from '@agentbridge/react-native';

// Register deep link handlers
DeepLinking.registerHandler('product/:id', (params) => {
  // Navigate to product page with params.id
});

// Create a deep link
const deepLink = DeepLinking.createLink('product/123', {
  utm_source: 'email',
  utm_campaign: 'summer_sale'
});
```

```dart
// Flutter
import 'package:agentbridge/deep_linking.dart';

// Register deep link handlers
DeepLinking.registerHandler('product/:id', (params) {
  // Navigate to product page with params['id']
});

// Create a deep link
final deepLink = DeepLinking.createLink('product/123', {
  'utm_source': 'email',
  'utm_campaign': 'summer_sale'
});
```

### Push Notifications

Integration with platform-specific push notification services:

```typescript
// React Native
import { PushNotifications } from '@agentbridge/react-native';

// Request permission
const hasPermission = await PushNotifications.requestPermission();

// Register device token
await PushNotifications.registerDeviceToken(deviceToken);

// Handle notification
PushNotifications.onNotificationReceived((notification) => {
  // Process notification
});
```

```dart
// Flutter
import 'package:agentbridge/push_notifications.dart';

// Request permission
final hasPermission = await PushNotifications.requestPermission();

// Register device token
await PushNotifications.registerDeviceToken(deviceToken);

// Handle notification
PushNotifications.onNotificationReceived((notification) {
  // Process notification
});
```

## Best Practices

### Performance Optimization

1. **Minimize Bridge Crossings**: In React Native, minimize the number of calls that cross the JavaScript-Native bridge
2. **Use Native Rendering**: Utilize platform-specific rendering optimizations when available
3. **Implement Virtualization**: For long lists, use virtualized list components
4. **Optimize Asset Loading**: Use appropriate image formats and lazy loading techniques
5. **Enable ProGuard/R8**: On Android, use code shrinking to reduce app size

### Battery Efficiency

1. **Throttle Updates**: Limit the frequency of UI updates and background operations
2. **Batch Network Requests**: Group multiple network requests to reduce radio usage
3. **Monitor Battery Level**: Adjust functionality based on battery level
4. **Use Efficient APIs**: Choose APIs that minimize battery usage

### Security Considerations

1. **Secure Storage**: Use platform-specific secure storage for sensitive data
2. **Network Security**: Implement TLS for all network communications
3. **Input Validation**: Validate all inputs, especially those from AI agents
4. **Permission Management**: Request only necessary permissions
5. **Code Obfuscation**: Implement code obfuscation to protect intellectual property

For detailed examples of mobile components, refer to the platform-specific guides:
- [Flutter Components](flutter/components.md)
- [React Native Components](react-native/components.md) 