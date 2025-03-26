const path = require('path');
const fs = require('fs-extra');

// Utility function to safely remove directory contents
async function safeEmptyDir(dirPath, logger) {
  try {
    // Validate directory path
    if (!dirPath || typeof dirPath !== 'string') {
      throw new Error('Invalid directory path provided');
    }

    // Ensure directory exists
    await fs.ensureDir(dirPath);

    // Log directory cleanup
    logger.info(`Cleaning directory: ${dirPath}`, { 
      directory: dirPath 
    });

    // Safely empty directory contents
    await fs.emptyDir(dirPath);

    return true;
  } catch (error) {
    logger.error('Failed to empty directory', {
      directory: dirPath,
      errorMessage: error.message,
      errorStack: error.stack
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
      environment: process.env.NODE_ENV || 'unknown'
    });

    // Performance tracking
    const startTime = Date.now();

    // Prepare test environment
    await prepareTestEnvironment(logger);

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
      timestamp: new Date().toISOString()
    });

    // Rethrow error to fail the setup process
    throw error;
  }
}

// Export the global setup function
module.exports = globalSetup;
