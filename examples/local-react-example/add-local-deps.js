const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to node_modules directory
const nodeModulesPath = path.resolve(__dirname, 'node_modules');

// Create @agentbridge directory structure if it doesn't exist
const agentbridgePath = path.join(nodeModulesPath, '@agentbridge');
if (!fs.existsSync(agentbridgePath)) {
  fs.mkdirSync(agentbridgePath, { recursive: true });
}

// Define the local packages to link
const localPackages = [
  {
    name: 'core',
    source: '../../packages/core',
    target: path.join(agentbridgePath, 'core'),
    buildRequired: true
  },
  {
    name: 'react',
    source: '../../packages/frameworks/react',
    target: path.join(agentbridgePath, 'react'),
    buildRequired: true
  },
  {
    name: 'communication-websocket',
    source: '../../packages/communication/websocket',
    target: path.join(agentbridgePath, 'communication-websocket'),
    buildRequired: true
  }
];

console.log('Adding local dependencies...');

// Function to build a local package
function buildPackage(packagePath) {
  try {
    console.log(`Building package at ${packagePath}...`);
    // Check if the dist directory exists, if not build
    const distPath = path.join(packagePath, 'dist');
    if (!fs.existsSync(distPath) || fs.readdirSync(distPath).length === 0) {
      execSync('npm run build', { cwd: packagePath, stdio: 'inherit' });
      console.log(`Successfully built package at ${packagePath}`);
    } else {
      console.log(`Package at ${packagePath} already built, skipping`);
    }
  } catch (error) {
    console.error(`Error building package at ${packagePath}:`, error.message);
  }
}

// Create symlinks for each package
localPackages.forEach(pkg => {
  const sourcePath = path.resolve(__dirname, pkg.source);
  
  // Build the package if required
  if (pkg.buildRequired) {
    buildPackage(sourcePath);
  }
  
  // Remove existing link if it exists
  if (fs.existsSync(pkg.target)) {
    if (fs.lstatSync(pkg.target).isSymbolicLink() || fs.lstatSync(pkg.target).isDirectory()) {
      console.log(`Removing existing ${pkg.name}...`);
      fs.rmSync(pkg.target, { recursive: true, force: true });
    }
  }
  
  // Create the symlink
  try {
    console.log(`Linking ${pkg.name} from ${sourcePath} to ${pkg.target}`);
    
    // On Windows, need to use junction for directories
    fs.symlinkSync(sourcePath, pkg.target, 'junction');
    console.log(`Successfully linked ${pkg.name}`);
  } catch (error) {
    console.error(`Error linking ${pkg.name}:`, error.message);
  }
});

// Fix React dependencies to ensure only one copy exists
function fixReactModules() {
  console.log('🔄 Fixing React dependencies to ensure only one copy exists...');

  // Find all directories that might have their own React
  function findAllReactDeps(dir, depth = 0) {
    if (depth > 5) return []; // Limit recursion depth
    
    const results = [];
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const fullPath = path.join(dir, entry.name);
        
        if (entry.name === 'node_modules') {
          // Check if this node_modules contains React
          const reactPath = path.join(fullPath, 'react');
          const reactDomPath = path.join(fullPath, 'react-dom');
          
          if (fs.existsSync(reactPath)) {
            results.push(reactPath);
          }
          
          if (fs.existsSync(reactDomPath)) {
            results.push(reactDomPath);
          }
          
          // Continue looking in subdirectories
          const subDirs = fs.readdirSync(fullPath, { withFileTypes: true })
            .filter(e => e.isDirectory())
            .map(e => path.join(fullPath, e.name));
          
          for (const subDir of subDirs) {
            results.push(...findAllReactDeps(subDir, depth + 1));
          }
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
    
    return results;
  }

  const rootReactPath = path.join(nodeModulesPath, 'react');
  const rootReactDomPath = path.join(nodeModulesPath, 'react-dom');

  if (!fs.existsSync(rootReactPath)) {
    console.error('❌ Root React not found at', rootReactPath);
    return;
  }

  console.log('✅ Found root React at', rootReactPath);

  // Find all React instances in node_modules
  const reactInstances = findAllReactDeps(nodeModulesPath);
  
  console.log(`🔍 Found ${reactInstances.length} React-related packages that may need fixing`);

  // Process each instance
  for (const instance of reactInstances) {
    const pkgName = path.basename(instance);
    const parentDir = path.dirname(instance);
    
    // Skip the root React
    if (instance === rootReactPath || instance === rootReactDomPath) {
      continue;
    }
    
    try {
      // Remove the duplicate package
      fs.rmSync(instance, { recursive: true, force: true });
      
      // Create appropriate symlink
      let targetPath = pkgName === 'react' ? rootReactPath : rootReactDomPath;
      
      // Create relative symlink
      const relativeTarget = path.relative(parentDir, targetPath);
      fs.symlinkSync(relativeTarget, instance, 'junction');
      
      console.log(`✅ Fixed: ${instance} -> ${relativeTarget}`);
    } catch (error) {
      console.error(`❌ Error fixing ${instance}:`, error.message);
    }
  }

  console.log('✅ React dependency fixing complete!');
}

// Fix CSS imports by creating a .env file to disable source maps
function fixCSSImports() {
  console.log('Fixing CSS import issues...');
  
  const envPath = path.resolve(__dirname, '.env');
  const envContent = 'GENERATE_SOURCEMAP=false\nSKIP_PREFLIGHT_CHECK=true\n';
  
  fs.writeFileSync(envPath, envContent);
  console.log('Created .env file to disable source maps and skip preflight checks');
}

// Run after creating symlinks
fixReactModules();
fixCSSImports();

console.log('Local dependencies added successfully!');

// Instructions for developers
console.log('\n----- DEVELOPMENT INSTRUCTIONS -----');
console.log('1. Changes to agentbridge packages will require rebuilding them.');
console.log('2. To rebuild packages, run: npm run build --prefix ../../packages/[package-name]');
console.log('3. To restart the example app: npm start');
console.log('-------------------------------------'); 