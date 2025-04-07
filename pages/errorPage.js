const winston = require('winston');
const BasePage = require('./basePage');
const errorLocators = require('../locators/errorLocators');
const constants = require('../config/constants');
const Wait = require('../utils/Wait');

// Logger configuration similar to cmsAdminPage.js
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.simple()
        }),
        new winston.transports.File({ 
            filename: 'logs/error-page.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

class ErrorPage extends BasePage {
    constructor(page) {
        super(page);
        this.wait = new Wait(page);
        logger.info('ErrorPage initialized');
    }

    /**
     * Utility method to safely execute actions with logging
     */
    async safeExecute(methodName, action) {
        try {
            logger.info(`Executing method: ${methodName}`);
            return await action();
        } catch (error) {
            logger.error(`Error in ${methodName}`, { 
                error: error.message,
                stack: error.stack 
            });
            throw error;
        }
    }

    /**
     * Navigate to an invalid URL to generate a 404 error page
     * @param {string} baseUrl - Base site URL
     * @param {string} invalidPath - Invalid path to append
     * @returns {ErrorPage} - Returns this for method chaining (Fluent Interface)
     */
    async navigateToErrorPage(baseUrl, invalidPath = 'sorve') {
        return this.safeExecute('navigateToErrorPage', async () => {
            const url = `${baseUrl}/en/${invalidPath}`;
            
            logger.info('Navigating to error page', { 
                baseUrl, 
                invalidPath, 
                fullUrl: url 
            });

            await this.navigate(url);
            await this.wait.forLoadState('domcontentloaded', constants.DEFAULT_TIMEOUT);
            
            logger.info('Successfully navigated to error page');
            return this;
        });
    }

    /**
     * Check if the globe icon is visible
     * @returns {Promise<boolean>} True if globe icon is visible
     */
    async isGlobeIconVisible() {
        return this.safeExecute('isGlobeIconVisible', async () => {
            await this.wait.forLoadState('networkidle', constants.DEFAULT_TIMEOUT);
            
            const isVisible = await this.isElementVisible(errorLocators.globeIcon);
            
            logger.info('Globe icon visibility check', { 
                isVisible 
            });
            
            return isVisible;
        });
    }

    /**
     * Check if the globe icon is clickable
     * @returns {Promise<boolean>} True if the globe icon can be clicked
     */
    async isGlobeIconClickable() {
        return this.safeExecute('isGlobeIconClickable', async () => {
            // Wait for the element to be clickable
            const locator = await this._getLocator(errorLocators.globeIcon);
            await locator.waitFor({ state: 'attached' });
            
            // Check if the element is enabled
            const isEnabled = await locator.isEnabled();
            
            logger.info('Globe icon clickability check', { 
                isClickable: isEnabled 
            });
            
            return isEnabled;
        });
    }

    /**
     * Click on the globe icon
     * @returns {Promise<void>}
     */
    async clickGlobeIcon() {
        return this.safeExecute('clickGlobeIcon', async () => {
            logger.info('Clicking globe icon');
            
            await this.clickElement(errorLocators.globeIcon);
            
            logger.info('Globe icon clicked successfully');
        });
    }

    /**
     * Verify we're on an error page
     * @returns {Promise<boolean>} True if error page content is visible
     */
    async isErrorPageDisplayed() {
        return this.safeExecute('isErrorPageDisplayed', async () => {
            const isErrorPage = await this.isElementVisible(errorLocators.errorPageContent);
            
            logger.info('Error page display check', { 
                isErrorPageDisplayed: isErrorPage 
            });
            
            return isErrorPage;
        });
    }
}

module.exports = ErrorPage;
