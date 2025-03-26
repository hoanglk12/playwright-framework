const { clearAllureResults } = require('./utils/helpers');
const winston = require('winston');
const path = require('path');

// Create a single function export for global setup
module.exports = async function globalSetup() {
  // Create logger instance
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.printf(({ level, message, timestamp }) => {
        return `[${timestamp}] ${level}: ${message}`;
      })
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.colorize()
      }),
      new winston.transports.File({ 
        filename: path.resolve(process.cwd(), 'logs', 'global-setup.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5
      })
    ]
  });

  try {
    logger.info('🚀 Starting global setup process...');

    // Clear Allure results
    const allureResultsPath = path.resolve(process.cwd(), 'allure-results');
    logger.info(`Cleaning Allure results directory: ${allureResultsPath}`);
    await clearAllureResults(allureResultsPath);

    // Optional: Additional setup tasks
    logger.info('✅ Global setup completed successfully');
  } catch (error) {
    logger.error(`❌ Global setup failed: ${error.message}`);
    
    // Log stack trace in development
    if (process.env.NODE_ENV === 'development') {
      logger.error(`Error details: ${error.stack}`);
    }

    // Rethrow the error to fail the setup process
    throw error;
  }
};
