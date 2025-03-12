const cmsLocators = require('../locators/cmsAdminLocators');
const devConfig = require('../environments/dev.config');
const cmsAdminData = require('../utils/cmsAdminData.json');
const loginLocators = require('../locators/loginLocators');
const constants = require('../config/constants');
const cmsAdminLocators = require('../locators/cmsAdminLocators');
const articleDataLayerData = require('../utils/articleDataLayer-data.json');
const BasePage = require('./basePage');
const Wait = require('../utils/Wait');

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
      
        await this.basePage.clickElementInFrameLocator(cmsAdminLocators.iframeHierarchy.cmsDesktop.selector, cmsAdminLocators.insightsPublishedPage.selector.roleType,cmsAdminLocators.insightsPublishedPage.selector.roleName);
    }

    async clickContentTab() {
        try {
            await this.wait.forLoadState('load', constants.LONG_TIMEOUT);
            
            const frame = await this.wait.forFrameLocator(cmsAdminLocators.iframeHierarchy.cmsDesktop.selector);
            const contentFrame = frame.frameLocator(cmsAdminLocators.iframeHierarchy.contentView.selector).first();
            await contentFrame.locator(cmsAdminLocators.contentTab.selector).click();
        } catch (error) {
            console.error('Error in clickContentTab:', error);
            throw error;
        }
        
    }

    async getItemsPerPageValue() {
        try {
            await this.wait.forLoadState('load', constants.LONG_TIMEOUT);
            const itemsPerPageElement = await this.page.locator(cmsAdminLocators.iframeHierarchy.cmsDesktop.selector).contentFrame().locator(cmsAdminLocators.iframeHierarchy.contentView.selector).contentFrame().locator(cmsAdminLocators.iframeHierarchy.frameC.selector).contentFrame().getByRole(cmsAdminLocators.itemsPerPage.selector.roleType, { name: cmsAdminLocators.itemsPerPage.selector.roleName });
            const value = await itemsPerPageElement.inputValue();
            console.log('Items per page value:', value);
            return value;
            
        } catch (error) {
            console.error('Error in getItemsPerPageValue:', error);
            throw error;
        }
    }
    async editArticlePage(articleTitle) {
//   await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator('#m_c_g_v_ctl06_aedit').click();
//   await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="c"]').contentFrame().getByRole('link', { name: 'Pages' }).click();
//   await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator('#m_c_filterDocuments_nameFilter_txtText').click();
//   await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator('#m_c_filterDocuments_nameFilter_txtText').fill(articleTitle);
//   await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator('li.js-filter-item.highlighted:not([style]) > a').click();
//   await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator('iframe[name="c"]').contentFrame().getByRole('button', { name: 'Search' }).click();
//   await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator('iframe[name="c"]').contentFrame().getByRole('button', { name: 'Edit page' }).click();
//   await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="contentview"]').contentFrame().locator('iframe[name="c"]').contentFrame().getByRole('heading', { name: 'Email Subscription' }).click();
        await this.basePage.waitForElementFocused(cmsAdminLocators.searchTextBox);
        await this.basePage.fillElement(cmsLocators.searchTextBox, articleDataLayerData.seachTextPageTypes);
        await this.basePage.clickElement(cmsLocators.pageTypes_Application);
        await this.page.waitForTimeout(5000);
        await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator(cmsLocators.articlePageTypes_EditBtnRow6.selector).click();
        await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="c"]').contentFrame().getByRole('link', { name: 'Pages' }).click();
        await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator('#m_c_filterDocuments_nameFilter_txtText').click();
        await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator('#m_c_filterDocuments_nameFilter_txtText').fill(articleTitle);
        await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator('button[id="m_c_filterDocuments_btnShow"]').click();
        await this.page.waitForTimeout(3000);
        //await this.wait.forLoadState('domcontentloaded', constants.LONG_TIMEOUT);
        //await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator('#m_c_filterDocuments_nameFilter_txtText').press('Enter');
        await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator('iframe[name="c"]').contentFrame().getByRole('button', { name: 'Edit page' }).click();
      }
    
      async getPrimaryCategoryValue() {
        
        try {
            await this.wait.forLoadState('domcontentloaded', constants.LONG_TIMEOUT);
            
            // const frame = await this.wait.forFrameLocator(cmsAdminLocators.iframeHierarchy.cmsDesktop.selector);
            // const contentViewFrame = frame.frameLocator(cmsAdminLocators.iframeHierarchy.contentView.selector);
            // const frame_c = contentViewFrame.frameLocator(cmsAdminLocators.iframeHierarchy.frameC.selector);
            // await this.page.waitForTimeout(3000);
            // await this.page.mouse.wheel(0, 100);
            // await this.page.waitForTimeout(3000);
            // await frame_c.locator(cmsAdminLocators.iframeHierarchy.frameC.selector).contentFrame().locator('//h4[contains(text(),"Email Subscription")]//parent::div//img').click();
            // await this.wait.forLoadState('load', constants.LONG_TIMEOUT);
            // const itemsPerPageElement = await this.page.locator(cmsAdminLocators.iframeHierarchy.cmsDesktop.selector).contentFrame().locator(cmsAdminLocators.iframeHierarchy.contentView.selector).contentFrame().locator(cmsAdminLocators.iframeHierarchy.frameC.selector).contentFrame().getByRole(cmsAdminLocators.itemsPerPage.selector.roleType, { name: cmsAdminLocators.itemsPerPage.selector.roleName });
            //await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator('div[id="id-1579768781"]').click();
            const iframe = this.page.frameLocator('iframe[name="c"]');
            await iframe.locator('div[id="id-1579768781"]').click();
            await iframe.waitForTimeout(3000);
            // return frame_c.locator(cmsAdminLocators.iframeHierarchy.frameC.selector).contentFrame().getByRole(cmsAdminLocators.contentTab_PrimaryCategory.selector.roleType, { name: cmsAdminLocators.primaryCategoryDropdown.selector.roleName }).inputValue();
        } catch (error) {
            console.error('Error in clickContentTab:', error);
            throw error;
        }
     
      }
}

module.exports = CMSAdminPage;