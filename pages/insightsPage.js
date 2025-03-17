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

   
}

module.exports = InsightsPage;