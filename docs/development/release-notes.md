# Release Notes

## Version 0.2.0 (Latest)

**Release Date**: June 15, 2023

### Breaking Changes

- Reorganized package structure for better maintainability
- Renamed packages to follow a more consistent pattern
- Removed `@agentbridge/comm-websocket` package (use `@agentbridge/server` directly)

### New Features

- Added support for TypeScript 5.0
- Improved error handling with detailed error messages
- Enhanced type definitions for better type safety
- Added new hooks for React components
- Improved performance with optimized component rerenders
- Enhanced Angular dependency injection patterns
- New decorators for Angular component and function registration
- Improved native component support for React Native
- Reduced bundle size for React Native
- Added support for Flutter 3.10

### Bug Fixes

- Fixed reconnection issues with Ably provider
- Resolved race conditions in component registration
- Fixed memory leaks in React Native implementation
- Improved error handling in WebSocket connections
- Fixed type definitions for function parameters

### Documentation

- Comprehensive migration guide from v0.1.0 to v0.2.0
- Updated API reference with new methods and properties
- Added new examples for all supported frameworks
- Improved security guidelines
- Enhanced troubleshooting section

## Version 0.1.0 (Initial Release)

**Release Date**: January 10, 2023

### Features

- Initial release of AgentBridge framework
- Support for React, Angular, React Native, and Flutter
- Pub/Sub communication with Ably, Firebase, Pusher, and Supabase
- WebSocket communication for self-hosted mode
- Component registry for UI component discovery
- Function registry for callable functions
- Type system for parameter validation
- Security features for authentication and authorization 