/**
 * This script handles manual publishing of packages in the correct order
 * It should be run after prepare-packages.js and check-publish-readiness.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline.question
const prompt = (question) => new Promise((resolve) => rl.question(question, resolve));

// Package publishing order (important for dependencies)
const publishOrder = [
  {
    name: 'Core Package',
    path: 'packages/core',
    package: '@agentbridge/core'
  },
  {
    name: 'React Package',
    path: 'packages/web/react',
    package: '@agentbridge/react'
  },
  {
    name: 'Angular Package',
    path: 'packages/web/angular',
    package: '@agentbridge/angular'
  },
  {
    name: 'React Native Package',
    path: 'packages/mobile/react-native',
    package: '@agentbridge/react-native'
  }
];

// Execute command and return output
const execCommand = (command, cwd) => {
  try {
    console.log(`\n> ${command}`);
    const options = { cwd, stdio: 'inherit' };
    execSync(command, options);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Check if package exists on npm
const checkPackageExists = (packageName, version) => {
  try {
    const result = execSync(`npm view ${packageName}@${version} version`, { encoding: 'utf8' }).trim();
    return result === version;
  } catch (error) {
    return false;
  }
};

// Publish a single package
const publishPackage = async (packageInfo, options) => {
  const { name, path: packagePath, package: packageName } = packageInfo;
  
  console.log(`\n📦 Publishing ${name} (${packageName})...`);
  
  // Read package.json to get the version
  const packageJsonPath = `${packagePath}/package.json`;
  if (!fs.existsSync(packageJsonPath)) {
    console.error(`❌ package.json not found in ${packagePath}`);
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const version = packageJson.version;
  
  // Check if this version already exists on npm
  if (checkPackageExists(packageName, version)) {
    console.log(`⚠️ ${packageName}@${version} already exists on npm registry`);
    
    if (!options.force) {
      const answer = await prompt('Continue anyway? (y/n): ');
      if (answer.toLowerCase() !== 'y') {
        console.log(`Skipping ${packageName}`);
        return false;
      }
    }
  }
  
  // Build package if needed
  if (options.build) {
    console.log(`Building ${name}...`);
    const buildResult = execCommand('npm run build', packagePath);
    if (!buildResult.success) {
      console.error(`❌ Failed to build ${name}`);
      if (!options.continueOnError) {
        return false;
      }
    }
  }
  
  // Create publish command with any extra options
  let publishCommand = 'npm publish --access public';
  if (options.tag) {
    publishCommand += ` --tag ${options.tag}`;
  }
  if (options.dryRun) {
    publishCommand += ' --dry-run';
  }
  
  // Execute publish command
  const publishResult = execCommand(publishCommand, packagePath);
  
  if (publishResult.success) {
    console.log(`✅ Successfully published ${packageName}@${version}`);
    return true;
  } else {
    console.error(`❌ Failed to publish ${packageName}@${version}`);
    if (options.continueOnError) {
      return false;
    } else {
      throw new Error(`Publishing ${name} failed`);
    }
  }
};

// Main function
const main = async () => {
  console.log('🚀 AgentBridge Package Publisher 🚀');
  console.log('===================================');
  
  try {
    // Gather options
    const dryRun = await prompt('Run in dry-run mode? (y/n): ');
    const shouldBuild = await prompt('Build packages before publishing? (y/n): ');
    const useTag = await prompt('Use a distribution tag? (leave empty for latest): ');
    const continueOnError = await prompt('Continue publishing if a package fails? (y/n): ');
    const forcePublish = await prompt('Force publish even if versions exist? (y/n): ');
    
    // Confirm publishing order
    console.log('\nPackages will be published in this order:');
    publishOrder.forEach((pkg, idx) => {
      console.log(`${idx + 1}. ${pkg.name} (${pkg.package})`);
    });
    
    const confirmOrder = await prompt('\nProceed with publishing in this order? (y/n): ');
    if (confirmOrder.toLowerCase() !== 'y') {
      console.log('🛑 Publishing cancelled.');
      rl.close();
      return;
    }
    
    // Select packages to publish
    const packageSelection = await prompt('Enter package numbers to publish (comma-separated) or "all" for all packages: ');
    
    let selectedPackages = [];
    if (packageSelection.toLowerCase() === 'all') {
      selectedPackages = [...publishOrder];
    } else {
      const selections = packageSelection.split(',').map(n => parseInt(n.trim(), 10));
      selectedPackages = selections
        .filter(n => !isNaN(n) && n > 0 && n <= publishOrder.length)
        .map(n => publishOrder[n - 1]);
    }
    
    if (selectedPackages.length === 0) {
      console.log('❌ No valid packages selected. Exiting...');
      rl.close();
      return;
    }
    
    // Create options object
    const options = {
      dryRun: dryRun.toLowerCase() === 'y',
      build: shouldBuild.toLowerCase() === 'y',
      tag: useTag.trim() || null,
      continueOnError: continueOnError.toLowerCase() === 'y',
      force: forcePublish.toLowerCase() === 'y'
    };
    
    // Final confirmation
    const modeDesc = options.dryRun ? 'DRY RUN (no actual publishing)' : 'REAL PUBLISHING';
    console.log(`\n⚠️ WARNING: You are about to run in ${modeDesc} mode!`);
    
    if (!options.dryRun) {
      console.log('\n🔒 Security Check:');
      
      // Verify npm user
      try {
        const user = execSync('npm whoami', { encoding: 'utf8' }).trim();
        console.log(`- Logged in as: ${user}`);
      } catch (error) {
        console.error('❌ Not logged in to npm! Run npm login first.');
        rl.close();
        return;
      }
      
      // Verify registry
      const registry = execSync('npm config get registry', { encoding: 'utf8' }).trim();
      console.log(`- Publishing to registry: ${registry}`);
      
      const finalConfirm = await prompt('\n⚠️ Are you absolutely sure you want to publish these packages? This cannot be undone. (yes/no): ');
      if (finalConfirm.toLowerCase() !== 'yes') {
        console.log('🛑 Publishing cancelled.');
        rl.close();
        return;
      }
    }
    
    // Publish packages
    console.log('\n📤 Starting publishing process...');
    
    const results = [];
    for (const pkg of selectedPackages) {
      try {
        const success = await publishPackage(pkg, options);
        results.push({ ...pkg, success });
        if (!success && !options.continueOnError) {
          console.error(`❌ Failed to publish ${pkg.name}. Stopping.`);
          break;
        }
      } catch (error) {
        console.error(`❌ Error publishing ${pkg.name}:`, error.message);
        results.push({ ...pkg, success: false });
        if (!options.continueOnError) {
          break;
        }
      }
    }
    
    // Print summary
    console.log('\n📊 Publishing Summary:');
    results.forEach(result => {
      const icon = result.success ? '✅' : '❌';
      console.log(`${icon} ${result.name} (${result.package})`);
    });
    
    const successCount = results.filter(r => r.success).length;
    if (options.dryRun) {
      console.log(`\n🧪 Dry run completed. ${successCount}/${results.length} packages would be published.`);
    } else {
      console.log(`\n🎉 Publishing completed. ${successCount}/${results.length} packages published successfully.`);
    }
  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
  } finally {
    rl.close();
  }
};

// Run the script
main(); 