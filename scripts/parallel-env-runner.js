const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const dotenv = require('dotenv');

function loadEnvironmentFile(env) {
  // Construct path to environment-specific file
  const envFilePath = path.resolve(process.cwd(), `.env.${env}`);
  
  // Check if environment file exists
  if (!fs.existsSync(envFilePath)) {
    console.error(`❌ Environment file not found: ${envFilePath}`);
    process.exit(1);
  }

  // Load environment-specific variables
  const result = dotenv.config({ path: envFilePath });

  if (result.error) {
    console.error(`❌ Error loading environment file: ${result.error}`);
    process.exit(1);
  }

  // Log loaded environment variables for debugging
  console.log(`🔍 Loaded Environment Variables from ${envFilePath}:`);
  Object.entries(process.env)
    .filter(([key]) => key.startsWith('BASE_URL') || key.startsWith('TEST_'))
    .forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

  return process.env;
}

function runParallelTests(env, tag) {
  // Determine platform
  const platform = os.platform();
  const isWindows = platform === 'win32';
  const isUnix = ['darwin', 'linux'].includes(platform);

  try {
    // Load environment-specific variables
    const loadedEnv = loadEnvironmentFile(env);

    // Enhanced logging
    console.log(`🚀 Running Parallel Tests`);
    console.log(`🌍 Environment: ${env}`);
    console.log(`🏷️ Tag: ${tag}`);
    console.log(`💻 Platform: ${platform}`);

    // Base Playwright command
    const baseCommand = [
      'playwright',
      'test',
      `--grep="${tag}"`,
      '--workers=50%',
      '--reporter=allure-playwright'
    ];

    // Prepare environment variables
    const envVars = {
      ENV: env,
      TAGS: tag,
      BASE_URL: loadedEnv.BASE_URL || process.env.BASE_URL || '',
      // Add other environment-specific variables as needed
      ...Object.fromEntries(
        Object.entries(loadedEnv)
          .filter(([key]) => key.startsWith('TEST_') || key.startsWith('BASE_'))
      )
    };

    let fullCommand;

    if (isWindows) {
      // Windows-specific command construction
      fullCommand = [
        ...Object.entries(envVars).map(([key, value]) => `set "${key}=${value}"`),
        `npx.cmd ${baseCommand.join(' ')}`
      ].join(' && ');

      // Execute with shell for Windows
      execSync(fullCommand, { 
        stdio: 'inherit', 
        shell: 'cmd.exe',
        env: {
          ...process.env,
          ...envVars
        }
      });
    } else if (isUnix) {
      // Unix (Linux/macOS) handling
      fullCommand = [
        ...Object.entries(envVars).map(([key, value]) => `${key}=${value}`),
        'npx',
        ...baseCommand
      ].join(' ');

      // Execute directly for Unix
      execSync(fullCommand, { 
        stdio: 'inherit',
        env: {
          ...process.env,
          ...envVars
        }
      });
    } else {
      // Unsupported platform
      console.error(`❌ Unsupported platform: ${platform}`);
      process.exit(1);
    }

    console.log('✅ Test Execution Completed Successfully');
  } catch (error) {
    console.error('❌ Test Execution Failed');
    console.error(`Error Details:
      Message: ${error.message}
      Platform: ${platform}
      Command: ${fullCommand}
      Stack Trace: ${error.stack}`);
    process.exit(1);
  }
}

// Enhanced environment and tag resolution
function resolveEnvAndTag() {
  // Prioritized environment resolution
  const env = 
    process.argv[2] ||  // Command-line argument takes highest priority
    process.env.ENV ||  // Then check ENV variable
    process.env.TEST_ENV || 
    process.env.NODE_ENV || 
    'dev';

  // Prioritized tag resolution  
  const tag = 
    process.argv[3] ||  // Second command-line argument 
    process.env.TAGS || 
    process.env.TAG || 
    '@smokeTests';

  return { env, tag };
}

// Main execution
function main() {
  const { env, tag } = resolveEnvAndTag();
  
  // Log resolved values for transparency
  console.log(`📋 Resolved Environment: ${env}`);
  console.log(`🏷️  Resolved Tag: ${tag}`);

  runParallelTests(env, tag);
}

// Execute the main function
main();
