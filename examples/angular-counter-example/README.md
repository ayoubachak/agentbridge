# Angular Counter Example - AgentBridge

A simple Angular counter application that demonstrates AgentBridge integration. This example shows how AI agents can discover and control Angular components through a WebSocket connection.

## 🏗️ Architecture

This example validates the **framework-agnostic** architecture of AgentBridge:

- ✅ Uses the same `@agentbridge/core` package as React
- ✅ Connects to the same WebSocket server (ws://localhost:8080)
- ✅ Uses the same message protocol
- ✅ Can be controlled by the same agent client
- ✅ Works alongside the React example simultaneously

## 🚀 Running the Example

### Prerequisites

1. Make sure the custom server is running:
```bash
cd ../simple-counter-example/server
node index.js
```

### Start the Angular App

```bash
npm start
```

The app will open at `http://localhost:4200`

### Test with Agent Client

In a separate terminal:

```bash
cd ../simple-counter-example/server
node agent-client.js
```

Then try these commands:
- `list` - See all registered capabilities
- `increment` - Increment the counter
- `decrement` - Decrement the counter
- `reset` - Reset to zero
- `set 42` - Set to a specific value

## 📦 Key Components

### AgentBridgeService
`src/app/services/agent-bridge.service.ts`

- Initializes AgentBridge and WebSocket adapter
- Manages connection status with signals
- Provides methods for registering components and functions
- Uses Angular dependency injection

### CounterComponent
`src/app/components/counter.component.ts`

- Standalone Angular component with signals
- Registers itself with AgentBridge on init
- Exposes 4 actions: increment, decrement, reset, setTo
- Unregisters on destroy for proper cleanup

### App Component
`src/app/app.ts`

- Root component showing connection status
- Displays registered component/function counts
- Uses computed signals for reactive UI updates

## 🎨 Modern Angular Features

This example showcases:

- ✅ **Standalone Components** - No need for NgModule
- ✅ **Signals** - Angular's new reactivity primitive
- ✅ **Computed Signals** - Derived reactive state
- ✅ **Dependency Injection** - Service-based architecture
- ✅ **TypeScript** - Full type safety with Zod schemas

## 🔗 Cross-Framework Testing

Run both React and Angular examples simultaneously:

**Terminal 1 - Server:**
```bash
cd ../simple-counter-example/server
node index.js
```

**Terminal 2 - React App:**
```bash
cd ../simple-counter-example
npm run dev
# Opens on http://localhost:5173
```

**Terminal 3 - Angular App:**
```bash
cd ../angular-counter-example
npm start
# Opens on http://localhost:4200
```

**Terminal 4 - Agent Client:**
```bash
cd ../simple-counter-example/server
node agent-client.js
```

Now when you type `list` in the agent client, you'll see capabilities from **both frameworks**! 🎉

The agent can control both apps simultaneously, proving the architecture is truly framework-agnostic.

## 📝 Registration Flow

1. Angular app starts
2. `AgentBridgeService` constructor creates WebSocket connection
3. WebSocket connects to server at ws://localhost:8080
4. `CounterComponent` mounts
5. Component registers with AgentBridge in `ngOnInit()`
6. Registration message sent to server (queued if not connected yet)
7. When connected, queued messages are flushed
8. Server receives and stores capabilities
9. Agent client can query and see the component
10. Agent client can invoke actions on the component

## 🛠️ Technology Stack

- **Angular 20** - Latest version with signals
- **TypeScript 5.9** - Type safety
- **RxJS 7.8** - Reactive extensions (minimal use due to signals)
- **Zod** - Schema validation
- **AgentBridge Core** - Framework-agnostic agent bridge

## 🎯 Key Differences from React

| Feature | React Example | Angular Example |
|---------|---------------|-----------------|
| State Management | `useState` hook | `signal()` |
| Side Effects | `useEffect` hook | `ngOnInit/ngOnDestroy` |
| Reactivity | Virtual DOM | Signals + Zone.js |
| Components | Functional | Class-based standalone |
| Dependency Injection | Context API | Angular DI |
| Cleanup | Effect return | `ngOnDestroy` lifecycle |

## 🔍 Debugging

Enable debug logging in the browser console to see:
- WebSocket connection events
- Component registration
- Action invocations
- Message queue operations

The AgentBridge service has `debug: true` enabled by default.

## ✅ Verification

To verify everything is working:

1. Check connection status badge (should be green)
2. See component count = 1
3. Click buttons - they should work
4. In agent client, type `list` - should show "main-counter"
5. In agent client, try `increment` - counter should update in browser

## 🌟 What This Demonstrates

This example proves that:

1. **Core is Framework-Agnostic**: Same `@agentbridge/core` works in React and Angular
2. **Protocol is Universal**: Both frameworks use the same WebSocket messages
3. **Server is Shared**: One server handles multiple framework clients
4. **Components are Discoverable**: Agents see capabilities regardless of framework
5. **Actions are Invocable**: Agents can control UI components from any framework

This is the **ultimate validation** of AgentBridge's architecture! 🚀
