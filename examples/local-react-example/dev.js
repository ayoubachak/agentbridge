const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Print header
console.log('======================================');
console.log('  AGENTBRIDGE LOCAL DEVELOPMENT TOOL');
console.log('======================================');
console.log('');

// Package locations
const PACKAGES = {
  core: path.resolve(__dirname, '../../packages/core'),
  react: path.resolve(__dirname, '../../packages/frameworks/react'),
  websocket: path.resolve(__dirname, '../../packages/communication/websocket')
};

// Get the command argument
const command = process.argv[2] || 'build-all';

/**
 * Execute a command in a specific directory
 */
function exec(cmd, cwd, { silent = false } = {}) {
  console.log(`🚀 Running "${cmd}" in ${path.basename(cwd)}...`);
  try {
    execSync(cmd, { 
      cwd, 
      stdio: silent ? 'ignore' : 'inherit', 
      env: { ...process.env, FORCE_COLOR: true } 
    });
    return true;
  } catch (error) {
    if (!silent) {
      console.error(`❌ Error running "${cmd}" in ${cwd}:`, error.message);
    }
    return false;
  }
}

/**
 * Build a specific package
 */
function buildPackage(packageDir, { clean = false } = {}) {
  console.log(`🔨 Building ${path.basename(packageDir)}...`);
  
  if (clean) {
    // Clean the dist directory
    const distDir = path.join(packageDir, 'dist');
    if (fs.existsSync(distDir)) {
      console.log(`🧹 Cleaning ${path.basename(packageDir)}/dist...`);
      fs.rmSync(distDir, { recursive: true, force: true });
    }
  }
  
  // Run build
  const success = exec('npm run build', packageDir);
  
  if (success) {
    console.log(`✅ ${path.basename(packageDir)} built successfully`);
  } else {
    console.error(`❌ ${path.basename(packageDir)} build failed`);
  }
  
  return success;
}

/**
 * Handle commands
 */
async function handleCommand() {
  switch (command) {
    case 'build-all':
      console.log('🔄 Building all packages...');
      buildPackage(PACKAGES.core);
      buildPackage(PACKAGES.react);
      buildPackage(PACKAGES.websocket);
      
      // Run local dependencies setup
      exec('node add-local-deps.js', __dirname);
      break;
      
    case 'rebuild':
      console.log('🔄 Rebuilding all packages (clean)...');
      buildPackage(PACKAGES.core, { clean: true });
      buildPackage(PACKAGES.react, { clean: true });
      buildPackage(PACKAGES.websocket, { clean: true });
      
      // Run local dependencies setup
      exec('node add-local-deps.js', __dirname);
      break;
      
    case 'clean':
      console.log('🧹 Cleaning all packages...');
      exec('npm run clean', PACKAGES.core, { silent: true });
      exec('npm run clean', PACKAGES.react, { silent: true });
      exec('npm run clean', PACKAGES.websocket, { silent: true });
      
      // Also clean example
      exec('npm run clean', __dirname, { silent: true });
      
      console.log('✅ Clean completed');
      break;
      
    case 'build-core':
      buildPackage(PACKAGES.core);
      exec('node add-local-deps.js', __dirname);
      break;
      
    case 'build-react':
      buildPackage(PACKAGES.react);
      exec('node add-local-deps.js', __dirname);
      break;
      
    case 'build-ws':
      buildPackage(PACKAGES.websocket);
      exec('node add-local-deps.js', __dirname);
      break;
      
    default:
      console.log(`Unknown command: ${command}`);
      console.log('Available commands:');
      console.log('  build-all   - Build all packages');
      console.log('  rebuild     - Clean and rebuild all packages');
      console.log('  clean       - Clean all packages');
      console.log('  build-core  - Build core package');
      console.log('  build-react - Build React framework package');
      console.log('  build-ws    - Build WebSocket package');
      break;
  }
}

// Execute command
handleCommand().catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 