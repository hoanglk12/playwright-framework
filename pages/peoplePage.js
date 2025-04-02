const constants = require('../config/constants');
const peopleLocators = require('../locators/peopleLocators');
const Wait = require('../utils/Wait');
const BasePage = require('./basePage');
require('dotenv').config();
const winston = require('winston');
const env = process.env.TEST_ENV || 'dev'; // Default to 'dev' if not specified
const envConfig = require(`../environments/${env}.config.js`);
// Configure Winston Logger
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
            filename: 'logs/people-page.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});
class PeoplePage extends BasePage {
    constructor(page) {
        super(page);
        this.basePage = new BasePage(page);
        this.wait = new Wait(page);
        logger.info('People Page initialized', { env });
    }
     // Utility method to safely execute actions with logging
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

     // Mask sensitive information
     maskSensitiveInfo(info) {
        if (!info) return info;
        return info.substring(0, 2) + '*'.repeat(info.length - 4) + info.slice(-2);
    }


    /**
     * Navigate to the people page
     * @returns {PeoplePage} - For method chaining (Fluent Interface Pattern)
     */
    async navigateToPeoplePage() {
        return this.safeExecute('navigateToPeoplePage', async () => {
            logger.info('Navigating to People Page', { 
                url: envConfig.baseUrl,
                username: this.maskSensitiveInfo(envConfig.users.validUser.username)
            });
        await this.basePage.navigate(envConfig.peopleListingPageUrl);
        await this.wait.forLoadState('domcontentloaded', constants.LONG_TIMEOUT);
        logger.info('Successfully navigated to People Page');
        return this;
        });
    }


    /**
     * Click on a random profile card
     * @returns {Promise<string>} The name of the clicked profile
     */
    async clickRandomProfileCard() {
        return this.safeExecute('clickRandomProfileCard', async () => {
            logger.info('Clicking random profile card ', {
                url: envConfig.baseUrl,
                username: this.maskSensitiveInfo(envConfig.users.validUser.username)
            });
        await this.page.waitForSelector(peopleLocators.profileName.selector, { state: 'visible' });
        const profileNames = await this.page.$$(peopleLocators.profileName.selector);
        
        if (profileNames.length === 0) {
            throw new Error('No profile cards found on the page');
        }
        
        // Select a random profile card
        const randomIndex = Math.floor(Math.random() * profileNames.length);
        const selectedCard = profileNames[randomIndex];
        
        // Get the name before clicking
        const nameElement = await selectedCard.$(peopleLocators.profileName.selector);
        const profileName = await nameElement.textContent();
        
        // Click the card
        await selectedCard.click();
        await this.wait.forLoadState('domcontentloaded', constants.LONG_TIMEOUT);
        logger.info('Successfully navigated to People Page');
        return profileName;
        });
    }

    /**
     * Check if profile banner image has lazy loading
     * @returns {Promise<{hasLazyLoading: boolean, loadingAttribute: string|null}>}
     */
    async checkProfileBannerImageLazyLoading() {
        return this.safeExecute('checkProfileBannerImageLazyLoading', async () => {
            logger.info('Checking profile banner image lazy loading', {
                url: envConfig.baseUrl,
                username: this.maskSensitiveInfo(envConfig.users.validUser.username)
            });
        await this.page.waitForSelector(peopleLocators.profileBannerImage.selector, { state: 'visible' });
        const bannerImage = await this.page.$(peopleLocators.profileBannerImage.selector);
        const loadingAttribute = await bannerImage.getAttribute('loading');
        logger.info('Banner image loading attribute: ', { loadingAttribute });
        return {
            hasLazyLoading: loadingAttribute === 'lazy',
            loadingAttribute: loadingAttribute
        };
    });
    }
}

module.exports = PeoplePage;