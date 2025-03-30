/**
 * Cleanup script for old directories
 * This script helps identify and remove old directories that are no longer needed
 * after the package structure reorganization.
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

// Old directories to check for removal
const oldDirs = [
  'packages/web',
  'packages/mobile',
  'packages/sdk-react',
  'packages/sdk-angular',
  'packages/sdk-react-native',
  'packages/sdk-js',
  'packages/pubsub-ably',
  'packages/pubsub-firebase',
  'packages/pubsub-pusher',
  'packages/pubsub-supabase',
  'packages/comm-websocket'
];

// Check if a directory exists
const dirExists = (dirPath) => {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch (error) {
    return false;
  }
};

// Remove a directory recursively
const removeDir = (dirPath) => {
  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ Removed ${dirPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error removing ${dirPath}:`, error.message);
    return false;
  }
};

// Main function
const main = async () => {
  console.log('🧹 AgentBridge Old Directory Cleanup Tool 🧹');
  console.log('============================================');
  
  const existingDirs = oldDirs.filter(dirPath => dirExists(dirPath));
  
  if (existingDirs.length === 0) {
    console.log('No old directories found to clean up. Your workspace is already clean! 🎉');
    rl.close();
    return;
  }
  
  console.log('\nThe following old directories were found:');
  existingDirs.forEach((dir, index) => {
    console.log(`${index + 1}. ${dir}`);
  });
  
  console.log('\n⚠️  These directories might contain code that has already been migrated to the new structure.');
  
  const action = await prompt('\nWhat would you like to do? (list/remove/exit): ');
  
  if (action.toLowerCase() === 'list') {
    console.log('\nListing content of old directories:');
    for (const dir of existingDirs) {
      try {
        console.log(`\n📂 ${dir}:`);
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const isDirectory = fs.statSync(filePath).isDirectory();
          console.log(`  ${isDirectory ? '📁' : '📄'} ${file}`);
        });
      } catch (error) {
        console.error(`❌ Error listing ${dir}:`, error.message);
      }
    }
  } else if (action.toLowerCase() === 'remove') {
    const confirmation = await prompt('Are you sure you want to remove all old directories? This cannot be undone. (yes/no): ');
    
    if (confirmation.toLowerCase() === 'yes') {
      let succeeded = 0;
      
      for (const dir of existingDirs) {
        if (removeDir(dir)) {
          succeeded++;
        }
      }
      
      console.log(`\n🧹 Cleanup completed: ${succeeded}/${existingDirs.length} directories removed.`);
    } else {
      console.log('Removal cancelled.');
    }
  } else {
    console.log('Exiting without changes.');
  }
  
  rl.close();
};

// Run the script
main().catch(error => {
  console.error('An error occurred:', error);
  rl.close();
}); 