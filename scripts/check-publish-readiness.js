/**
 * Script to check if packages are ready for publishing
 * This validates package.json files, dependencies, and other requirements
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// List of packages to check
const packagesToCheck = [
  'packages/core',
  'packages/frameworks/react',
  'packages/frameworks/angular',
  'packages/frameworks/react-native',
  'packages/frameworks/flutter',
  'packages/providers/ably',
  'packages/providers/firebase',
  'packages/providers/pusher',
  'packages/providers/supabase',
  'packages/server'
];

// Required fields in package.json for publishing
const requiredFields = [
  'name',
  'version',
  'description',
  'main',
  'types',
  'files',
  'author',
  'license',
  'repository',
  'bugs',
  'homepage',
  'keywords'
];

// Check if package has dist folder
const checkDistFolder = (packagePath) => {
  const distPath = path.join(packagePath, 'dist');
  if (!fs.existsSync(distPath)) {
    return {
      success: false,
      message: 'Missing dist folder. Run npm run build:js first.'
    };
  }
  
  // Check if dist folder has content
  const distContent = fs.readdirSync(distPath);
  if (distContent.length === 0) {
    return {
      success: false,
      message: 'Dist folder is empty. Run npm run build:js first.'
    };
  }
  
  return { success: true };
};

// Check package.json for required fields
const validatePackageJson = (packagePath) => {
  const packageJsonPath = path.join(packagePath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return {
      success: false,
      message: 'package.json not found'
    };
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const missingFields = [];
  
  // Check required fields
  requiredFields.forEach(field => {
    if (!packageJson[field]) {
      missingFields.push(field);
    }
  });
  
  // Warn on private:true
  if (packageJson.private === true) {
    return {
      success: false,
      message: 'Package is marked as private and cannot be published'
    };
  }
  
  if (missingFields.length > 0) {
    return {
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`
    };
  }
  
  return { success: true };
};

// Check if NPM user is logged in
const checkNpmLogin = () => {
  try {
    const output = execSync('npm whoami', { encoding: 'utf8' });
    return {
      success: true,
      message: `Logged in as: ${output.trim()}`
    };
  } catch (error) {
    return {
      success: false,
      message: 'Not logged in to npm. Run npm login first.'
    };
  }
};

// Check NPM registry status
const checkNpmRegistry = () => {
  try {
    const registry = execSync('npm config get registry', { encoding: 'utf8' }).trim();
    return {
      success: true,
      message: `NPM Registry: ${registry}`
    };
  } catch (error) {
    return {
      success: false,
      message: 'Could not determine npm registry'
    };
  }
};

// Check package versions for consistency
const checkVersionConsistency = () => {
  const versions = new Map();
  let isConsistent = true;
  
  packagesToCheck.forEach(packagePath => {
    try {
      const packageJsonPath = path.join(packagePath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        versions.set(packageJson.name, packageJson.version);
      }
    } catch (error) {
      console.error(`Error reading package.json in ${packagePath}:`, error.message);
    }
  });
  
  let firstVersion = null;
  const inconsistentPackages = [];
  
  for (const [name, version] of versions.entries()) {
    if (firstVersion === null) {
      firstVersion = version;
    } else if (version !== firstVersion) {
      isConsistent = false;
      inconsistentPackages.push(`${name}@${version}`);
    }
  }
  
  if (!isConsistent) {
    return {
      success: false,
      message: `Inconsistent versions found: ${inconsistentPackages.join(', ')} (expected: ${firstVersion})`
    };
  }
  
  return {
    success: true,
    message: `All packages are at version ${firstVersion}`
  };
};

// Run all checks
const runChecks = () => {
  console.log('🔍 Checking packages for publishing readiness...\n');
  
  // Check NPM login
  const loginCheck = checkNpmLogin();
  console.log(`NPM Login: ${loginCheck.success ? '✅' : '❌'} ${loginCheck.message}`);
  
  // Check NPM registry
  const registryCheck = checkNpmRegistry();
  console.log(`NPM Registry: ${registryCheck.success ? '✅' : '❌'} ${registryCheck.message}`);
  
  // Check version consistency
  const versionCheck = checkVersionConsistency();
  console.log(`Version Consistency: ${versionCheck.success ? '✅' : '❌'} ${versionCheck.message}`);
  
  console.log('\n📦 Checking individual packages:');
  
  let allPackagesReady = true;
  
  packagesToCheck.forEach(packagePath => {
    console.log(`\n${packagePath}:`);
    
    // Check package.json
    const packageJsonCheck = validatePackageJson(packagePath);
    console.log(`  package.json: ${packageJsonCheck.success ? '✅' : '❌'} ${packageJsonCheck.success ? 'Valid' : packageJsonCheck.message}`);
    
    // Check dist folder
    const distCheck = checkDistFolder(packagePath);
    console.log(`  dist folder: ${distCheck.success ? '✅' : '❌'} ${distCheck.success ? 'Present' : distCheck.message}`);
    
    if (!packageJsonCheck.success || !distCheck.success) {
      allPackagesReady = false;
    }
  });
  
  console.log('\n📋 Summary:');
  if (allPackagesReady && loginCheck.success && versionCheck.success) {
    console.log('✅ All packages are ready for publishing!');
  } else {
    console.log('❌ Some issues need to be fixed before publishing.');
    console.log('\n🛠️ Recommended actions:');
    if (!loginCheck.success) console.log('- Run npm login to authenticate with npm');
    if (!versionCheck.success) console.log('- Run node scripts/prepare-packages.js to update versions');
    console.log('- Run npm run build:js to build all packages');
  }
};

// Run the script
runChecks(); 