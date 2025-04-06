/**
 * Script to run the example app with the right port and environment
 */
const { execSync } = require('child_process');
const path = require('path');

// Find an available port
function findAvailablePort(startingPort = 3000) {
  const netstat = process.platform === 'win32' 
    ? 'netstat -a -n -o | findstr LISTENING'
    : 'netstat -tulpn | grep LISTEN';
  
  try {
    const output = execSync(netstat, { encoding: 'utf8' });
    const usedPorts = output.split('\n')
      .map(line => {
        const match = line.match(/:(\d+)/);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter(port => port !== null);
    
    let port = startingPort;
    while (usedPorts.includes(port)) {
      port++;
    }
    
    return port;
  } catch (error) {
    console.error('Error finding available port:', error.message);
    return startingPort + 1; // Use next port as fallback
  }
}

// Main execution
async function main() {
  console.log('\n🚀 Running AgentBridge Example App\n');
  
  // Step 1: Fix React dependencies
  console.log('📦 Fixing React dependencies...');
  try {
    execSync('node fix-react-deps.js', { stdio: 'inherit' });
    console.log('✅ React dependencies fixed successfully\n');
  } catch (error) {
    console.error('❌ Error fixing React dependencies:', error.message);
    console.log('Continuing anyway...');
  }
  
  // Step 2: Find an available port
  const port = findAvailablePort(3000);
  console.log(`🔍 Using port ${port} for the app\n`);
  
  // Step 3: Run the app with the specified port
  console.log(`🚀 Starting app on port ${port}...`);
  
  try {
    const env = Object.assign({}, process.env, {
      PORT: port.toString(),
      BROWSER: 'none', // Don't open browser automatically
      SKIP_PREFLIGHT_CHECK: 'true',
      GENERATE_SOURCEMAP: 'false'
    });
    
    execSync('npm start', {
      stdio: 'inherit',
      env
    });
  } catch (error) {
    console.error('❌ Error starting app:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 