const devConfig = require('../environments/dev.config');
const insightsLocators = require('../locators/insightsLocators');
const BasePage = require('./basePage');


class InsightsPage extends BasePage{
    constructor(page) {  // Changed constructor signature
        super(page);     // Pass both browser and page to parent
    }


    async navigateToInsightsPage() {
        await this.page.goto(devConfig.insightsPageUrl);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async countVisibleArticles() {
        await this.page.waitForSelector(insightsLocators.articleCard, { state: 'attached' });
        const elements = await this.page.$$(insightsLocators.articleCard);
        return elements.length;
    }
    async closeBrowser() {
        await super.closeBrowserOnFailure();
        
    }
}

module.exports = InsightsPage;
