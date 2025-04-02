const path = require('path');
const fs = require('fs-extra');
const os = require('os');
// Correct import for AllureMetadataGenerator
const AllureMetadataGenerator = require('./utils/allure-metadata');

// Utility function to safely remove directory contents with enhanced error handling
async function safeEmptyDir(dirPath, logger) {
  try {
    // Validate directory path
    if (!dirPath || typeof dirPath !== 'string') {
      throw new Error('Invalid directory path provided');
    }

    // Ensure directory exists with full permissions
    await fs.ensureDir(dirPath, { mode: 0o777 });

    // Attempt to change directory permissions
    try {
      // For Windows and Unix-like systems
      await fs.chmod(dirPath, 0o777);
    } catch (permissionError) {
      logger.warn('Could not change directory permissions', {
        directory: dirPath,
        errorMessage: permissionError.message
      });
    }

    // Log directory cleanup
    logger.info(`Cleaning directory: ${dirPath}`, { 
      directory: dirPath 
    });

    // Advanced directory clearing strategy
    const files = await fs.readdir(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      try {
        // Attempt to remove file/directory with full permissions
        await fs.remove(filePath);
        logger.info(`Removed: ${file} successfully`);
      } catch (removeError) {
        logger.warn(`Failed to remove ${file}`, {
          errorMessage: removeError.message,
          filePath: filePath
        });

        // Attempt to force close any open handles (Windows-specific)
        if (process.platform === 'win32') {
          try {
            // Use taskkill to close any potential processes using the file
            const { exec } = require('child_process');
            await new Promise((resolve, reject) => {
              exec(`taskkill /F /IM ${file}`, (error) => {
                if (error) reject(error);
                resolve();
              });
            });
          } catch (killError) {
            logger.error(`Failed to kill process for ${file}`, {
              errorMessage: killError.message
            });
          }
        }
      }
    }

    return true;
  } catch (error) {
    logger.error('Failed to empty directory', {
      directory: dirPath,
      errorMessage: error.message,
      errorStack: error.stack,
      platform: process.platform,
      arch: os.arch()
    });
    throw error;
  }
}

// Utility function to clear Allure results
async function clearAllureResults(logger) {
  const allureResultsPath = path.resolve(process.cwd(), 'allure-results');
  
  try {
    await safeEmptyDir(allureResultsPath, logger);
    logger.info('Allure results directory cleared successfully');
  } catch (error) {
    logger.error('Failed to clear Allure results', {
      errorMessage: error.message
    });
    throw error;
  }
}

// Utility function to prepare test environment
async function prepareTestEnvironment(logger) {
  const environmentSetups = [
    {
      name: 'Allure Results',
      action: () => clearAllureResults(logger)
    },
    {
      name: 'Logs Directory',
      action: async () => {
        const logsPath = path.resolve(process.cwd(), 'logs');
        await safeEmptyDir(logsPath, logger);
      }
    },
    // Add more environment setup tasks as needed
  ];

  for (const setup of environmentSetups) {
    try {
      logger.info(`Preparing ${setup.name}`);
      await setup.action();
    } catch (error) {
      logger.error(`Failed to prepare ${setup.name}`, {
        errorMessage: error.message
      });
      throw error;
    }
  }
}

// Global setup function with comprehensive error handling
async function globalSetup() {
  const logger = require('./utils/logger');

  try {
    // Start setup process
    logger.info('🚀 Initiating global test environment setup', {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      platform: process.platform,
      arch: os.arch()
    });

    // Performance tracking
    const startTime = Date.now();

    // Prepare test environment
    await prepareTestEnvironment(logger);
    try {
      // Add more detailed logging
      logger.info('Generating Allure metadata...');
      // Generate Allure metadata
      AllureMetadataGenerator.writeAllureMetadata('./allure-results', {
        'base.url': process.env.BASE_URL || 'unknown',
        'test.environment': process.env.TEST_ENV || 'dev',
        'additional.debug.info': true // Add extra debugging information
      });
      logger.info('Metadata generation completed successfully');
    } catch (error) {
      logger.error('Metadata generation failed:', error);
    }
    // Calculate setup duration
    const duration = Date.now() - startTime;

    logger.info('✅ Global setup completed successfully', {
      setupDuration: `${duration}ms`
    });
  } catch (error) {
    // Comprehensive error logging
    logger.error('❌ Global setup process failed', {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      platform: process.platform
    });

    // Rethrow error to fail the setup process
    throw error;
  }
}

// Export the global setup function
module.exports = globalSetup;
