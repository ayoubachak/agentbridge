/**
 * This script updates all package.json files in the monorepo with consistent
 * versioning and metadata for publishing.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper for prompts
const prompt = (question) => new Promise((resolve) => rl.question(question, resolve));

// Repository information
const repoInfo = {
  author: {
    name: "Ayoub Achak",
    email: "ayoub.achak01@gmail.com"
  },
  license: 'MIT',
  repository: {
    type: 'git',
    url: 'https://github.com/ayoubachak/agentbridge.git'
  },
  bugs: {
    url: 'https://github.com/ayoubachak/agentbridge/issues'
  },
  homepage: 'https://github.com/ayoubachak/agentbridge',
  publishConfig: {
    access: 'public'
  },
  files: [
    "dist",
    "README.md",
    "LICENSE"
  ]
};

// Packages to update
const packagesToUpdate = [
  'packages/core/package.json',
  'packages/web/react/package.json',
  'packages/web/angular/package.json',
  'packages/mobile/react-native/package.json'
];

// Get the current version from the root package.json
const getRootVersion = () => {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return packageJson.version || '0.1.0';
  } catch (error) {
    console.error('Error reading root package.json:', error.message);
    return '0.1.0';
  }
};

// Validate version format
const isValidVersion = (version) => /^\d+\.\d+\.\d+$/.test(version);

// Update package.json files
const updatePackageJsonFiles = async (version, packages, updateRepo = true) => {
  let succeeded = 0;
  let failed = 0;

  console.log('\n📦 Updating package.json files...');
  
  for (const packagePath of packages) {
    try {
      const fullPath = path.resolve(process.cwd(), packagePath);
      
      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        console.warn(`⚠️ Package file not found: ${packagePath}`);
        failed++;
        continue;
      }
      
      // Read the package.json file
      const packageJson = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      
      // Store original values to show changes
      const originalVersion = packageJson.version;
      
      // Update the version
      packageJson.version = version;
      
      // Update repository info if requested
      if (updateRepo) {
        packageJson.author = repoInfo.author;
        packageJson.license = repoInfo.license;
        packageJson.repository = repoInfo.repository;
        packageJson.bugs = repoInfo.bugs;
        packageJson.homepage = repoInfo.homepage;
        packageJson.publishConfig = repoInfo.publishConfig;
        // Ensure files field is added
        packageJson.files = repoInfo.files;
      }
      
      // Write the updated package.json
      fs.writeFileSync(fullPath, JSON.stringify(packageJson, null, 2) + '\n');
      
      console.log(`✅ Updated ${packagePath}`);
      if (originalVersion !== version) {
        console.log(`   Version: ${originalVersion} → ${version}`);
      }
      succeeded++;
    } catch (error) {
      console.error(`❌ Error updating ${packagePath}:`, error.message);
      failed++;
    }
  }
  
  console.log(`\n📊 Summary: ${succeeded} packages updated, ${failed} failed`);
  return succeeded > 0;
};

// Update Flutter pubspec.yaml
const updateFlutterPubspec = async (version) => {
  const pubspecPath = path.resolve(process.cwd(), 'packages/mobile/flutter/pubspec.yaml');
  
  try {
    // Check if file exists
    if (!fs.existsSync(pubspecPath)) {
      console.warn('⚠️ Flutter pubspec.yaml not found');
      return false;
    }
    
    let pubspecContent = fs.readFileSync(pubspecPath, 'utf8');
    
    // Extract current version for comparison
    const currentVersionMatch = pubspecContent.match(/^version: (.*)$/m);
    const currentVersion = currentVersionMatch ? currentVersionMatch[1] : 'unknown';
    
    // Replace the version line
    pubspecContent = pubspecContent.replace(/^version:.*$/m, `version: ${version}`);
    
    // Write the updated pubspec.yaml
    fs.writeFileSync(pubspecPath, pubspecContent);
    
    console.log(`✅ Updated Flutter pubspec.yaml`);
    if (currentVersion !== version) {
      console.log(`   Version: ${currentVersion} → ${version}`);
    }
    return true;
  } catch (error) {
    console.error('❌ Error updating pubspec.yaml:', error.message);
    return false;
  }
};

// Main interactive function
const main = async () => {
  try {
    console.log('🚀 AgentBridge Package Publishing Tool 🚀');
    console.log('=======================================');
    
    // Get current version
    const currentVersion = getRootVersion();
    console.log(`Current version: ${currentVersion}`);
    
    // Command line args version takes precedence
    let newVersion = process.argv[2];
    
    // If no version provided via CLI, prompt user
    if (!newVersion) {
      const shouldChangeVersion = await prompt('Do you want to update the version? (y/n): ');
      
      if (shouldChangeVersion.toLowerCase() === 'y') {
        newVersion = await prompt(`Enter new version (current: ${currentVersion}): `);
        
        // Validate version format
        while (!isValidVersion(newVersion)) {
          console.log('❌ Invalid version format. Please use semver format (e.g., 1.0.0)');
          newVersion = await prompt('Enter new version: ');
        }
      } else {
        newVersion = currentVersion;
      }
    }
    
    // Choose which packages to update
    console.log('\nAvailable packages:');
    packagesToUpdate.forEach((pkg, index) => {
      console.log(`${index + 1}. ${pkg}`);
    });
    
    const packageSelectionInput = await prompt(
      'Enter package numbers to update (comma-separated) or "all" for all packages: '
    );
    
    let selectedPackages = [];
    if (packageSelectionInput.toLowerCase() === 'all') {
      selectedPackages = [...packagesToUpdate];
    } else {
      const selections = packageSelectionInput.split(',').map(n => parseInt(n.trim(), 10));
      selectedPackages = selections
        .filter(n => !isNaN(n) && n > 0 && n <= packagesToUpdate.length)
        .map(n => packagesToUpdate[n - 1]);
    }
    
    if (selectedPackages.length === 0) {
      console.log('❌ No valid packages selected. Exiting...');
      rl.close();
      return;
    }
    
    console.log(`\nSelected packages: ${selectedPackages.length}`);
    selectedPackages.forEach(pkg => console.log(`- ${pkg}`));
    
    // Ask about updating repo info
    const updateRepoInfo = await prompt('Update repository metadata too? (y/n): ');
    const shouldUpdateRepoInfo = updateRepoInfo.toLowerCase() === 'y';
    
    // Ask about updating Flutter pubspec
    const updateFlutter = await prompt('Update Flutter pubspec.yaml? (y/n): ');
    const shouldUpdateFlutter = updateFlutter.toLowerCase() === 'y';
    
    // Confirm changes
    const confirmChanges = await prompt('\nReady to apply these changes. Proceed? (y/n): ');
    if (confirmChanges.toLowerCase() !== 'y') {
      console.log('🛑 Operation cancelled by user.');
      rl.close();
      return;
    }
    
    // Update package.json files
    const packagesUpdated = await updatePackageJsonFiles(
      newVersion, 
      selectedPackages, 
      shouldUpdateRepoInfo
    );
    
    // Update Flutter pubspec if requested
    let flutterUpdated = false;
    if (shouldUpdateFlutter) {
      flutterUpdated = await updateFlutterPubspec(newVersion);
    }
    
    console.log('\n🎉 All operations completed!');
    
    // Suggest next steps
    console.log('\n📝 Next steps:');
    console.log('1. Review the changes');
    console.log('2. Commit the changes: git add . && git commit -m "chore: prepare release v' + newVersion + '"');
    console.log('3. Create a release tag: git tag v' + newVersion);
    console.log('4. Push changes and tags: git push && git push --tags');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  } finally {
    rl.close();
  }
};

// Run the script
main(); 