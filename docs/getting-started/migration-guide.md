# Migrating from v0.1.0 to v0.2.0

This guide helps you migrate your AgentBridge implementation from v0.1.0 to v0.2.0, which introduces a new package structure and naming convention.

## Package Structure Changes

In v0.2.0, we've reorganized the package structure to improve maintainability and clarity:

| v0.1.0 Structure | v0.2.0 Structure |
|-----------------|-----------------|
| `packages/web/react` | `packages/frameworks/react` |
| `packages/web/angular` | `packages/frameworks/angular` |
| `packages/mobile/react-native` | `packages/frameworks/react-native` |
| `packages/mobile/flutter` | `packages/frameworks/flutter` |
| `packages/pubsub-*` | `packages/providers/*` |
| `packages/comm-websocket` | Removed - Use `@agentbridge/server` directly |

## Package Naming Changes

Package names have also been updated to follow a more consistent pattern:

| v0.1.0 Package Name | v0.2.0 Package Name |
|---------------------|---------------------|
| `@agentbridge/pubsub-ably` | `@agentbridge/provider-ably` |
| `@agentbridge/pubsub-firebase` | `@agentbridge/provider-firebase` |
| `@agentbridge/pubsub-pusher` | `@agentbridge/provider-pusher` |
| `@agentbridge/pubsub-supabase` | `@agentbridge/provider-supabase` |
| `@agentbridge/comm-websocket` | Removed - Use `@agentbridge/server` directly |

## Updating Dependencies

Update your package.json dependencies:

```diff
{
  "dependencies": {
    "@agentbridge/core": "^0.2.0",
-   "@agentbridge/react": "^0.1.0",
+   "@agentbridge/react": "^0.2.0",
-   "@agentbridge/pubsub-ably": "^0.1.0",
+   "@agentbridge/provider-ably": "^0.2.0",
    "ably": "^1.2.48"
  }
}
```

## Updating Import Statements

Update your import statements to use the new package names:

```diff
import { AgentBridgeProvider } from '@agentbridge/react';
- import { AblyProvider } from '@agentbridge/pubsub-ably';
+ import { AblyProvider } from '@agentbridge/provider-ably';

// Initialize a provider
const ablyProvider = new AblyProvider({
  apiKey: 'your-api-key'
});
```

## Self-Hosted Mode Changes

If you were using the WebSocket communication mode, switch to using the server package directly:

```diff
// Frontend
- import { WebSocketProvider } from '@agentbridge/comm-websocket';
+ // No specific provider needed for frontend with self-hosted mode
  import { AgentBridgeProvider } from '@agentbridge/react';

// Backend
  import { AgentBridgeServer } from '@agentbridge/server';
```

## API Changes

The core API remains largely the same, with improvements to type definitions and error handling.

## Framework-Specific Changes

### React

- Updated hooks for improved TypeScript support
- Better performance with component rerenders

### Angular

- Enhanced dependency injection patterns
- New decorators for component and function registration

### React Native

- Improved native component support
- Reduced bundle size

## Next Steps

After migrating to v0.2.0:

1. Test your application thoroughly to ensure all functionality works as expected
2. Update your documentation to reflect the new package names
3. Check the [Release Notes](../development/release-notes.md) for detailed information about all changes

If you encounter any issues during migration, please [open an issue](https://github.com/ayoubachak/agentbridge/issues) on our GitHub repository. 