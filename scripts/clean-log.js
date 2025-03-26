const logger = require('../utils/logger');

function cleanupLogs() {
    console.log('Starting log cleanup...');
    logger.cleanupLogs();
    console.log('Log cleanup completed.');
}

cleanupLogs();
