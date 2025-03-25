const winston = require('winston');
const path = require('path');
const fs = require('fs');

class Logger {
  constructor() {
    // Ensure log directory exists
    const logDir = path.join(process.cwd(), 'test-results', 'logs');
    fs.mkdirSync(logDir, { recursive: true });

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
      defaultMeta: { service: 'playwright-framework' },
      transports: [
        // Console transport
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        
        // File transport for all logs
        new winston.transports.File({
          filename: path.join(logDir, 'combined.log'),
          level: 'info'
        }),
        
        // Separate error log
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          level: 'error'
        })
      ]
    });
  }

  // Log methods
  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  error(message, error = {}) {
    this.logger.error(message, {
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack
    });
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }

  // Test-specific logging
  logTestStart(testName, testDetails = {}) {
    this.info(`Test Started: ${testName}`, {
      type: 'TEST_START',
      ...testDetails
    });
  }

  logTestEnd(testName, status, duration, additionalInfo = {}) {
    this.info(`Test Completed: ${testName}`, {
      type: 'TEST_END',
      status,
      duration,
      ...additionalInfo
    });
  }
}

module.exports = new Logger();
