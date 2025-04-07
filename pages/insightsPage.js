const constants = require('../config/constants');
const insightsLocators = require('../locators/insightsLocators');
const Wait = require('../utils/Wait');
const BasePage = require('./basePage');
require('dotenv').config();
const env = process.env.TEST_ENV || 'dev'; // Default to 'dev' if not specified
const envConfig = require(`../environments/${env}.config.js`);
const Logger = require('../utils/logger');

class InsightsPage extends BasePage {
    constructor(page) {
        super(page);
        this.basePage = new BasePage(page);
        this.wait = new Wait(page);
        this.logger = Logger;
        
    }

    async navigateToInsightsPage() {
        try{
        this.logger.info(`Navigating to URL: ${envConfig.insightsPageUrl}`);
        await this.basePage.navigate(envConfig.insightsPageUrl);
        await this.wait.forLoadState('domcontentloaded', constants.LONG_TIMEOUT);
        this.logger.info(`Successfully navigated to URL: ${envConfig.insightsPageUrl}`);
        }
        catch (error) {
            this.logger.error(`Navigation failed to ${envConfig.insightsPageUrl}`, error);
            throw error;
        
        }
    }

    async countVisibleArticles() {
        try{
        this.logger.info(`Counting visible articles`);
        await this.page.waitForSelector(insightsLocators.articleCard.selector, { state: 'visible' });
        const elements = await this.page.$$(insightsLocators.articleCard.selector);
        this.logger.info(`Found ${elements.length} visible articles`);
        return elements.length;
        
        }
        catch (error) {
            this.logger.error(`Failed to count visible articles`, error);
            throw error;
        
        }
        
    }
/**
     * Click on a random article card
     * @returns {Promise<string>} The title of the clicked article
     */
async clickRandomArticleCard() {
    try {
        
    this.logger.info('Clicking on a random article card');
    await this.page.waitForSelector(insightsLocators.articleCard.selector, { state: 'visible' });
    const articleCards = await this.page.$$(insightsLocators.articleCard.selector);
    
    if (articleCards.length === 0) {
        throw new Error('No article cards found on the page');
    }
    
    // Select a random article card
    const randomIndex = Math.floor(Math.random() * articleCards.length);
    const selectedCard = articleCards[randomIndex];
    
    // Get the title before clicking
    const titleElement = await selectedCard.$(insightsLocators.articleTitle.selector);
    const articleTitle = await titleElement.textContent();
    
    // Click the card
    await selectedCard.click();
    await this.wait.forLoadState('domcontentloaded', constants.LONG_TIMEOUT);
    this.logger.info(`Successfully clicked on article: ${articleTitle}`);
    return articleTitle;
}
    catch (error) {
        this.logger.error(`Failed to click random article card`, error);
    }
}

/**
 * Check if inner banner image has lazy loading
 * @returns {Promise<{hasLazyLoading: boolean, loadingAttribute: string|null}>}
 */
async checkInnerBannerImageLazyLoading() {
    try {

    this.logger.info('Checking inner banner image lazy loading');
    
    await this.page.waitForSelector(insightsLocators.innerBannerImage.selector, { state: 'visible' });
    const bannerImage = await this.page.$(insightsLocators.innerBannerImage.selector);
    const loadingAttribute = await bannerImage.getAttribute('loading');
    
    return {
        hasLazyLoading: loadingAttribute === 'lazy',
        loadingAttribute: loadingAttribute
    };
}
    catch (error) {
        this.logger.error('Failed to check inner banner image lazy loading', error);
    }
}

   
}

module.exports = InsightsPage;