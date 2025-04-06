const fs = require('fs');
const path = require('path');

/**
 * This script resolves React and React DOM conflicts by ensuring all modules
 * in the dependency tree use the same version of React from the application's
 * root node_modules.
 */
function fixReactModules() {
  const nodeModulesPath = path.resolve(__dirname, 'node_modules');
  const targetPackages = [
    'react',
    'react-dom',
    'scheduler', // Important for React DOM
    'react/jsx-runtime',
    'react/jsx-dev-runtime'
  ];

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
          for (const targetPkg of targetPackages) {
            const pkgPath = path.join(fullPath, targetPkg);
            if (fs.existsSync(pkgPath)) {
              results.push(pkgPath);
            }
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
  const rootSchedulerPath = path.join(nodeModulesPath, 'scheduler');

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
    if (instance === rootReactPath || 
        instance === rootReactDomPath || 
        instance === rootSchedulerPath) {
      continue;
    }
    
    try {
      // Remove the duplicate package
      fs.rmSync(instance, { recursive: true, force: true });
      
      // Create appropriate symlink
      let targetPath;
      if (pkgName === 'react') {
        targetPath = rootReactPath;
      } else if (pkgName === 'react-dom') {
        targetPath = rootReactDomPath;
      } else if (pkgName === 'scheduler') {
        targetPath = rootSchedulerPath;
      } else {
        // For jsx-runtime and jsx-dev-runtime, we need to link to parent + subdir
        targetPath = path.join(rootReactPath, pkgName.replace('react/', ''));
      }
      
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

fixReactModules(); 