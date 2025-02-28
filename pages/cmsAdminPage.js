const cmsLocators = require('../locators/cmsAdminLocators');
const LoginPage = require('./loginPage');
const devConfig = require('../environments/dev.config'); 
const cmsAdminLocators = require('../locators/cmsAdminLocators');
class CMSAdminPage extends LoginPage {
    
    constructor(page) {
        super(page);
    }

    async navigateToCMSAdmin() {
      await this.navigateToLoginPage(devConfig.baseUrl);
        await this.enterUsername(devConfig.users.validUser.username);
        await this.enterPassword(devConfig.users.validUser.password);
        await this.clickLogin();
    }

    async clickApplicationListIcon() {
        await this.page.waitForLoadState('networkidle');
        await this.page.click(cmsAdminLocators.applicationListIcon);
        await this.page.waitForTimeout(1000); // Adjust based on actual load time
    }
    async enterToSearchBox() {
        await this.page.locator(cmsAdminLocators.searchTextBox).focus();
        await this.page.fill(cmsAdminLocators.searchTextBox,'Pages');
        await this.page.keyboard.press('Enter');
        await this.page.waitForLoadState('networkidle');
        await this.page.locator('//li[@class="js-filter-item highlighted"]//a[text()="Pages"]').click();
        await this.page.waitForTimeout(1000); // Adjust based on actual load time
    }

    async clickInsightsCMSPage() {
        await this.page.waitForLoadState('networkidle');
        //await this.page.click(cmsLocators.insightsCMSPage);
       // await this.page.locator(cmsLocators.insightsCMSPage).waitFor({ state: 'visible', timeout: 30000 });
        //await page.locator(cmsLocators.insightsCMSPage).click({ timeout: 30000 });
        await this.page.hover(cmsLocators.insightsCMSPage);
        await this.page.click(cmsLocators.insightsCMSPage);

        await this.page.waitForTimeout(1000); // Adjust based on actual load time
    }
    async clickContentTab() {
        await this.page.waitForLoadState('networkidle');
        await this.page.click(cmsLocators.contentTab);
        await this.page.waitForTimeout(1000); // Adjust based on actual load time
    }
    async getItemsPerPageValue() {
        return await this.page.inputValue(cmsLocators.itemsPerPageInput);
    }
}

module.exports = CMSAdminPage;