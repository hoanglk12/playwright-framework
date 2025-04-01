const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runParallelTests(env, tag) {
  // Load environment-specific .env file
  const envFile = path.resolve(process.cwd(), `.env.${env}`);
  
  if (!fs.existsSync(envFile)) {
    console.error(`❌ Environment file not found: ${envFile}`);
    process.exit(1);
  }

  try {
    console.log(`🚀 Running Parallel Tests`);
    console.log(`🌍 Environment: ${env}`);
    console.log(`🏷️  Tag: ${tag}`);

    // Command to run tests
    const command = [
      'npx',
      'playwright',
      'test',
      `--grep="${tag}"`,
      '--workers=50%',
      '--reporter=html,line'
    ].join(' ');

    // Execute tests with environment variables
    execSync(`ENV=${env} BASE_URL=${process.env.BASE_URL} ${command}`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        ENV: env
      }
    });

    console.log('✅ Test Execution Completed Successfully');
  } catch (error) {
    console.error('❌ Test Execution Failed');
    process.exit(1);
  }
}

// Get environment and tag from command line arguments
const env = process.env.ENV || 'dev';
const tag = process.env.TAGS || '@smokeTests';

runParallelTests(env, tag);
