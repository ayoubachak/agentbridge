const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

// Configuration for test packages
const jsPackages = [
  '@agentbridge/core',
  '@agentbridge/react',
  '@agentbridge/angular',
  '@agentbridge/react-native'
];

const flutterPackage = 'agentbridge';

// Main function to test the packages
async function testPackages() {
  console.log('🧪 Testing AgentBridge packages...\n');
  
  // Create a temporary directory for testing
  const tempDir = path.join(os.tmpdir(), `agentbridge-test-${Date.now()}`);
  fs.ensureDirSync(tempDir);
  console.log(`Created test directory: ${tempDir}`);
  
  // Test JavaScript packages
  await testJavaScriptPackages(tempDir);
  
  // Test Flutter package
  await testFlutterPackage(tempDir);
  
  // Clean up
  fs.removeSync(tempDir);
  console.log(`\nRemoved test directory: ${tempDir}`);
  console.log('\n✅ Testing completed!');
}

async function testJavaScriptPackages(tempDir) {
  console.log('\n📦 Testing JavaScript packages:');
  
  // Create a test package.json
  const packageJsonPath = path.join(tempDir, 'package.json');
  fs.writeFileSync(packageJsonPath, JSON.stringify({
    name: 'agentbridge-test',
    version: '1.0.0',
    private: true,
    dependencies: {}
  }, null, 2));
  
  // Build the packages if not already built
  try {
    console.log('\nBuilding JavaScript packages...');
    execSync('npm run build:js', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error building JavaScript packages:', error);
    return;
  }
  
  process.chdir(tempDir);
  
  // For each package, create a link and test importing it
  for (const packageName of jsPackages) {
    console.log(`\nTesting ${packageName}...`);
    
    // Get package directory
    const packageDir = path.join(process.cwd(), '..', '..', 'packages', 
      packageName.includes('core') ? 'core' : 
      packageName.includes('react-native') ? 'mobile/react-native' : 
      `web/${packageName.split('/')[1]}`);
    
    try {
      // Link the package
      console.log(`Linking ${packageName} from ${packageDir}`);
      execSync(`npm link ${packageDir}`, { stdio: 'inherit' });
      
      // Create a test file to import the package
      const testFile = path.join(tempDir, `test-${packageName.replace('/', '-')}.js`);
      fs.writeFileSync(testFile, `
        // Test importing the package
        try {
          const pkg = require('${packageName}');
          console.log('Successfully imported ${packageName}');
          console.log('Available exports:', Object.keys(pkg));
          process.exit(0);
        } catch (error) {
          console.error('Error importing ${packageName}:', error);
          process.exit(1);
        }
      `);
      
      // Try to run the test file
      console.log('Testing import...');
      execSync(`node ${testFile}`, { stdio: 'inherit' });
      console.log(`✅ ${packageName} can be imported successfully!`);
    } catch (error) {
      console.error(`❌ Error testing ${packageName}:`, error.message);
    }
  }
  
  // Return to project root
  process.chdir(path.join(tempDir, '..', '..'));
}

async function testFlutterPackage(tempDir) {
  console.log('\n📦 Testing Flutter package:');
  
  const flutterDir = path.join(tempDir, 'flutter_test');
  fs.ensureDirSync(flutterDir);
  
  process.chdir(flutterDir);
  
  try {
    // Create a Flutter project
    console.log('\nCreating a Flutter test project...');
    execSync('flutter create agentbridge_test_app', { stdio: 'inherit' });
    
    process.chdir(path.join(flutterDir, 'agentbridge_test_app'));
    
    // Edit pubspec.yaml to include the local agentbridge package
    const pubspecPath = path.join(process.cwd(), 'pubspec.yaml');
    let pubspecContent = fs.readFileSync(pubspecPath, 'utf8');
    
    // Add the agentbridge dependency to the pubspec
    const agentbridgePath = path.join(process.cwd(), '..', '..', '..', 'packages', 'mobile', 'flutter');
    pubspecContent = pubspecContent.replace(
      'dependencies:',
      `dependencies:
  agentbridge:
    path: ${agentbridgePath.replace(/\\/g, '/')}`
    );
    
    fs.writeFileSync(pubspecPath, pubspecContent);
    console.log('Updated pubspec.yaml with agentbridge dependency');
    
    // Get the dependencies
    console.log('Installing Flutter dependencies...');
    execSync('flutter pub get', { stdio: 'inherit' });
    
    // Create a test file to import the package
    const mainDartPath = path.join(process.cwd(), 'lib', 'main.dart');
    let mainDartContent = fs.readFileSync(mainDartPath, 'utf8');
    
    // Add the import at the top
    mainDartContent = `import 'package:agentbridge/agentbridge.dart';\n${mainDartContent}`;
    
    // Add a usage example in the _MyHomePageState class
    mainDartContent = mainDartContent.replace(
      'class _MyHomePageState extends State<MyHomePage> {',
      `class _MyHomePageState extends State<MyHomePage> {
  // Initialize AgentBridge
  final agentBridge = AgentBridge.instance;
  
  @override
  void initState() {
    super.initState();
    
    // Test using agentbridge
    try {
      agentBridge.registerFunction({
        'name': 'testFunction',
        'description': 'A test function',
        'parameters': {
          'type': 'object',
          'properties': {
            'param': {'type': 'string'}
          }
        },
        'handler': (params, context) async {
          print('AgentBridge test function called with: \${params}');
          return {'success': true};
        }
      });
      print('AgentBridge successfully initialized and function registered!');
    } catch (e) {
      print('Error initializing AgentBridge: \$e');
    }
  }`
    );
    
    fs.writeFileSync(mainDartPath, mainDartContent);
    console.log('Updated main.dart with agentbridge import and usage');
    
    // Try to build the app
    console.log('Building Flutter test app...');
    execSync('flutter build apk --debug', { stdio: 'inherit' });
    
    console.log(`✅ agentbridge Flutter package can be used successfully!`);
  } catch (error) {
    console.error(`❌ Error testing Flutter package:`, error.message);
  }
  
  // Return to project root
  process.chdir(path.join(tempDir, '..', '..'));
}

// Run the tests
testPackages().catch(console.error); 