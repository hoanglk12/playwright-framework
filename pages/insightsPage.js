const constants = require('../config/constants');
const insightsLocators = require('../locators/insightsLocators');
const Wait = require('../utils/Wait');
const BasePage = require('./basePage');
require('dotenv').config();
const env = process.env.TEST_ENV || 'dev'; // Default to 'dev' if not specified
const envConfig = require(`../environments/${env}.config.js`);

class InsightsPage extends BasePage {
    constructor(page) {
        super(page);
        this.basePage = new BasePage(page);
        this.wait = new Wait(page);
        
    }

    async navigateToInsightsPage() {
        await this.basePage.navigate(envConfig.insightsPageUrl);
        await this.wait.forLoadState('domcontentloaded', constants.LONG_TIMEOUT); // Use the method from BasePage
    }

    async countVisibleArticles() {
        await this.page.waitForSelector(insightsLocators.articleCard.selector, { state: 'visible' });
        const elements = await this.page.$$(insightsLocators.articleCard.selector);
        return elements.length;
        
    }
/**
     * Click on a random article card
     * @returns {Promise<string>} The title of the clicked article
     */
async clickRandomArticleCard() {
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
    
    return articleTitle;
}

/**
 * Check if inner banner image has lazy loading
 * @returns {Promise<{hasLazyLoading: boolean, loadingAttribute: string|null}>}
 */
async checkInnerBannerImageLazyLoading() {
    await this.page.waitForSelector(insightsLocators.innerBannerImage.selector, { state: 'visible' });
    const bannerImage = await this.page.$(insightsLocators.innerBannerImage.selector);
    const loadingAttribute = await bannerImage.getAttribute('loading');
    
    return {
        hasLazyLoading: loadingAttribute === 'lazy',
        loadingAttribute: loadingAttribute
    };
}

   
}

module.exports = InsightsPage;