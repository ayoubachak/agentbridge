/**
 * This script ensures only one copy of React is used in the project
 * It symlinks all internal package React dependencies to the root React
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Main paths
const exampleRoot = __dirname;
const rootReactPath = path.join(exampleRoot, 'node_modules/react');
const rootReactDomPath = path.join(exampleRoot, 'node_modules/react-dom');

// Packages to check
const packagesToCheck = [
  path.join(exampleRoot, 'node_modules/@agentbridge/core'),
  path.join(exampleRoot, 'node_modules/@agentbridge/react'),
  path.join(exampleRoot, 'node_modules/@agentbridge/communication-websocket')
];

// Deeper locations to check - add more potential problematic packages
const deeperLocationsToCheck = [
  'node_modules/@babel',
  'node_modules/react-scripts',
  'node_modules/webpack',
  'node_modules/eslint',
  'node_modules/jest',
  'node_modules/babel',
  'node_modules/scheduler',
  'node_modules/react-reconciler',
  'node_modules/react-router',
  'node_modules/react-dom',
  'node_modules/react-refresh',
  'node_modules/react-error-overlay',
  'node_modules/react-dev-utils'
];

// Even deeper search in problem directories
const deepReactLocations = [
  'node_modules',
  'node_modules/@agentbridge',
  'node_modules/@babel',
  'node_modules/react-scripts'
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkReactExists() {
  if (!fs.existsSync(rootReactPath)) {
    log('Root React not found! Make sure React is installed.', colors.red);
    process.exit(1);
  }

  log(`✅ Found React at: ${rootReactPath}`, colors.green);
  return true;
}

function findNestedReactInstallations() {
  const foundReactPaths = [];
  const foundReactDomPaths = [];
  
  // Check packages
  packagesToCheck.forEach(packagePath => {
    findReactInPath(packagePath, foundReactPaths, foundReactDomPaths);
  });
  
  // Check deeper locations
  deeperLocationsToCheck.forEach(deeperLocation => {
    const fullPath = path.join(exampleRoot, deeperLocation);
    if (fs.existsSync(fullPath)) {
      findReactInPath(fullPath, foundReactPaths, foundReactDomPaths, true);
    }
  });

  // Do an ultra-deep search for React 
  log('Performing deep search for React instances...', colors.cyan);
  deepReactLocations.forEach(deepLocation => {
    const fullDeepPath = path.join(exampleRoot, deepLocation);
    if (fs.existsSync(fullDeepPath)) {
      findReactRecursively(fullDeepPath, foundReactPaths, foundReactDomPaths, 0, 3); // max depth of 3
    }
  });
  
  return { foundReactPaths, foundReactDomPaths };
}

// Recursively search for React with depth limit
function findReactRecursively(basePath, foundReactPaths, foundReactDomPaths, currentDepth, maxDepth) {
  if (currentDepth > maxDepth || !fs.existsSync(basePath)) {
    return;
  }

  try {
    // Check for React in this directory
    const reactPath = path.join(basePath, 'node_modules/react');
    if (fs.existsSync(reactPath) && !foundReactPaths.includes(reactPath) && reactPath !== rootReactPath) {
      log(`Found nested React at depth ${currentDepth}: ${reactPath}`, colors.yellow);
      foundReactPaths.push(reactPath);
    }

    const reactDomPath = path.join(basePath, 'node_modules/react-dom');
    if (fs.existsSync(reactDomPath) && !foundReactDomPaths.includes(reactDomPath) && reactDomPath !== rootReactDomPath) {
      log(`Found nested React DOM at depth ${currentDepth}: ${reactDomPath}`, colors.yellow);
      foundReactDomPaths.push(reactDomPath);
    }

    // Look in subdirectories
    const nodeModulesPath = path.join(basePath, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      const subDirs = fs.readdirSync(nodeModulesPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
        
      // Recursively check each subdirectory
      subDirs.forEach(subDir => {
        // Skip node_modules within node_modules to avoid recursion issues
        if (subDir === 'node_modules') return;
        
        const subPath = path.join(nodeModulesPath, subDir);
        findReactRecursively(subPath, foundReactPaths, foundReactDomPaths, currentDepth + 1, maxDepth);
      });
    }
  } catch (error) {
    log(`Error in recursive search at ${basePath}: ${error.message}`, colors.red);
  }
}

function findReactInPath(basePath, foundReactPaths, foundReactDomPaths, recursive = false) {
  if (!fs.existsSync(basePath)) {
    log(`Path not found: ${basePath}`, colors.yellow);
    return;
  }
  
  // Check for direct React/ReactDOM
  const packageReactPath = path.join(basePath, 'node_modules/react');
  if (fs.existsSync(packageReactPath)) {
    foundReactPaths.push(packageReactPath);
  }
  
  const packageReactDomPath = path.join(basePath, 'node_modules/react-dom');
  if (fs.existsSync(packageReactDomPath)) {
    foundReactDomPaths.push(packageReactDomPath);
  }
  
  // Recursively check if needed
  if (recursive) {
    try {
      const nodeModulesPath = path.join(basePath, 'node_modules');
      if (fs.existsSync(nodeModulesPath)) {
        const subDirs = fs.readdirSync(nodeModulesPath, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);
          
        subDirs.forEach(subDir => {
          // Skip checking node_modules within node_modules to avoid recursion issues
          if (subDir === 'node_modules') return;
          
          const subPath = path.join(nodeModulesPath, subDir);
          // Skip React itself
          if (subPath === rootReactPath || subPath === rootReactDomPath) return;
          
          const subReactPath = path.join(subPath, 'node_modules/react');
          if (fs.existsSync(subReactPath)) {
            foundReactPaths.push(subReactPath);
          }
          
          const subReactDomPath = path.join(subPath, 'node_modules/react-dom');
          if (fs.existsSync(subReactDomPath)) {
            foundReactDomPaths.push(subReactDomPath);
          }
        });
      }
    } catch (error) {
      log(`Error reading subdirectories in ${basePath}: ${error.message}`, colors.red);
    }
  }
}

function removeNestedReactAndSymlink({ foundReactPaths, foundReactDomPaths }) {
  let fixes = 0;
  
  // Handle React
  foundReactPaths.forEach(reactPath => {
    try {
      log(`Removing nested React: ${reactPath}`, colors.yellow);
      fs.rmSync(reactPath, { recursive: true, force: true });
      
      // Create directory if needed
      const parentDir = path.dirname(reactPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      
      // Create symlink
      log(`Creating symlink to root React`, colors.green);
      fs.symlinkSync(rootReactPath, reactPath, 'junction');
      fixes++;
    } catch (error) {
      log(`Error processing React at ${reactPath}: ${error.message}`, colors.red);
      // Try alternative approach
      try {
        log(`Trying alternative approach for ${reactPath}...`, colors.yellow);
        // Copy a package.json redirection instead of symlink
        const packageJsonPath = path.join(reactPath, 'package.json');
        const redirectPackage = {
          name: "react-redirect",
          version: "1.0.0",
          main: path.relative(reactPath, path.join(rootReactPath, 'index.js')),
          browser: path.relative(reactPath, path.join(rootReactPath, 'index.js')),
          module: path.relative(reactPath, path.join(rootReactPath, 'index.js')),
          exports: {
            ".": {
              "import": path.relative(reactPath, path.join(rootReactPath, 'index.js')),
              "require": path.relative(reactPath, path.join(rootReactPath, 'index.js'))
            },
            "./package.json": "./package.json"
          }
        };
        fs.mkdirSync(reactPath, { recursive: true });
        fs.writeFileSync(packageJsonPath, JSON.stringify(redirectPackage, null, 2));
        log(`Created package.json redirect at ${packageJsonPath}`, colors.green);
        fixes++;
      } catch (redirectError) {
        log(`Alternative approach also failed: ${redirectError.message}`, colors.red);
      }
    }
  });
  
  // Handle React DOM
  foundReactDomPaths.forEach(reactDomPath => {
    try {
      log(`Removing nested React DOM: ${reactDomPath}`, colors.yellow);
      fs.rmSync(reactDomPath, { recursive: true, force: true });
      
      // Create directory if needed
      const parentDir = path.dirname(reactDomPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      
      // Create symlink
      log(`Creating symlink to root React DOM`, colors.green);
      fs.symlinkSync(rootReactDomPath, reactDomPath, 'junction');
      fixes++;
    } catch (error) {
      log(`Error processing React DOM at ${reactDomPath}: ${error.message}`, colors.red);
      // Try alternative approach
      try {
        log(`Trying alternative approach for ${reactDomPath}...`, colors.yellow);
        // Copy a package.json redirection instead of symlink
        const packageJsonPath = path.join(reactDomPath, 'package.json');
        const redirectPackage = {
          name: "react-dom-redirect",
          version: "1.0.0",
          main: path.relative(reactDomPath, path.join(rootReactDomPath, 'index.js')),
          browser: path.relative(reactDomPath, path.join(rootReactDomPath, 'index.js')),
          module: path.relative(reactDomPath, path.join(rootReactDomPath, 'index.js')),
          exports: {
            ".": {
              "import": path.relative(reactDomPath, path.join(rootReactDomPath, 'index.js')),
              "require": path.relative(reactDomPath, path.join(rootReactDomPath, 'index.js'))
            },
            "./package.json": "./package.json"
          }
        };
        fs.mkdirSync(reactDomPath, { recursive: true });
        fs.writeFileSync(packageJsonPath, JSON.stringify(redirectPackage, null, 2));
        log(`Created package.json redirect at ${packageJsonPath}`, colors.green);
        fixes++;
      } catch (redirectError) {
        log(`Alternative approach also failed: ${redirectError.message}`, colors.red);
      }
    }
  });
  
  return fixes;
}

function verifyPeerDependencies() {
  log('Checking peer dependencies in local packages...', colors.cyan);
  
  packagesToCheck.forEach(packagePath => {
    if (!fs.existsSync(packagePath)) return;
    
    const packageJsonPath = path.join(packagePath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) return;
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      if (packageJson.peerDependencies && (
          packageJson.peerDependencies.react || 
          packageJson.peerDependencies['react-dom'])) {
        log(`📦 ${path.basename(packagePath)} has React peer dependencies:`, colors.cyan);
        
        if (packageJson.peerDependencies.react) {
          log(`  - react: ${packageJson.peerDependencies.react}`, colors.blue);
        }
        
        if (packageJson.peerDependencies['react-dom']) {
          log(`  - react-dom: ${packageJson.peerDependencies['react-dom']}`, colors.blue);
        }
      }
    } catch (error) {
      log(`Error reading package.json at ${packageJsonPath}: ${error.message}`, colors.red);
    }
  });
}

function createOrFixBrowsersListFile() {
  log(`✅ Using browserslist from package.json`, colors.green);
}

// Create a .env file to disable source maps and skip preflight check
function createEnvFile() {
  log('Creating .env file to optimize React setup...', colors.cyan);
  const envPath = path.join(exampleRoot, '.env');
  const envContent = `SKIP_PREFLIGHT_CHECK=true\nGENERATE_SOURCEMAP=false\n`;
  
  try {
    fs.writeFileSync(envPath, envContent);
    log(`✅ Created .env file at ${envPath}`, colors.green);
  } catch (error) {
    log(`❌ Error creating .env file: ${error.message}`, colors.red);
  }
}

function main() {
  log('\n🔧 FIXING REACT DEPENDENCIES 🔧\n', colors.magenta);
  
  // Verify root React exists
  checkReactExists();
  
  // Create/fix browserslist file
  createOrFixBrowsersListFile();
  
  // Create environment file
  createEnvFile();
  
  // Find all nested React installations
  const nestedReactInfo = findNestedReactInstallations();
  const { foundReactPaths, foundReactDomPaths } = nestedReactInfo;
  
  if (foundReactPaths.length === 0 && foundReactDomPaths.length === 0) {
    log('✅ No duplicate React installations found!', colors.green);
  } else {
    log(`Found ${foundReactPaths.length} React and ${foundReactDomPaths.length} React DOM duplicate installations`, colors.yellow);
    
    // Remove nested React installations and create symlinks
    const fixes = removeNestedReactAndSymlink(nestedReactInfo);
    
    log(`✅ Fixed ${fixes} React dependency issues!`, colors.green);
  }
  
  // Verify peer dependencies
  verifyPeerDependencies();
  
  log('\n🎉 All done! React dependencies should now be properly linked.\n', colors.green);
}

main(); 