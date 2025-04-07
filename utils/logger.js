const winston = require('winston');
const path = require('path');
const fs = require('fs');
const os = require('os');

class Logger {
    constructor() {
        // Ensure logs directory exists
        this.logDirectory = this.createLogDirectory();

        // Create logger instance
        this.logger = this.createLogger();

        // Setup log cleanup on initialization
        this.setupLogCleanup();
    }

    // Create log directory with improved error handling
    createLogDirectory() {
        const baseLogDir = path.join(process.cwd(), 'logs');
        
        try {
            // Create logs directory with recursive option
            fs.mkdirSync(baseLogDir, { recursive: true });

            // Add process-specific subdirectory
            const processLogDir = path.join(baseLogDir, `process-${process.pid}`);
            fs.mkdirSync(processLogDir, { recursive: true });

            return processLogDir;
        } catch (error) {
            console.error('Failed to create log directory:', error);
            
            // Fallback to temp directory if custom directory creation fails
            const fallbackDir = path.join(os.tmpdir(), 'app-logs', `process-${process.pid}`);
            fs.mkdirSync(fallbackDir, { recursive: true });
            
            return fallbackDir;
        }
    }

    // Create Winston Logger with enhanced configuration
    createLogger() {
        // Custom log format with improved readability
        const logFormat = winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.errors({ stack: true }),
            winston.format.printf(({ timestamp, level, message, ...metadata }) => {
                // Construct log message with improved formatting
                const metadataStr = Object.keys(metadata).length > 0 
                    ? ` | ${JSON.stringify(metadata, null, 2)}` 
                    : '';
                
                return `${timestamp} [${level.toUpperCase()}]: ${message}${metadataStr}`;
            })
        );

        // Create logger with advanced configuration
        const logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: logFormat,
            defaultMeta: { 
                service: process.env.SERVICE_NAME || 'default-service',
                pid: process.pid,
                hostname: os.hostname()
            },
            transports: this.createTransports()
        });

        // Add unhandled exception and rejection handlers
        this.setupGlobalErrorHandlers(logger);

        return logger;
    }

    // Create logger transports with more robust configuration
    createTransports() {
        return [
            // Console transport with color and formatting
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize({ all: true }),
                    winston.format.printf(({ message }) => message)
                )
            }),
            
            // Combined log file
            new winston.transports.File({
                filename: path.join(this.logDirectory, 'combined.log'),
                maxsize: 10 * 1024 * 1024, // 10MB
                maxFiles: 10,
                tailable: true
            }),
            
            // Separate error log
            new winston.transports.File({
                level: 'error',
                filename: path.join(this.logDirectory, 'error.log'),
                maxsize: 5 * 1024 * 1024, // 5MB
                maxFiles: 5,
                tailable: true
            })
        ];
    }

    // Setup global error handlers
    setupGlobalErrorHandlers(logger) {
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            process.exit(1);
        });

        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection', {
                reason: reason instanceof Error ? reason.message : reason
            });
        });
    }

    // Log methods with improved type checking and flexibility
    info(message, metadata = {}) {
        this.safeLog('info', message, metadata);
    }

    error(message, error = {}) {
        const metadata = error instanceof Error 
            ? {
                errorName: error.name,
                errorMessage: error.message,
                stack: error.stack
            }
            : error;

        this.safeLog('error', message, metadata);
    }

    warn(message, metadata = {}) {
        this.safeLog('warn', message, metadata);
    }

    debug(message, metadata = {}) {
        this.safeLog('debug', message, metadata);
    }

    // Safe logging method to prevent logging failures
    safeLog(level, message, metadata = {}) {
        try {
            // Ensure metadata is an object
            const safeMetadata = metadata && typeof metadata === 'object' 
                ? metadata 
                : { originalMetadata: metadata };

            // Log using Winston
            this.logger[level](message, safeMetadata);
        } catch (logError) {
            // Fallback to console if logging fails
            console[level](`Failed to log ${level}: ${message}`, metadata);
            console.error('Logging error:', logError);
        }
    }

    // Log cleanup method with improved error handling
    setupLogCleanup(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days
        const cleanupInterval = 24 * 60 * 60 * 1000; // Daily cleanup

        const performCleanup = () => {
            try {
                const now = Date.now();

                fs.readdirSync(this.logDirectory)
                    .filter(file => file.endsWith('.log'))
                    .forEach(file => {
                        const filePath = path.join(this.logDirectory, file);
                        
                        try {
                            const stats = fs.statSync(filePath);
                            
                            if (now - stats.mtime.getTime() > maxAge) {
                                fs.unlinkSync(filePath);
                                this.info(`Deleted old log file: ${file}`);
                            }
                        } catch (fileError) {
                            this.error(`Failed to process log file ${file}`, fileError);
                        }
                    });
            } catch (cleanupError) {
                console.error('Log cleanup failed:', cleanupError);
            }
        };

        // Perform initial cleanup
        performCleanup();

        // Schedule periodic cleanup
        setInterval(performCleanup, cleanupInterval);
    }

    // Method to log performance metrics
    logPerformance(testName, metrics) {
        this.info('Performance Metrics', {
            testName,
            ...metrics,
            timestamp: new Date().toISOString()
        });
    }

    // Method to log screenshots with additional context
    logScreenshot(testName, screenshotPath, additionalContext = {}) {
        this.info('Screenshot Captured', {
            testName,
            screenshotPath,
            ...additionalContext
        });
    }
}

// Export singleton instance
module.exports = new Logger();
