const insightsLocators = require('../locators/insightsLocators');

class InsightsPage {
    constructor(page) {
        this.page = page;
    }

    async navigateToInsightsPage() {
        await this.page.goto(
            liveSiteUrl
        );
        await this.page.waitForLoadState('networkidle');
    }

    async countVisibleLawyers() {
        const elements = await this.page.$$(insightsLocators.lawyerCards);
        return elements.length;
    }
}

module.exports = InsightsPage;