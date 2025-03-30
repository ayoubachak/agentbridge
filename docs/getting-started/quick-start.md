# Quick Start

This guide will help you get started with AgentBridge by building a simple application that exposes functionality to AI agents. We'll cover the basics of initializing AgentBridge, registering functions, and registering UI components.

## Basic Setup

First, let's create a new project and install the required dependencies:

=== "React"
    ```bash
    npx create-react-app my-agentbridge-app
    cd my-agentbridge-app
    npm install @agentbridge/core @agentbridge/react
    ```

=== "Angular"
    ```bash
    ng new my-agentbridge-app
    cd my-agentbridge-app
    npm install @agentbridge/core @agentbridge/angular
    ```

=== "React Native"
    ```bash
    npx react-native init MyAgentBridgeApp
    cd MyAgentBridgeApp
    npm install @agentbridge/core @agentbridge/react-native
    ```

=== "Flutter"
    ```bash
    flutter create my_agentbridge_app
    cd my_agentbridge_app
    # Add agentbridge dependency to pubspec.yaml
    ```

## Initializing AgentBridge

Now let's initialize AgentBridge in our application:

=== "React"
    ```jsx
    // src/App.js
    import React from 'react';
    import { AgentBridgeProvider, createAgentBridge } from '@agentbridge/react';

    // Create an AgentBridge instance
    const bridge = createAgentBridge();

    function App() {
      return (
        <AgentBridgeProvider bridge={bridge}>
          <div className="App">
            <h1>My AgentBridge App</h1>
            {/* Your components go here */}
          </div>
        </AgentBridgeProvider>
      );
    }

    export default App;
    ```

=== "Angular"
    ```typescript
    // app.module.ts
    import { NgModule } from '@angular/core';
    import { BrowserModule } from '@angular/platform-browser';
    import { AgentBridgeModule } from '@agentbridge/angular';
    import { AppComponent } from './app.component';

    @NgModule({
      declarations: [AppComponent],
      imports: [
        BrowserModule,
        AgentBridgeModule.forRoot()
      ],
      providers: [],
      bootstrap: [AppComponent]
    })
    export class AppModule { }
    ```

=== "React Native"
    ```jsx
    // App.js
    import React from 'react';
    import { SafeAreaView, Text } from 'react-native';
    import { AgentBridgeProvider, createAgentBridge } from '@agentbridge/react-native';

    // Create an AgentBridge instance
    const bridge = createAgentBridge();

    function App() {
      return (
        <AgentBridgeProvider bridge={bridge}>
          <SafeAreaView>
            <Text>My AgentBridge App</Text>
            {/* Your components go here */}
          </SafeAreaView>
        </AgentBridgeProvider>
      );
    }

    export default App;
    ```

=== "Flutter"
    ```dart
    // lib/main.dart
    import 'package:flutter/material.dart';
    import 'package:agentbridge/agentbridge.dart';

    void main() {
      runApp(const MyApp());
    }

    class MyApp extends StatelessWidget {
      const MyApp({Key? key}) : super(key: key);

      @override
      Widget build(BuildContext context) {
        // Create an AgentBridge instance
        final bridge = AgentBridge();
        
        return MaterialApp(
          title: 'AgentBridge Demo',
          home: AgentBridgeProvider(
            bridge: bridge,
            child: Scaffold(
              appBar: AppBar(
                title: const Text('AgentBridge Demo'),
              ),
              body: const Center(
                child: Text('My AgentBridge App'),
              ),
            ),
          ),
        );
      }
    }
    ```

## Registering Functions

Now let's register some functions that AI agents can call:

=== "React"
    ```jsx
    // src/App.js
    import React, { useEffect } from 'react';
    import { AgentBridgeProvider, createAgentBridge, useAgentBridge } from '@agentbridge/react';

    const bridge = createAgentBridge();

    function FunctionRegistration() {
      const { registerFunction } = useAgentBridge();
      
      useEffect(() => {
        // Register a simple function
        registerFunction(
          'greet',
          'Greet a user by name',
          {
            type: 'object',
            properties: {
              name: { type: 'string' }
            },
            required: ['name']
          },
          async ({ name }) => {
            return { message: `Hello, ${name}!` };
          }
        );
      }, [registerFunction]);
      
      return null;
    }

    function App() {
      return (
        <AgentBridgeProvider bridge={bridge}>
          <FunctionRegistration />
          <div className="App">
            <h1>My AgentBridge App</h1>
          </div>
        </AgentBridgeProvider>
      );
    }

    export default App;
    ```

=== "Angular"
    ```typescript
    // app.component.ts
    import { Component, OnInit } from '@angular/core';
    import { AgentBridgeService } from '@agentbridge/angular';

    @Component({
      selector: 'app-root',
      template: `
        <div class="app">
          <h1>My AgentBridge App</h1>
        </div>
      `
    })
    export class AppComponent implements OnInit {
      constructor(private agentBridgeService: AgentBridgeService) {}
      
      ngOnInit() {
        // Register a simple function
        this.agentBridgeService.registerFunction(
          'greet',
          'Greet a user by name',
          {
            type: 'object',
            properties: {
              name: { type: 'string' }
            },
            required: ['name']
          },
          async ({ name }) => {
            return { message: `Hello, ${name}!` };
          }
        );
      }
    }
    ```

=== "Flutter"
    ```dart
    // lib/main.dart
    import 'package:flutter/material.dart';
    import 'package:agentbridge/agentbridge.dart';

    void main() {
      runApp(const MyApp());
    }

    class MyApp extends StatefulWidget {
      const MyApp({Key? key}) : super(key: key);

      @override
      _MyAppState createState() => _MyAppState();
    }

    class _MyAppState extends State<MyApp> {
      late final AgentBridge bridge;
      
      @override
      void initState() {
        super.initState();
        bridge = AgentBridge();
        
        // Register a simple function
        bridge.registerFunction(
          name: 'greet',
          description: 'Greet a user by name',
          handler: (params, context) async {
            final name = params['name'] as String;
            return { 'message': 'Hello, $name!' };
          },
        );
      }
      
      @override
      Widget build(BuildContext context) {
        return MaterialApp(
          title: 'AgentBridge Demo',
          home: AgentBridgeProvider(
            bridge: bridge,
            child: Scaffold(
              appBar: AppBar(
                title: const Text('AgentBridge Demo'),
              ),
              body: const Center(
                child: Text('My AgentBridge App'),
              ),
            ),
          ),
        );
      }
    }
    ```

## Registering UI Components

Now let's register some UI components that AI agents can interact with:

=== "React"
    ```jsx
    // src/App.js
    import React, { useState } from 'react';
    import { AgentBridgeProvider, createAgentBridge, useAgentComponent } from '@agentbridge/react';

    const bridge = createAgentBridge();

    function AgentButton() {
      const [clickCount, setClickCount] = useState(0);
      
      const buttonProps = useAgentComponent('main-button', 'button', {
        clickCount
      });
      
      const handleClick = () => {
        setClickCount(clickCount + 1);
      };
      
      return (
        <button
          {...buttonProps}
          onClick={handleClick}
          style={{ padding: '10px 20px', fontSize: '16px' }}
        >
          Click me! ({clickCount})
        </button>
      );
    }

    function App() {
      return (
        <AgentBridgeProvider bridge={bridge}>
          <div className="App">
            <h1>My AgentBridge App</h1>
            <AgentButton />
          </div>
        </AgentBridgeProvider>
      );
    }

    export default App;
    ```

=== "Angular"
    ```html
    <!-- app.component.html -->
    <div class="app">
      <h1>My AgentBridge App</h1>
      <agent-button agentId="main-button" (clicked)="handleButtonClick()">
        Click me! ({{ clickCount }})
      </agent-button>
    </div>
    ```

    ```typescript
    // app.component.ts
    import { Component } from '@angular/core';

    @Component({
      selector: 'app-root',
      templateUrl: './app.component.html'
    })
    export class AppComponent {
      clickCount = 0;
      
      handleButtonClick() {
        this.clickCount++;
      }
    }
    ```

=== "Flutter"
    ```dart
    // lib/main.dart
    import 'package:flutter/material.dart';
    import 'package:agentbridge/agentbridge.dart';

    void main() {
      runApp(const MyApp());
    }

    class MyApp extends StatefulWidget {
      const MyApp({Key? key}) : super(key: key);

      @override
      _MyAppState createState() => _MyAppState();
    }

    class _MyAppState extends State<MyApp> {
      late final AgentBridge bridge;
      int clickCount = 0;
      
      @override
      void initState() {
        super.initState();
        bridge = AgentBridge();
      }
      
      void handleButtonClick() {
        setState(() {
          clickCount++;
        });
      }
      
      @override
      Widget build(BuildContext context) {
        return MaterialApp(
          title: 'AgentBridge Demo',
          home: AgentBridgeProvider(
            bridge: bridge,
            child: Scaffold(
              appBar: AppBar(
                title: const Text('AgentBridge Demo'),
              ),
              body: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('My AgentBridge App'),
                    const SizedBox(height: 20),
                    AgentButton(
                      agentId: 'main-button',
                      onPressed: handleButtonClick,
                      child: Text('Click me! ($clickCount)'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      }
    }
    ```

## Testing with an AI Agent

Now that we've set up our application with AgentBridge, let's test it with an AI agent. For this example, we'll use the console to simulate an AI agent calling our functions and interacting with our components.

=== "JavaScript"
    ```javascript
    // Open the browser console and run:
    
    // Get the AgentBridge instance
    const bridge = window._agentBridge;
    
    // Call the greet function
    bridge.callFunction('greet', { name: 'John' })
      .then(result => console.log(result));
    // Output: { success: true, data: { message: "Hello, John!" }, ... }
    
    // Get all registered components
    bridge.callFunction('getComponents', {})
      .then(result => console.log(result));
    // Output: Information about registered components
    
    // Trigger a click on the button
    bridge.callFunction('triggerComponentEvent', {
      componentId: 'main-button',
      event: 'click'
    })
      .then(result => console.log(result));
    // This will increment the click counter
    ```

## Next Steps

Congratulations! You've built your first application with AgentBridge. Here are some next steps to explore:

1. Learn about the [Core API](../core/overview.md) in more detail
2. Explore the UI component APIs for your framework:
   - [React Components](../web/react/components.md)
   - [Angular Components](../web/angular/components.md)
   - [Flutter Components](../mobile/flutter/components.md)
3. Learn about [authentication and permissions](../advanced/authentication.md)
4. Explore [error handling](../advanced/error-handling.md) strategies