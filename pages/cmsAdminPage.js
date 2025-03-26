const winston = require('winston');
const cmsAdminData = require('../utils/cmsAdminData.json');
const loginLocators = require('../locators/loginLocators');
const constants = require('../config/constants');
const cmsAdminLocators = require('../locators/cmsAdminLocators');
const articleDataLayerData = require('../utils/articleDataLayer-data.json');
const BasePage = require('./basePage');
const Wait = require('../utils/Wait');
require('dotenv').config();

// Configure Winston Logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.simple()
        }),
        new winston.transports.File({ 
            filename: 'logs/cms-admin.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

const env = process.env.TEST_ENV || 'dev';
const envConfig = require(`../environments/${env}.config.js`);

class CMSAdminPage extends BasePage {
    constructor(page) {
        super(page);
        this.basePage = new BasePage(page);
        this.wait = new Wait(page);
        logger.info('CMSAdminPage initialized', { env });
    }

    // Utility method to safely execute actions with logging
    async safeExecute(methodName, action) {
        try {
            logger.info(`Executing method: ${methodName}`);
            return await action();
        } catch (error) {
            logger.error(`Error in ${methodName}`, { 
                error: error.message,
                stack: error.stack 
            });
            throw error;
        }
    }

    // Mask sensitive information
    maskSensitiveInfo(info) {
        if (!info) return info;
        return info.substring(0, 2) + '*'.repeat(info.length - 4) + info.slice(-2);
    }

    async navigateToCMSAdmin() {
        return this.safeExecute('navigateToCMSAdmin', async () => {
            logger.info('Navigating to CMS Admin', { 
                url: envConfig.baseUrl,
                username: this.maskSensitiveInfo(envConfig.users.validUser.username)
            });

            await this.basePage.navigate(envConfig.baseUrl);
            await this.basePage.fillElement(loginLocators.usernameField, envConfig.users.validUser.username);
            await this.basePage.fillElement(loginLocators.passwordField, envConfig.users.validUser.password);
            await this.basePage.clickElement(loginLocators.loginButton);
            
            await this.wait.forLoadState('networkidle', constants.LONG_TIMEOUT);
            
            logger.info('Successfully logged into CMS Admin');
        });
    }

    async clickApplicationListIcon() {
        return this.safeExecute('clickApplicationListIcon', async () => {
            logger.info('Clicking Application List Icon');
            await this.wait.forLoadState('networkidle', constants.LONG_TIMEOUT); 
            await this.basePage.clickElement(cmsAdminLocators.applicationListIcon);
            await this.wait.forLoadState('networkidle', constants.SHORT_TIMEOUT);
            logger.info('Application List Icon clicked successfully');
        });
    }

    async enterToSearchBox() {
        return this.safeExecute('enterToSearchBox', async () => {
            logger.info('Entering search box', { 
                searchText: cmsAdminData.searchTextPages 
            });
            await this.basePage.waitForElementFocused(cmsAdminLocators.searchTextBox);
            await this.basePage.fillElement(cmsAdminLocators.searchTextBox, cmsAdminData.searchTextPages);
            await this.basePage.pressKey('Enter');
            await this.wait.forLoadState('networkidle', constants.LONG_TIMEOUT); 
            await this.basePage.clickElement(cmsAdminLocators.pageTab);
            await this.wait.forLoadState('networkidle', constants.DEFAULT_TIMEOUT);
            logger.info('Search box entered and page tab clicked');
        });
    }
    async clickInsightsCMSPage() {
        return this.safeExecute('clickInsightsCMSPage', async () => {
        logger.info('Click Insights Page in CMS');
        await this.basePage.clickElementInFrameLocator(cmsAdminLocators.iframeHierarchy.cmsDesktop.selector, cmsAdminLocators.insightsPublishedPage.selector.roleType,cmsAdminLocators.insightsPublishedPage.selector.roleName);
        logger.info('Insights Page in CMS successfully clicked');
    });
    }
    async clickContentTab() {return this.safeExecute('clickContentTab', async () => {
        logger.info('Click Content Tab');
        try {
            await this.wait.forLoadState('load', constants.LONG_TIMEOUT);
            
            const frame = await this.wait.forFrameLocator(cmsAdminLocators.iframeHierarchy.cmsDesktop.selector);
            const contentFrame = frame.frameLocator(cmsAdminLocators.iframeHierarchy.contentView.selector).first();
            await contentFrame.locator(cmsAdminLocators.contentTab.selector).click();
            logger.info('Content Tab successfully clicked');
        } catch (error) {
            //console.error('Error in clickContentTab:', error);
            logger.info('Content Tab successfully clicked', error);
            throw error;
        }
        
    });
    }
    async getItemsPerPageValue() {
        return this.safeExecute('getItemsPerPageValue', async () => {
            logger.info('Retrieving items per page value');
            const itemsPerPageElement = await this.page.locator(cmsAdminLocators.iframeHierarchy.cmsDesktop.selector)
                .contentFrame()
                .locator(cmsAdminLocators.iframeHierarchy.contentView.selector)
                .contentFrame()
                .locator(cmsAdminLocators.iframeHierarchy.frameC.selector)
                .contentFrame()
                .getByRole(
                    cmsAdminLocators.itemsPerPage.selector.roleType, 
                    { name: cmsAdminLocators.itemsPerPage.selector.roleName }
                );
            
            const value = await itemsPerPageElement.inputValue();
            
            logger.info('Items per page value retrieved', { value });
            return value;
        });
    }

    async editArticlePage(articleTitle) {
        return this.safeExecute('editArticlePage', async () => {
            logger.info('Editing article page', { articleTitle });
            
            await this.basePage.fillElement(cmsAdminLocators.searchTextBox, articleDataLayerData.seachTextPageTypes);
            await this.basePage.clickElement(cmsAdminLocators.pageTypes_Application);
            
            // Complex iframe navigation with logging
            logger.debug('Navigating through iframes to edit page');
            await this.page.waitForTimeout(5000);
            await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator(cmsAdminLocators.articlePageTypes_EditBtnRow6.selector).click();
            await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="c"]').contentFrame().getByRole('link', { name: 'Pages' }).click();
            await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator('#m_c_filterDocuments_nameFilter_txtText').click();
            await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator('#m_c_filterDocuments_nameFilter_txtText').fill(articleTitle);
            await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator('button[id="m_c_filterDocuments_btnShow"]').click();
            await this.page.waitForTimeout(3000);
            await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="c"]').contentFrame().locator('iframe[name="c"]').contentFrame().getByRole('button', { name: 'Edit page' }).click();
            logger.info('Article page edited successfully');
        });
    }
    
      async expandEmailSubscription() {
        return this.safeExecute('editArticlePage', async () => {
        logger.info('Expanding Email Subscription');
        await this.wait.forLoadState('domcontentloaded', constants.LONG_TIMEOUT);
        await this.page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="contentview"]').contentFrame().locator('iframe[name="c"]').contentFrame().getByRole(cmsAdminLocators.contentTab_EmailSubscription.selector.roleType, { name: cmsAdminLocators.contentTab_EmailSubscription.selector.roleName }).click();
        logger.info('Expanding Email Subscription successfully');
        });
    }
    async clickHomePageLink() {
        return this.safeExecute('clickHomePageLink', async () => {
            logger.info('Clicking Home Page Link');
            
            const frame = await this.page.locator(cmsAdminLocators.iframeHierarchy.cmsDesktop.selector).contentFrame();
            const homePageLink = frame.getByRole('link', { name: 'Fieldfisher | A law firm' });
            
            // Log additional context
            logger.debug('Locating home page link', { 
                selector: 'Fieldfisher | A law firm',
                frameSelector: cmsAdminLocators.iframeHierarchy.cmsDesktop.selector
            });
    
            await homePageLink.click();
            await this.wait.forLoadState('networkidle', constants.DEFAULT_TIMEOUT);
            
            logger.info('Home Page Link clicked successfully');
        });
    }
    
    async openHeroBannerProperties() {
        return this.safeExecute('openHeroBannerProperties', async () => {
            logger.info('Opening Hero Banner Properties');
    
            // Detailed iframe navigation logging
            logger.debug('Navigating through iframes', {
                mainFrameSelector: cmsAdminLocators.iframeHierarchy.cmsDesktop.selector,
                contentFrameSelector: cmsAdminLocators.iframeHierarchy.contentView.selector,
                innerFrameSelector: cmsAdminLocators.iframeHierarchy.frameC.selector
            });
    
            const mainFrame = await this.page.locator(cmsAdminLocators.iframeHierarchy.cmsDesktop.selector).contentFrame();
            const contentFrame = mainFrame.locator(cmsAdminLocators.iframeHierarchy.contentView.selector).contentFrame();
            const innerFrame = contentFrame.locator(cmsAdminLocators.iframeHierarchy.frameC.selector).contentFrame();
            const pageFrame = innerFrame.locator('iframe[name="pageview"]').contentFrame();
    
            // Click banner image
            const bannerImage = pageFrame.locator(cmsAdminLocators.heroBanner.bannerImage.selector);
            await bannerImage.click();
            logger.debug('Clicked banner image', { 
                selector: cmsAdminLocators.heroBanner.bannerImage.selector 
            });
    
            // Open banner properties
            const bannerPropertiesLink = pageFrame.locator('kentico-widget-header')
                .filter({ hasText: 'Banner, Hero' })
                .locator('a')
                .nth(1);
            await bannerPropertiesLink.click();
            
            logger.info('Hero Banner Properties opened successfully');
        });
    }
    
    async setHeroBannerText(text) {
        return this.safeExecute('setHeroBannerText', async () => {
            logger.info('Setting Hero Banner Text', { text });
    
            // Validate input
            if (!text) {
                logger.warn('Attempted to set empty hero banner text');
                throw new Error('Hero banner text cannot be empty');
            }
    
            const mainFrame = await this.page.locator(cmsAdminLocators.iframeHierarchy.cmsDesktop.selector).contentFrame();
            const contentFrame = mainFrame.locator(cmsAdminLocators.iframeHierarchy.contentView.selector).contentFrame();
            const innerFrame = contentFrame.locator(cmsAdminLocators.iframeHierarchy.frameC.selector).contentFrame();
            const pageFrame = innerFrame.locator('iframe[name="pageview"]').contentFrame();
            
            const textField = pageFrame.locator(cmsAdminLocators.heroBanner.textField.selector);
            
            logger.debug('Filling hero banner text', {
                selector: cmsAdminLocators.heroBanner.textField.selector,
                textLength: text.length
            });
    
            await textField.fill(text);
            
            logger.info('Hero Banner Text set successfully');
        });
    }
    
    async clickApplyButton() {
        return this.safeExecute('clickApplyButton', async () => {
            logger.info('Clicking Apply Button');
    
            const mainFrame = await this.page.locator(cmsAdminLocators.iframeHierarchy.cmsDesktop.selector).contentFrame();
            const contentFrame = mainFrame.locator(cmsAdminLocators.iframeHierarchy.contentView.selector).contentFrame();
            const innerFrame = contentFrame.locator(cmsAdminLocators.iframeHierarchy.frameC.selector).contentFrame();
            const pageFrame = innerFrame.locator('iframe[name="pageview"]').contentFrame();
            
            const applyButton = pageFrame.getByRole(
                cmsAdminLocators.heroBanner.applyButton.selector.roleType,
                { name: cmsAdminLocators.heroBanner.applyButton.selector.roleName }
            );
    
            logger.debug('Locating apply button', {
                roleType: cmsAdminLocators.heroBanner.applyButton.selector.roleType,
                roleName: cmsAdminLocators.heroBanner.applyButton.selector.roleName
            });
    
            await applyButton.click();
            
            logger.info('Apply Button clicked successfully');
        });
    }
    
    async getHeroBannerError() {
        return this.safeExecute('getHeroBannerError', async () => {
            logger.info('Retrieving Hero Banner Error');
    
            const mainFrame = await this.page.locator(cmsAdminLocators.iframeHierarchy.cmsDesktop.selector).contentFrame();
            const contentFrame = mainFrame.locator(cmsAdminLocators.iframeHierarchy.contentView.selector).contentFrame();
            const innerFrame = contentFrame.locator(cmsAdminLocators.iframeHierarchy.frameC.selector).contentFrame();
            const pageFrame = innerFrame.locator('iframe[name="pageview"]').contentFrame();
            
            const errorMessageLocator = pageFrame.locator(cmsAdminLocators.heroBanner.errorMessage.selector);
            
            logger.debug('Locating error message', {
                selector: cmsAdminLocators.heroBanner.errorMessage.selector
            });
    
            const errorText = await errorMessageLocator.textContent();
            
            logger.info('Hero Banner Error retrieved', { 
                errorText: errorText || 'No error message found' 
            });
    
            return errorText;
        });
    }
}

module.exports = CMSAdminPage;