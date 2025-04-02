const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const dotenv = require('dotenv');

// Get project root directory (one level up from scripts folder)
const projectRoot = path.resolve(__dirname, '..');

// Robust AllureMetadataGenerator import with fallback
let AllureMetadataGenerator;
try {
  AllureMetadataGenerator = require('../utils/allure-metadata');
} catch (error) {
  console.warn('\x1b[33m⚠️ AllureMetadataGenerator not found. Using minimal implementation.\x1b[0m');
  AllureMetadataGenerator = class {
    constructor(options = {}) {
      this.options = options;
    }
    
    generateTestRunMetadata() {
      console.log('\x1b[33m⚠️ Using placeholder metadata generation\x1b[0m');
      return {
        env: this.options.env || 'unknown',
        timestamp: new Date().toISOString()
      };
    }
  };
}
/**
 * Loads environment variables from the specified environment file
 * @param {string} env - Environment name
 * @returns {Object} - Environment variables
 */
function loadEnvironmentFile(env) {
  const envFilePath = path.resolve(projectRoot, `.env.${env}`);
  
  if (!fs.existsSync(envFilePath)) {
    console.log(`\x1b[33mWarning: Environment file not found: ${envFilePath}\x1b[0m`);
    console.log('\x1b[33mUsing default environment variables.\x1b[0m');
    return {};
  }
  
  return dotenv.config({ path: envFilePath }).parsed || {};
}

/**
 * Generate comprehensive Allure metadata for test run
 * @param {string} env - Test environment 
 * @param {Object} options - Additional metadata options
 * @returns {Object} - Generated metadata
 */
function generateAllureMetadata(env, options = {}) {
  try {
    // Collect system and runtime information
    const systemInfo = {
      os: {
        platform: os.platform(),
        release: os.release(),
        arch: os.arch()
      },
      runtime: {
        node: process.version,
        pid: process.pid
      },
      hardware: {
        cpus: os.cpus().length,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem()
      }
    };

    // Create metadata generator instance
    const generator = new AllureMetadataGenerator({
      resultsDir: path.resolve(projectRoot, './allure-results'),
      env: env,
      systemInfo: systemInfo,
      testRunDetails: {
        framework: 'Playwright',
        language: 'JavaScript',
        parallel: options.parallel !== false,
        workers: options.workers || 'default',
        timestamp: new Date().toISOString(),
        ...options
      }
    });

    // Generate and return test run metadata
    const metadata = generator.generateTestRunMetadata();
    
    console.log('\x1b[32m✅ Allure metadata generated successfully\x1b[0m');
    return metadata;
  } catch (error) {
    console.error(`\x1b[31m❌ Metadata generation failed: ${error.message}\x1b[0m`);
    return null;
  }
}

/**
 * Discover test files in specified location
 * @param {string} location - Test file location
 * @returns {string[]} - List of discovered test files
 */
function discoverTestFiles(location) {
  try {
    const testDir = path.isAbsolute(location) 
      ? location 
      : path.resolve(projectRoot, location);
    
    if (!fs.existsSync(testDir)) {
      console.warn(`\x1b[33m⚠️ Test directory not found: ${testDir}\x1b[0m`);
      return [];
    }

    // Recursive file discovery with filter
    const testFiles = [];
    function findTestFiles(dir) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          findTestFiles(fullPath);
        } else if (file.endsWith('.spec.js') || file.endsWith('.test.js')) {
          testFiles.push(fullPath);
        }
      });
    }

    findTestFiles(testDir);
    console.log(`\x1b[34m📋 Discovered ${testFiles.length} test files\x1b[0m`);
    return testFiles;
  } catch (error) {
    console.error(`\x1b[31m❌ Test file discovery failed: ${error.message}\x1b[0m`);
    return [];
  }
}

/**
 * Builds the Playwright command based on provided options
 * @param {Object} options - Command options
 * @returns {string} - Command to execute
 */
function buildPlaywrightCommand(options) {
  const {
    env = 'dev',
    tags,
    testLocation,
    parallel,
    workers,
    project,
    additionalArgs = []
  } = options || {};

  // Base command with environment
  let command = `cross-env TEST_ENV=${env}`;
  
  // Add tags if specified
  if (tags) {
    if (Array.isArray(tags)) {
      const tagPattern = tags.map(tag => {
        if (tag && typeof tag === 'string') {
          return tag.startsWith('@') ? tag : `@${tag}`;
        }
        return tag;
      }).join('|');
      command += ` TAGS="${tagPattern}"`;
    } else if (typeof tags === 'string') {
      const tag = tags.startsWith('@') ? tags : `@${tags}`;
      command += ` TAGS="${tag}"`;
    }
  }
  
  // Add Playwright command
  command += ' npx playwright test';
  
  // Add test location if specified
  if (testLocation) {
    if (Array.isArray(testLocation)) {
      command += ` ${testLocation.join(' ')}`;
    } else {
      command += ` ${testLocation}`;
    }
  }
  
  // Add project if specified
  if (project) {
    command += ` --project=${project}`;
  }
  
  // Set parallel options
  if (parallel === false) {
    command += ' --workers=1';
  } else if (workers) {
    command += ` --workers=${workers}`;
  }
  
  // Add any additional arguments
  if (Array.isArray(additionalArgs) && additionalArgs.length > 0) {
    command += ` ${additionalArgs.join(' ')}`;
  }
  
  return command;
}

/**
 * Run tests with the specified options
 * @param {Object} options - Run options
 */
function runTests(options) {
  try {
    console.log('\x1b[34m🚀 Starting test execution with the following configuration:\x1b[0m');
    console.log(`\x1b[36m   • Environment: ${options.env || 'dev'}\x1b[0m`);
    
    if (options.tags) {
      console.log(`\x1b[36m   • Tags: ${Array.isArray(options.tags) ? options.tags.join(', ') : options.tags}\x1b[0m`);
    }
    
    if (options.testLocation) {
      console.log(`\x1b[36m   • Test Location: ${Array.isArray(options.testLocation) ? options.testLocation.join(', ') : options.testLocation}\x1b[0m`);
      
      // Count test files
      const locations = Array.isArray(options.testLocation) ? options.testLocation : [options.testLocation];
      let totalTests = 0;
      
      locations.forEach(location => {
        if (location) {
          const count = discoverTestFiles(location);
          console.log(`\x1b[36m     - ${location}: ${count} test files\x1b[0m`);
          totalTests += count;
        }
      });
      
      console.log(`\x1b[36m   • Total Test Files: ${totalTests}\x1b[0m`);
    }
    
    if (options.project) {
      console.log(`\x1b[36m   • Browser: ${options.project}\x1b[0m`);
    }
    
    console.log(`\x1b[36m   • Parallel Execution: ${options.parallel !== false ? 'Yes' : 'No'}\x1b[0m`);
    
    if (options.parallel !== false && options.workers) {
      console.log(`\x1b[36m   • Workers: ${options.workers}\x1b[0m`);
    }
    
    // Load environment variables
    const envVars = loadEnvironmentFile(options.env || 'dev');
    console.log(`\x1b[32m✓ Loaded environment configuration for ${options.env || 'dev'}\x1b[0m`);
    
    // Build and execute command
    const command = buildPlaywrightCommand(options);
    console.log(`\n\x1b[34mExecuting command: ${command}\x1b[0m\n`);
    
    // Execute the command from project root
    execSync(command, { 
      stdio: 'inherit',
      env: { ...process.env, ...envVars },
      cwd: projectRoot
    });
    
    // Generate Allure metadata after test completion
    generateAllureMetadata(options.env || 'dev', {
      parallel: options.parallel !== false,
      workers: options.workers,
      tags: options.tags,
      testLocation: options.testLocation,
      project: options.project
    });
    
    console.log('\n\x1b[32m✓ Test execution completed successfully\x1b[0m');
  } catch (error) {
    console.error(`\n\x1b[31m✗ Test execution failed with exit code: ${error.status || 'unknown'}\x1b[0m`);
    
    // Still generate Allure metadata even if tests fail
    generateAllureMetadata(options.env || 'dev', {
      parallel: options.parallel !== false,
      workers: options.workers,
      tags: options.tags,
      testLocation: options.testLocation,
      project: options.project,
      status: 'failed'
    });
    
    process.exit(1);
  }
}

/**
 * Parse command line arguments
 * @returns {Object} - Parsed arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    env: 'dev',
    parallel: true
  };
  
  // Define test locations relative to project root
  const TEST_LOCATIONS = {
    api: './tests/api',
    specs: './tests/specs',
    performance: './tests/performance'
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--env' || arg === '-e') {
      if (i + 1 < args.length) {
        options.env = args[++i];
      }
    } else if (arg === '--tags' || arg === '-t') {
      if (i + 1 < args.length) {
        const tagValue = args[++i];
        if (tagValue && typeof tagValue === 'string' && tagValue.includes(',')) {
          options.tags = tagValue.split(',').map(t => t.trim());
        } else {
          options.tags = tagValue;
        }
      }
    } else if (arg === '--location' || arg === '-l') {
      if (i + 1 < args.length) {
        const locationValue = args[++i];
        if (locationValue && typeof locationValue === 'string') {
          if (locationValue.includes(',')) {
            options.testLocation = locationValue.split(',')
              .map(loc => loc.trim())
              .map(loc => TEST_LOCATIONS[loc] || loc);
          } else {
            options.testLocation = TEST_LOCATIONS[locationValue] || locationValue;
          }
        }
      }
    } else if (arg === '--parallel' || arg === '-p') {
      if (i + 1 < args.length) {
        options.parallel = args[++i] !== 'false';
      }
    } else if (arg === '--workers' || arg === '-w') {
      if (i + 1 < args.length) {
        options.workers = args[++i];
      }
    } else if (arg === '--project' || arg === '-b') {
      if (i + 1 < args.length) {
        options.project = args[++i];
      }
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    }
  }
  
  return options;
}

/**
 * Display help information
 */
function showHelp() {
  console.log(`
\x1b[1mParallel Environment Runner\x1b[0m

Usage: node scripts/parallel-env-runner.js [options]

Options:
  --env, -e       Target environment to run tests on (default: dev)
  --tags, -t      Test tags to run (e.g., @apiTests or multiple tags comma-separated)
  --location, -l  Test location (api, specs, performance or custom path)
  --parallel, -p  Run tests in parallel (true/false, default: true)
  --workers, -w   Number of parallel workers
  --project, -b   Browser project to use (chrome, firefox, edge)
  --help, -h      Show this help message

Examples:
  node scripts/parallel-env-runner.js --env dev --tags @apiTests
  node scripts/parallel-env-runner.js --env staging --location api
  node scripts/parallel-env-runner.js --env prod --parallel false
  node scripts/parallel-env-runner.js --env dev --project chrome
  `);
}

/**
 * Main function
 */
function main() {
  const options = parseArgs();
  runTests(options);
}

// Execute main function if this file is run directly
if (require.main === module) {
  main();
}

// Export functions for testing or programmatic use
module.exports = {
  loadEnvironmentFile,
  generateAllureMetadata,
  discoverTestFiles
};
