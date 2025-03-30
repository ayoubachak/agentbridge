/**
 * Generate placeholder files for the new package structure
 * This script creates basic structure and placeholder files for the new package structure
 */

const fs = require('fs');
const path = require('path');

// Directory structure to create
const packageStructure = {
  'packages/core': {
    files: [
      { path: 'README.md', content: '# AgentBridge Core\n\nCore package for the AgentBridge framework.\n' },
      { path: 'package.json', content: JSON.stringify({
        name: '@agentbridge/core',
        version: '0.2.0',
        description: 'Core library for AgentBridge framework',
        main: 'dist/index.js',
        types: 'dist/index.d.ts',
        scripts: {
          build: 'tsc',
          test: 'jest',
          lint: 'eslint src --ext .ts,.tsx',
          clean: 'rimraf dist'
        },
        keywords: ['ai', 'agent', 'bridge', 'frontend', 'ui'],
        author: 'AgentBridge Team',
        license: 'MIT',
        publishConfig: {
          access: 'public'
        }
      }, null, 2) },
      { path: 'src/index.ts', content: "export * from './AgentBridge';\nexport * from './types';\n" },
      { path: 'src/types.ts', content: "export interface AgentBridgeOptions {\n  logging?: boolean;\n  provider?: any;\n}\n" },
      { path: 'src/AgentBridge.ts', content: "import { AgentBridgeOptions } from './types';\n\nexport class AgentBridge {\n  constructor(options?: AgentBridgeOptions) {\n    // Implementation\n  }\n}\n" }
    ]
  },
  'packages/frameworks/react': {
    files: [
      { path: 'README.md', content: '# AgentBridge React SDK\n\nReact integration for the AgentBridge framework.\n' },
      { path: 'package.json', content: JSON.stringify({
        name: '@agentbridge/react',
        version: '0.2.0',
        description: 'React SDK for AgentBridge framework',
        main: 'dist/index.js',
        types: 'dist/index.d.ts',
        scripts: {
          build: 'tsc',
          test: 'jest',
          lint: 'eslint src --ext .ts,.tsx',
          clean: 'rimraf dist'
        },
        peerDependencies: {
          react: '>=16.8.0',
          '@agentbridge/core': '^0.2.0'
        },
        keywords: ['react', 'ai', 'agent', 'bridge', 'frontend', 'ui'],
        author: 'AgentBridge Team',
        license: 'MIT',
        publishConfig: {
          access: 'public'
        }
      }, null, 2) },
      { path: 'src/index.ts', content: "export * from './AgentBridgeProvider';\nexport * from './hooks';\n" }
    ]
  }
};

// Create directory if it doesn't exist
const createDirIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
};

// Create a file with content
const createFile = (filePath, content) => {
  // Only create if it doesn't exist to avoid overwriting
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`Created file: ${filePath}`);
  } else {
    console.log(`File already exists (skipping): ${filePath}`);
  }
};

// Generate placeholder files for a package
const generatePackagePlaceholders = (packagePath, packageConfig) => {
  createDirIfNotExists(packagePath);
  
  if (packageConfig.files) {
    packageConfig.files.forEach(file => {
      const filePath = path.join(packagePath, file.path);
      const fileDir = path.dirname(filePath);
      
      createDirIfNotExists(fileDir);
      createFile(filePath, file.content);
    });
  }
};

// Main function to generate all placeholders
const generatePlaceholders = () => {
  console.log('🚀 Generating placeholder files for AgentBridge packages...');
  
  for (const [packagePath, packageConfig] of Object.entries(packageStructure)) {
    generatePackagePlaceholders(packagePath, packageConfig);
  }
  
  console.log('✅ Done generating placeholder files!');
};

// Run the script
generatePlaceholders(); 