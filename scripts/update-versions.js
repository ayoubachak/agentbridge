const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// Check if version was provided
if (process.argv.length < 3) {
  console.error('Please provide a version number. Example: node scripts/update-versions.js 1.0.0');
  process.exit(1);
}

const newVersion = process.argv[2];

// Validate version format (should be semver format: x.y.z)
if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error('Version must be in format x.y.z');
  process.exit(1);
}

// Paths to package.json files
const packagePaths = [
  'package.json', // root package.json
  'packages/core/package.json',
  'packages/web/react/package.json',
  'packages/web/angular/package.json',
  'packages/mobile/react-native/package.json'
];

// Path to Flutter pubspec.yaml
const flutterPubspecPath = 'packages/mobile/flutter/pubspec.yaml';

// Update version in package.json files
console.log(`Updating JavaScript/TypeScript package versions to ${newVersion}...`);
packagePaths.forEach(packagePath => {
  try {
    if (fs.existsSync(packagePath)) {
      const pkg = fs.readJsonSync(packagePath);
      const oldVersion = pkg.version;
      pkg.version = newVersion;
      
      // Update dependencies if they include agentbridge packages
      const dependencies = pkg.dependencies || {};
      Object.keys(dependencies).forEach(dep => {
        if (dep.startsWith('@agentbridge/')) {
          dependencies[dep] = `^${newVersion}`;
        }
      });
      
      fs.writeJsonSync(packagePath, pkg, { spaces: 2 });
      console.log(`✅ Updated ${packagePath} from ${oldVersion} to ${newVersion}`);
    } else {
      console.warn(`⚠️ File not found: ${packagePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${packagePath}:`, error.message);
  }
});

// Update version in Flutter pubspec.yaml
try {
  if (fs.existsSync(flutterPubspecPath)) {
    console.log(`\nUpdating Flutter package version to ${newVersion}...`);
    
    let pubspecContent = fs.readFileSync(flutterPubspecPath, 'utf8');
    
    // Update the version line
    pubspecContent = pubspecContent.replace(
      /version:\s*\d+\.\d+\.\d+(\+\d+)?/,
      `version: ${newVersion}+1`
    );
    
    fs.writeFileSync(flutterPubspecPath, pubspecContent);
    console.log(`✅ Updated ${flutterPubspecPath} to ${newVersion}+1`);
  } else {
    console.warn(`⚠️ File not found: ${flutterPubspecPath}`);
  }
} catch (error) {
  console.error(`❌ Error updating ${flutterPubspecPath}:`, error.message);
}

// Update CHANGELOG.md
const changelogPath = 'CHANGELOG.md';
try {
  console.log('\nUpdating CHANGELOG.md...');
  
  let changelogContent = '';
  if (fs.existsSync(changelogPath)) {
    changelogContent = fs.readFileSync(changelogPath, 'utf8');
  } else {
    changelogContent = '# Changelog\n\n';
  }
  
  // Get the date in YYYY-MM-DD format
  const today = new Date();
  const date = today.toISOString().split('T')[0];
  
  // Get latest git commits for changelog entries
  let commits = '';
  try {
    const latestCommits = execSync('git log -10 --pretty=format:"- %s"').toString();
    // Filter out version bump commits and similar non-feature commits
    commits = latestCommits
      .split('\n')
      .filter(line => !line.toLowerCase().includes('version') && !line.includes('changelog'))
      .join('\n');
  } catch (error) {
    console.warn('⚠️ Could not get git commits for changelog, using placeholder entries');
    commits = '- Add your changelog entries here';
  }
  
  // Create new changelog entry
  const newChangelogEntry = `## ${newVersion} (${date})

### Changes

${commits}

`;
  
  // Add the new entry at the top of the changelog (after the title)
  changelogContent = changelogContent.replace(
    '# Changelog\n\n',
    `# Changelog\n\n${newChangelogEntry}`
  );
  
  fs.writeFileSync(changelogPath, changelogContent);
  console.log(`✅ Updated ${changelogPath} with ${newVersion} entry`);
} catch (error) {
  console.error(`❌ Error updating ${changelogPath}:`, error.message);
}

console.log(`\n✅ All packages updated to version ${newVersion}`);
console.log('\nNext steps:');
console.log('1. Review the changes, especially in CHANGELOG.md');
console.log('2. Commit the changes with message: "chore: bump version to ' + newVersion + '"');
console.log('3. Create and push a tag: git tag -a v' + newVersion + ' -m "Release v' + newVersion + '" && git push origin v' + newVersion);
console.log('4. The GitHub workflow will automatically publish the packages'); 