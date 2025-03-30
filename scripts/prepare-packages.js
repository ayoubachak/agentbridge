/**
 * This script updates all package.json files in the monorepo with consistent
 * versioning and metadata for publishing.
 */

const fs = require('fs');
const path = require('path');

// Repository information
const repoInfo = {
  author: 'Your Organization',
  license: 'MIT',
  repository: {
    type: 'git',
    url: 'https://github.com/yourusername/agentbridge.git'
  },
  bugs: {
    url: 'https://github.com/yourusername/agentbridge/issues'
  },
  homepage: 'https://github.com/yourusername/agentbridge',
  publishConfig: {
    access: 'public'
  }
};

// Get version from command line arguments, or use the current version
const newVersion = process.argv[2] || process.env.npm_package_version || '0.1.0';

// Packages to update
const packagesToUpdate = [
  'packages/core/package.json',
  'packages/web/react/package.json',
  'packages/web/angular/package.json',
  'packages/mobile/react-native/package.json'
];

// Update each package.json
packagesToUpdate.forEach(packagePath => {
  try {
    const fullPath = path.resolve(process.cwd(), packagePath);
    
    // Read the package.json file
    const packageJson = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    
    // Update the version and metadata
    packageJson.version = newVersion;
    packageJson.author = repoInfo.author;
    packageJson.license = repoInfo.license;
    packageJson.repository = repoInfo.repository;
    packageJson.bugs = repoInfo.bugs;
    packageJson.homepage = repoInfo.homepage;
    packageJson.publishConfig = repoInfo.publishConfig;
    
    // Write the updated package.json
    fs.writeFileSync(fullPath, JSON.stringify(packageJson, null, 2) + '\n');
    
    console.log(`Updated ${packagePath} to version ${newVersion}`);
  } catch (error) {
    console.error(`Error updating ${packagePath}:`, error.message);
  }
});

// Update version in pubspec.yaml for Flutter package
try {
  const pubspecPath = path.resolve(process.cwd(), 'packages/mobile/flutter/pubspec.yaml');
  let pubspecContent = fs.readFileSync(pubspecPath, 'utf8');
  
  // Replace the version line
  pubspecContent = pubspecContent.replace(/^version:.*$/m, `version: ${newVersion}`);
  
  // Write the updated pubspec.yaml
  fs.writeFileSync(pubspecPath, pubspecContent);
  
  console.log(`Updated Flutter pubspec.yaml to version ${newVersion}`);
} catch (error) {
  console.error('Error updating pubspec.yaml:', error.message);
}

console.log('All packages updated successfully!'); 