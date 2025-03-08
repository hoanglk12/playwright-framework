const cmsLocators = require('../locators/cmsAdminLocators');
const LoginPage = require('./loginPage');
const devConfig = require('../environments/dev.config');
const Wait = require('../utils/Wait');  // Remove destructuring
const cmsAdminData = require('../utils/cmsAdminData.json'); // Import the JSON data
const BasePage = require('./basePage');
const loginLocators = require('../locators/loginLocators');
const constants = require('../config/constants');
const cmsAdminLocators = require('../locators/cmsAdminLocators');

class CMSAdminPage extends BasePage {
    constructor(page) {
        super(page);
        this.basePage = new BasePage(page);
        this.wait = new Wait(page);  // Initialize with proper constructor
    }

    async navigateToCMSAdmin() {
        await this.basePage.navigate(devConfig.baseUrl);
        await this.basePage.fillElement(loginLocators.usernameField, devConfig.users.validUser.username);
        await this.basePage.fillElement(loginLocators.passwordField, devConfig.users.validUser.password);
        await this.basePage.clickElement(loginLocators.loginButton);
        await this.wait.forLoadState('networkidle', constants.LONG_TIMEOUT); // Use the method from Wait
    }

    async clickApplicationListIcon() {
        await this.wait.forLoadState('networkidle', constants.LONG_TIMEOUT); 
        await this.basePage.clickElement(cmsLocators.applicationListIcon);
        await this.wait.forLoadState('networkidle', constants.SHORT_TIMEOUT); // Adjust based on actual load time
    }

    async enterToSearchBox() {
        await this.basePage.waitForElementFocused(cmsAdminLocators.searchTextBox);
        await this.basePage.fillElement(cmsLocators.searchTextBox, cmsAdminData.searchTextPages);
        await this.basePage.pressKey('Enter');
        await this.wait.forLoadState('networkidle', constants.LONG_TIMEOUT); 
        await this.basePage.clickElement(cmsLocators.pageTab);
        await this.wait.forLoadState('networkidle', constants.DEFAULT_TIMEOUT);  // Adjust based on actual load time
    }

    async clickInsightsCMSPage() {
        // const iframe = await this.page.frame({ name: 'cmsdesktop' });
        // if (!iframe) throw new Error('Iframe not found');
        // await iframe.getByRole('link', { name: 'Insights Published page' }).click();
        // await this.page.waitForTimeout(1000); // Adjust based on actual load time
        //await this.wait._waitForFrame
        await this.basePage.clickElementInFrameLocator(cmsAdminLocators.iframeHierarchy.cmsDesktop.selector, cmsAdminLocators.insightsPublishedPage.selector.roleType,cmsAdminLocators.insightsPublishedPage.selector.roleName);
    }

    async clickContentTab() {
        try {
            await this.wait.forLoadState('load', 60000);
            
            const frame = await this.wait.forFrame('cmsdesktop');
            const contentFrame = frame.frameLocator('iframe[name="contentview"]').first();
            await contentFrame.locator(cmsAdminLocators.contentTab.selector).click();
            
            await this.page.waitForTimeout(2000);
        } catch (error) {
            console.error('Error in clickContentTab:', error);
            throw error;
        }
        
    }

    async getItemsPerPageValue() {
        try {
            await this.wait.forLoadState('load', 60000);
            const itemsPerPageElement = await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="contentview"]').contentFrame().locator('iframe[name="c"]').contentFrame().getByRole('textbox', { name: 'Items Per Page:' });
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