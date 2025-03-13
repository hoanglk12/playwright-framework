const { test, expect } = require('@playwright/test');
const BasePage = require('../../pages/basePage');
const CMSAdminPage = require('../../pages/cmsAdminPage');
const LoginPage = require('../../pages/loginPage');
const devConfig = require('../../environments/dev.config');
const constants = require('../../config/constants');

let basePage, cmsAdminPage, loginPage;

test.beforeEach(async ({ page }) => {
    basePage = new BasePage(page);
    cmsAdminPage = new CMSAdminPage(page);
    loginPage = new LoginPage(page);
});

test.afterEach(async ({}, testInfo) => {
    await basePage.closeBrowserOnFailure(testInfo);
});

test('Validate hero banner text cannot exceed 160 characters', async () => {
    // Navigate to CMS and login
    await cmsAdminPage.navigateToCMSAdmin();

    //Click Application List Icon
    await cmsAdminPage.clickApplicationListIcon();

    //Input Pages Application
    await cmsAdminPage.enterToSearchBox();

    // Navigate to home page
    await cmsAdminPage.clickHomePageLink();

    // Open hero banner properties
    await cmsAdminPage.openHeroBannerProperties();

    // Set text that exceeds 160 characters
    const longText = 'The swift brown fox jumps quickly over the lazy dog while the curious cat watches intently, wondering what makes the dog so unbothered by the playful fox\'s antics.';
    await cmsAdminPage.setHeroBannerText(longText);

    // Click apply
    await cmsAdminPage.clickApplyButton();
    await cmsAdminPage.waitForLoadState('networkidle', constants.LONG_TIMEOUT);

    // Verify error message
    const errorMessage = await cmsAdminPage.getHeroBannerError();
    expect(errorMessage).toContain("The field Text must be a string or array type with a maximum length of '160'");
});