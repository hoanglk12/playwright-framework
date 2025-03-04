const cmsLocators = require('../locators/cmsAdminLocators');
const LoginPage = require('./loginPage');
const devConfig = require('../environments/dev.config'); 

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
        await this.page.click(cmsLocators.applicationListIcon);
        await this.page.waitForTimeout(1000); // Adjust based on actual load time
    }
    async enterToSearchBox() {
        await this.page.locator(cmsLocators.searchTextBox).focus();
        await this.page.fill(cmsLocators.searchTextBox,'Pages');
        await this.page.keyboard.press('Enter');
        await this.page.waitForLoadState('networkidle');
        await this.page.locator('//li[@class="js-filter-item highlighted"]//a[text()="Pages"]').click();
        await this.page.waitForTimeout(1000); // Adjust based on actual load time
    }

    async clickInsightsCMSPage() {
        await this.page.waitForLoadState('networkidle');
        const iframe = await this.page.frame({ name: 'cmsdesktop' });
        if (!iframe) throw new Error('Iframe not found');
        await iframe.getByRole('link', { name: 'Insights Published page' }).click();
        await this.page.waitForTimeout(1000); // Adjust based on actual load time
    }

    async clickContentTab() {
        await this.page.waitForLoadState('networkidle');
        await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="contentview"]').contentFrame().getByRole('link', { name: 'Page' }).click();
        await this.page.waitForLoadState('networkidle');
        await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="contentview"]').contentFrame().getByRole('link', { name: 'Content' }).click();
        await this.page.waitForTimeout(1000); // Adjust based on actual load time
    }
    async getItemsPerPageValue() {
        await this.page.waitForLoadState('networkidle');
        const iframe_c = await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="contentview"]').contentFrame().locator('iframe[name="c"]').contentFrame();
        await this.page.waitForLoadState('networkidle');
        await iframe_c.getByRole('textbox', { name: 'Items Per Page' }).click();
        await this.page.waitForTimeout(1000);
        return await iframe_c.inputValue(cmsLocators.itemsPerPageInput);
    }
}

module.exports = CMSAdminPage;