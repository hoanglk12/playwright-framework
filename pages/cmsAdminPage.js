const cmsLocators = require('../locators/cmsAdminLocators');
const LoginPage = require('./loginPage');
const devConfig = require('../environments/dev.config');
const Wait = require('../utils/Wait');  // Remove destructuring

class CMSAdminPage extends LoginPage {
    constructor(page) {
        super(page);
        this.wait = new Wait(page);  // Initialize with proper constructor
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
        await this.page.fill(cmsLocators.searchTextBox, 'Pages');
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
        try {
            await this.wait.forLoadState('load', 60000);
            
            const frame = await this.page.frame('cmsdesktop');
            if (!frame) throw new Error('Desktop frame not found');
            
            const contentFrame = frame.frameLocator('iframe[name="contentview"]').first();
            await contentFrame.locator(cmsLocators.contentTab).click();
            
            await this.page.waitForTimeout(2000);
        } catch (error) {
            console.error('Error in clickContentTab:', error);
            throw error;
        }
    }

    async getItemsPerPageValue() {
        try {
            /*const frame = await this.page.frame('cmsdesktop');
            if (!frame) throw new Error('Desktop frame not found');
            
            const contentView = frame.frameLocator('iframe[name="contentview"]');
            
            // Use window.scroll in the frame context
            await frame.evaluate(() => {
                const contentFrame = document.querySelector('iframe[name="contentview"]');
                if (contentFrame && contentFrame.contentWindow) {
                    contentFrame.contentWindow.scroll(0, 1000);
                }
            });*/
            //await this.page.waitForTimeout(1000);
            //await this.page.waitForLoadState('networkidle');
            //const itemsPerPage = contentView.locator(cmsLocators.itemsPerPageInput);
            //await this.page.mouse.down("middle");
            await this.page.evaluate(() => {
                window.scrollBy(0, 500); // Scrolls inside the iframe
              });
            const itemsPerPageElement = this.page.locator(cmsLocators.itemsPerPageInput);
            await itemsPerPageElement.waitFor({ state: 'visible', timeout: 5000 });
            const value = await itemsPerPageElement.inputValue();
            console.log('Items per page value:', value);
            return value;
            
        } catch (error) {
            console.error('Error in getItemsPerPageValue:', error);
            throw error;
        }
    }
}

module.exports = CMSAdminPage;