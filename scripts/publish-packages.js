const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Package definitions
const packages = [
  {
    name: '@agentbridge/core',
    path: 'packages/core',
    type: 'npm'
  },
  {
    name: '@agentbridge/react',
    path: 'packages/web/react',
    type: 'npm'
  },
  {
    name: '@agentbridge/angular',
    path: 'packages/web/angular',
    type: 'npm'
  },
  {
    name: '@agentbridge/react-native',
    path: 'packages/mobile/react-native',
    type: 'npm'
  },
  {
    name: 'agentbridge',
    path: 'packages/mobile/flutter',
    type: 'flutter'
  }
];

// Main function
async function publishPackages() {
  console.log('🚀 AgentBridge Package Publisher\n');
  
  // Check if user is logged in to npm
  try {
    execSync('npm whoami', { stdio: 'pipe' });
    console.log('✅ You are logged in to npm');
  } catch (error) {
    console.log('❌ You are not logged in to npm. Please run "npm login" first.');
    process.exit(1);
  }
  
  // Build all packages first
  console.log('\n📦 Building all packages...');
  
  try {
    console.log('Building JavaScript packages...');
    execSync('npm run build:js', { stdio: 'inherit' });
    
    console.log('Building Flutter package...');
    execSync('cd packages/mobile/flutter && flutter pub get && flutter build', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Error building packages:', error.message);
    process.exit(1);
  }
  
  // Ask which packages to publish
  const response = await askQuestion('\nWhich packages would you like to publish? (all, js, flutter, or comma-separated package names): ');
  
  let selectedPackages = [];
  
  if (response.toLowerCase() === 'all') {
    selectedPackages = packages;
  } else if (response.toLowerCase() === 'js') {
    selectedPackages = packages.filter(pkg => pkg.type === 'npm');
  } else if (response.toLowerCase() === 'flutter') {
    selectedPackages = packages.filter(pkg => pkg.type === 'flutter');
  } else {
    const packageNames = response.split(',').map(name => name.trim());
    selectedPackages = packages.filter(pkg => packageNames.includes(pkg.name));
  }
  
  if (selectedPackages.length === 0) {
    console.log('❌ No valid packages selected. Exiting.');
    process.exit(1);
  }
  
  console.log(`\nSelected packages to publish: ${selectedPackages.map(pkg => pkg.name).join(', ')}`);
  
  const confirmPublish = await askQuestion('Are you sure you want to publish these packages? (yes/no): ');
  
  if (confirmPublish.toLowerCase() !== 'yes') {
    console.log('❌ Publishing cancelled.');
    process.exit(0);
  }

  // Publish each selected package
  for (const pkg of selectedPackages) {
    console.log(`\n📦 Publishing ${pkg.name}...`);
    
    try {
      if (pkg.type === 'npm') {
        const packageDir = path.join(process.cwd(), pkg.path);
        process.chdir(packageDir);
        
        // Check if the package already exists
        try {
          const npmInfo = execSync(`npm view ${pkg.name} version`, { stdio: 'pipe' }).toString().trim();
          console.log(`Current version on npm: ${npmInfo}`);
          
          const localInfo = JSON.parse(fs.readFileSync('package.json', 'utf8'));
          console.log(`Local version: ${localInfo.version}`);
          
          if (npmInfo === localInfo.version) {
            const answer = await askQuestion(`Warning: Version ${localInfo.version} already exists. Publish anyway? (yes/no): `);
            if (answer.toLowerCase() !== 'yes') {
              console.log(`Skipping ${pkg.name}.`);
              process.chdir(process.cwd());
              continue;
            }
          }
        } catch (e) {
          console.log(`Package ${pkg.name} does not exist on npm yet.`);
        }
        
        console.log(`Publishing ${pkg.name}...`);
        execSync('npm publish --access public', { stdio: 'inherit' });
        console.log(`✅ Successfully published ${pkg.name}`);
      } else if (pkg.type === 'flutter') {
        const packageDir = path.join(process.cwd(), pkg.path);
        process.chdir(packageDir);
        
        console.log(`Publishing ${pkg.name}...`);
        execSync('flutter pub publish --force', { stdio: 'inherit' });
        console.log(`✅ Successfully published ${pkg.name}`);
      }
      
      process.chdir(process.cwd()); // Return to root dir
    } catch (error) {
      console.error(`❌ Error publishing ${pkg.name}:`, error.message);
    }
  }
  
  console.log('\n✅ Publishing completed!');
  rl.close();
}

// Helper function to ask a question
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Run the main function
publishPackages().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 