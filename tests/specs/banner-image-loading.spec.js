const { test, expect } = require('@playwright/test');
const InsightsPage = require('../../pages/insightsPage');
const PeoplePage = require('../../pages/peoplePage');
const BasePage = require('../../pages/basePage');

// Strategy Pattern - Environment configuration
const env = process.env.TEST_ENV || 'dev';
//const envConfig = require(`../../environments/${env}.config.js`);

// Builder Pattern for test configuration
class TestConfigBuilder {
    constructor() {
        this.config = {
            urls: {
                insights: 'https://ff-fieldfishercom-qa-web-ekfefjdmh6dbg3f7.uksouth-01.azurewebsites.net/en/insights',
                people: 'https://ff-fieldfishercom-qa-web-ekfefjdmh6dbg3f7.uksouth-01.azurewebsites.net/en/people'
            },
            expectations: {
                lazyLoading: false
            }
        };
    }

    withInsightsUrl(url) {
        this.config.urls.insights = url;
        return this;
    }

    withPeopleUrl(url) {
        this.config.urls.people = url;
        return this;
    }

    build() {
        return this.config;
    }
}

// Create test configuration using Builder Pattern
const testConfig = new TestConfigBuilder().build();

let basePage;

test.beforeEach(async ({ page }) => {
    basePage = new BasePage(page);
});

test.afterEach(async ({}, testInfo) => {
    if (basePage) {
        await basePage.closeBrowserOnFailure(testInfo);
    }
});

// Repository Pattern is used through the locators files
// Page Object Model is used through the page classes
test.describe('Banner Images Lazy Loading Tests', () => {
    test('Verify insights article banner image is not lazily loaded', async ({ page }) => {
        // Arrange - Initialize page objects
        const insightsPage = new InsightsPage(page);
        
        // Act - Navigate to insights page and click random article using Fluent Interface
        await insightsPage.navigateToInsightsPage();
        const articleTitle = await insightsPage.clickRandomArticleCard();
        
        // Get lazy loading attribute
        const imageLoadingInfo = await insightsPage.checkInnerBannerImageLazyLoading();
        
        // Log details for debugging
        console.log(`Clicked article: "${articleTitle}"`);
        console.log(`Banner image loading attribute: ${imageLoadingInfo.loadingAttribute || 'not set'}`);
        
        // Assert - Check that lazy loading is not used
        expect(imageLoadingInfo.hasLazyLoading).toBe(testConfig.expectations.lazyLoading);
    });
    
    test('Verify people profile banner image is not lazily loaded', async ({ page }) => {
        // Arrange - Initialize page objects
        const peoplePage = new PeoplePage(page);
        
        // Act - Navigate to people page and click random profile using Fluent Interface
        await peoplePage.navigateToPeoplePage();
        const profileName = await peoplePage.clickRandomProfileCard();
        
        // Get lazy loading attribute
        const imageLoadingInfo = await peoplePage.checkProfileBannerImageLazyLoading();
        
        // Log details for debugging
        console.log(`Clicked profile: "${profileName}"`);
        console.log(`Banner image loading attribute: ${imageLoadingInfo.loadingAttribute || 'not set'}`);
        
        // Assert - Check that lazy loading is not used
        expect(imageLoadingInfo.hasLazyLoading).toBe(testConfig.expectations.lazyLoading);
    });
});