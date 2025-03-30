const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

// Configuration for examples
const config = {
  react: {
    name: 'agentbridge-react-example',
    command: 'npx create-react-app agentbridge-react-example --template typescript',
    packageNames: ['@agentbridge/core', '@agentbridge/react'],
    setupFiles: {
      'src/AgentBridgeDemo.tsx': `
import React, { useRef, useEffect } from 'react';
import { AgentBridge } from '@agentbridge/core';
import { ReactAdapter } from '@agentbridge/react';

const agentBridge = new AgentBridge();
const reactAdapter = new ReactAdapter(agentBridge);

// Register a demo function
agentBridge.registerFunction({
  name: 'greeting',
  description: 'Generate a personalized greeting',
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'User name' },
      formal: { type: 'boolean', description: 'Use formal greeting' }
    },
    required: ['name']
  },
  handler: async (params) => {
    const { name, formal = false } = params;
    return formal 
      ? \`Good day, \${name}. How may I assist you?\` 
      : \`Hey \${name}! What's up?\`;
  }
});

// Function to demonstrate calling our registered function
const callGreeting = async (name, formal = false) => {
  const result = await agentBridge.executeFunction('greeting', { name, formal });
  console.log('Greeting result:', result);
  return result;
};

function AgentBridgeDemo() {
  const rootRef = useRef(null);
  const [greeting, setGreeting] = React.useState('');
  
  useEffect(() => {
    if (rootRef.current) {
      reactAdapter.initialize(rootRef.current);
      console.log('AgentBridge initialized with React adapter');
    }
  }, []);
  
  const handleClick = async () => {
    const result = await callGreeting('User', true);
    setGreeting(result);
  };
  
  return (
    <div ref={rootRef}>
      <h2>AgentBridge React Demo</h2>
      <button onClick={handleClick}>Generate Greeting</button>
      {greeting && <p>{greeting}</p>}
    </div>
  );
}

export default AgentBridgeDemo;
`,
      'src/App.tsx': `
import React from 'react';
import './App.css';
import AgentBridgeDemo from './AgentBridgeDemo';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AgentBridge React Example</h1>
        <AgentBridgeDemo />
      </header>
    </div>
  );
}

export default App;
`
    }
  },
  angular: {
    name: 'agentbridge-angular-example',
    command: 'npx @angular/cli new agentbridge-angular-example --style css --routing false --skip-tests',
    packageNames: ['@agentbridge/core', '@agentbridge/angular'],
    setupFiles: {
      'src/app/agent-bridge-demo/agent-bridge-demo.component.ts': `
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AgentBridge } from '@agentbridge/core';
import { AngularAdapter } from '@agentbridge/angular';

@Component({
  selector: 'app-agent-bridge-demo',
  template: \`
    <div #rootElement>
      <h2>AgentBridge Angular Demo</h2>
      <button (click)="generateGreeting()">Generate Greeting</button>
      <p *ngIf="greeting">{{ greeting }}</p>
    </div>
  \`,
  styles: []
})
export class AgentBridgeDemoComponent implements OnInit {
  @ViewChild('rootElement', { static: true }) rootElement!: ElementRef;
  greeting = '';
  private agentBridge = new AgentBridge();
  private angularAdapter = new AngularAdapter(this.agentBridge);

  ngOnInit(): void {
    // Register a demo function
    this.agentBridge.registerFunction({
      name: 'greeting',
      description: 'Generate a personalized greeting',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'User name' },
          formal: { type: 'boolean', description: 'Use formal greeting' }
        },
        required: ['name']
      },
      handler: async (params: any) => {
        const { name, formal = false } = params;
        return formal 
          ? \`Good day, \${name}. How may I assist you?\` 
          : \`Hey \${name}! What's up?\`;
      }
    });

    // Initialize the adapter with the root element
    this.angularAdapter.initialize(this.rootElement.nativeElement);
    console.log('AgentBridge initialized with Angular adapter');
  }

  async generateGreeting(): Promise<void> {
    const result = await this.agentBridge.executeFunction('greeting', { 
      name: 'User', 
      formal: true 
    });
    this.greeting = result;
    console.log('Greeting result:', result);
  }
}
`,
      'src/app/app.module.ts': `
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AgentBridgeDemoComponent } from './agent-bridge-demo/agent-bridge-demo.component';

@NgModule({
  declarations: [
    AppComponent,
    AgentBridgeDemoComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
`,
      'src/app/app.component.ts': `
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <div style="text-align:center">
      <h1>AgentBridge Angular Example</h1>
      <app-agent-bridge-demo></app-agent-bridge-demo>
    </div>
  \`,
  styles: []
})
export class AppComponent {
  title = 'agentbridge-angular-example';
}
`
    }
  },
  reactNative: {
    name: 'agentbridge-react-native-example',
    command: 'npx react-native init agentbridgeReactNativeExample --template react-native-template-typescript',
    packageNames: ['@agentbridge/core', '@agentbridge/react-native'],
    setupFiles: {
      'src/AgentBridgeDemo.tsx': `
import React, { useRef, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AgentBridge } from '@agentbridge/core';
import { ReactNativeAdapter } from '@agentbridge/react-native';

const agentBridge = new AgentBridge();
const reactNativeAdapter = new ReactNativeAdapter(agentBridge);

// Register a demo function
agentBridge.registerFunction({
  name: 'greeting',
  description: 'Generate a personalized greeting',
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'User name' },
      formal: { type: 'boolean', description: 'Use formal greeting' }
    },
    required: ['name']
  },
  handler: async (params) => {
    const { name, formal = false } = params;
    return formal 
      ? \`Good day, \${name}. How may I assist you?\` 
      : \`Hey \${name}! What's up?\`;
  }
});

const AgentBridgeDemo = () => {
  const rootRef = useRef(null);
  const [greeting, setGreeting] = React.useState('');

  useEffect(() => {
    if (rootRef.current) {
      reactNativeAdapter.initialize(rootRef.current);
      console.log('AgentBridge initialized with React Native adapter');
    }
  }, []);

  const handlePress = async () => {
    const result = await agentBridge.executeFunction('greeting', { 
      name: 'User', 
      formal: true 
    });
    setGreeting(result);
  };

  return (
    <View ref={rootRef} style={styles.container}>
      <Text style={styles.title}>AgentBridge React Native Demo</Text>
      <Button 
        title="Generate Greeting" 
        onPress={handlePress} 
      />
      {greeting ? <Text style={styles.greeting}>{greeting}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  greeting: {
    marginTop: 20,
    fontSize: 16,
  },
});

export default AgentBridgeDemo;
`,
      'App.tsx': `
import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import AgentBridgeDemo from './src/AgentBridgeDemo';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <AgentBridgeDemo />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
});

export default App;
`
    }
  },
  flutter: {
    name: 'agentbridge_flutter_example',
    command: 'flutter create agentbridge_flutter_example',
    packageNames: ['agentbridge'],
    setupFiles: {
      'lib/main.dart': `
import 'package:flutter/material.dart';
import 'package:agentbridge/agentbridge.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AgentBridge Flutter Example',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const AgentBridgeDemo(),
    );
  }
}

class AgentBridgeDemo extends StatefulWidget {
  const AgentBridgeDemo({Key? key}) : super(key: key);

  @override
  _AgentBridgeDemoState createState() => _AgentBridgeDemoState();
}

class _AgentBridgeDemoState extends State<AgentBridgeDemo> {
  final AgentBridge agentBridge = AgentBridge.instance;
  String greeting = '';

  @override
  void initState() {
    super.initState();
    
    // Register demo function
    agentBridge.registerFunction({
      'name': 'greeting',
      'description': 'Generate a personalized greeting',
      'parameters': {
        'type': 'object',
        'properties': {
          'name': {'type': 'string', 'description': 'User name'},
          'formal': {'type': 'boolean', 'description': 'Use formal greeting'}
        },
        'required': ['name']
      },
      'handler': (params, context) async {
        final name = params['name'];
        final formal = params['formal'] ?? false;
        
        return formal
          ? 'Good day, \$name. How may I assist you?'
          : 'Hey \$name! What\\'s up?';
      }
    });
    
    print('AgentBridge initialized with Flutter adapter');
  }

  Future<void> generateGreeting() async {
    final result = await agentBridge.executeFunction('greeting', {
      'name': 'User',
      'formal': true
    });
    
    setState(() {
      greeting = result;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AgentBridge Flutter Demo'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const Text(
              'AgentBridge Flutter Demo',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: generateGreeting,
              child: const Text('Generate Greeting'),
            ),
            if (greeting.isNotEmpty) ...[
              const SizedBox(height: 20),
              Text(
                greeting,
                style: const TextStyle(fontSize: 16),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
`,
      'pubspec.yaml': `
name: agentbridge_flutter_example
description: A Flutter example app for AgentBridge.
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: ">=2.17.0 <3.0.0"

dependencies:
  flutter:
    sdk: flutter
  agentbridge:
    path: ../packages/mobile/flutter
  cupertino_icons: ^1.0.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.0

flutter:
  uses-material-design: true
`
    }
  }
};

// Main function to create examples
async function createExamples() {
  const examplesDir = path.join(process.cwd(), 'examples');
  fs.ensureDirSync(examplesDir);
  
  // Install the packages first if they're not already built
  console.log('Building packages...');
  try {
    execSync('npm run build:js', { stdio: 'inherit' });
    execSync('cd packages/mobile/flutter && flutter build', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error building packages:', error);
    process.exit(1);
  }

  // Create examples for each platform
  for (const [platform, platformConfig] of Object.entries(config)) {
    console.log(`\nCreating ${platform} example...`);
    const exampleDir = path.join(examplesDir, platformConfig.name);
    
    // Skip if already exists
    if (fs.existsSync(exampleDir)) {
      console.log(`Example for ${platform} already exists, skipping...`);
      continue;
    }
    
    // Create the example app using the platform's scaffolding tool
    try {
      process.chdir(examplesDir);
      execSync(platformConfig.command, { stdio: 'inherit' });
      process.chdir(exampleDir);
      
      // Link local packages (for JS packages)
      if (platform !== 'flutter') {
        for (const packageName of platformConfig.packageNames) {
          const packagePath = path.join(process.cwd(), '..', '..', 'packages', 
            packageName.includes('core') ? 'core' : 
            packageName.includes('react-native') ? 'mobile/react-native' : 
            `web/${packageName.split('/')[1]}`);
          
          console.log(`Linking ${packageName} from ${packagePath}`);
          execSync(`npm link ${packagePath}`, { stdio: 'inherit' });
        }
      }
      
      // Create demo files
      for (const [filePath, content] of Object.entries(platformConfig.setupFiles)) {
        const fullPath = path.join(exampleDir, filePath);
        fs.ensureDirSync(path.dirname(fullPath));
        fs.writeFileSync(fullPath, content.trim());
        console.log(`Created ${filePath}`);
      }
      
      // Additional setup commands if needed
      if (platform === 'angular') {
        execSync('npm install @angular/material', { stdio: 'inherit' });
      }
      
      console.log(`✅ ${platform} example created successfully!`);
    } catch (error) {
      console.error(`Error creating ${platform} example:`, error);
    }
  }
  
  // Return to project root
  process.chdir(path.join(process.cwd(), '..', '..'));
  console.log('\nAll examples created successfully!');
}

createExamples().catch(console.error); 