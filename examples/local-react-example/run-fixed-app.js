/**
 * Script to run the example app with React dependency fixes
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Main function
async function main() {
  console.log('\n🛠️  REBUILDING AND RUNNING AGENTBRIDGE APP WITH FIXES\n');
  
  // Step 1: Rebuild React framework to apply our code changes
  console.log('📦 Rebuilding React framework...');
  try {
    execSync('node dev.js build-react', { stdio: 'inherit' });
    console.log('✅ React framework rebuilt successfully\n');
  } catch (error) {
    console.error('❌ Error rebuilding React framework:', error.message);
    process.exit(1);
  }
  
  // Step 2: Run the improved React dependency fixer
  console.log('🔍 Running enhanced React dependency fixer...');
  try {
    execSync('node fix-react-deps.js', { stdio: 'inherit' });
    console.log('✅ React dependencies fixed successfully\n');
  } catch (error) {
    console.error('❌ Error fixing React dependencies:', error.message);
    console.log('Continuing anyway...');
  }
  
  // Step 3: Find an available port
  let port = 3000;
  try {
    const netstat = process.platform === 'win32'
      ? 'netstat -a -n -o | findstr LISTENING'
      : 'netstat -tulpn | grep LISTEN';
    
    const output = execSync(netstat, { encoding: 'utf8' });
    const usedPorts = output.split('\n')
      .map(line => {
        const match = line.match(/:(\d+)/);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter(port => port !== null);
    
    while (usedPorts.includes(port)) {
      port++;
    }
  } catch (error) {
    console.warn('Warning: Could not auto-detect available port:', error.message);
    port = 3001; // Fallback
  }
  
  console.log(`🔍 Using port ${port} for the app\n`);
  
  // Step 4: Create or update .env file with all necessary settings
  const envPath = path.join(__dirname, '.env');
  const envContent = `
PORT=${port}
BROWSER=none
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=false
FAST_REFRESH=false
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Created .env file with optimization settings\n`);
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
  }
  
  // Step 5: Run the app with the enhanced environment
  console.log(`🚀 Starting app on port ${port}...`);
  
  try {
    const env = Object.assign({}, process.env, {
      PORT: port.toString(),
      BROWSER: 'none',
      SKIP_PREFLIGHT_CHECK: 'true',
      GENERATE_SOURCEMAP: 'false',
      FAST_REFRESH: 'false'
    });
    
    // We need to start the app using a child process rather than execSync to avoid blocking
    const { spawn } = require('child_process');
    console.log('⚡ Starting React app (press Ctrl+C to stop)...\n');
    
    const npmStart = spawn('npm', ['start'], {
      stdio: 'inherit',
      env,
      shell: true
    });
    
    npmStart.on('error', (error) => {
      console.error('❌ Error starting app:', error.message);
      process.exit(1);
    });
    
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping app...');
      npmStart.kill('SIGINT');
      process.exit(0);
    });
    
    // We don't wait for the child process to finish since it runs continuously
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