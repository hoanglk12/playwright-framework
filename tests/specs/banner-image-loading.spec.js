const { test, expect } = require('@playwright/test');
const InsightsPage = require('../../pages/insightsPage');
const PeoplePage = require('../../pages/peoplePage');
const BasePage = require('../../pages/basePage');
const Logger = require('../../utils/logger');

// Strategy Pattern - Environment configuration
const env = process.env.TEST_ENV || 'dev';
const envConfig = require(`../../environments/${env}.config.js`);

// Builder Pattern for test configuration
class TestConfigBuilder {
    constructor() {
        this.config = {
            urls: {
                insights: envConfig.insightsPageUrl,
                people: envConfig.peopleListingPageUrl
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

// let basePage;

// test.beforeEach(async ({ page }) => {
//     basePage = new BasePage(page);
// });

// test.afterEach(async ({}, testInfo) => {
//     if (basePage) {
//         await basePage.closeBrowserOnFailure(testInfo);
//     }
// });

let basePage, insightsPage, peoplePage, logger;

// Enhanced Test Setup with Robust Initialization
test.beforeEach(async ({ page }, testInfo) => {
  // Defensive initialization with error handling
  try {
      // Ensure logger is always initialized
      logger = Logger || console;

      // Initialize pages with error checking
      basePage = new BasePage(page, envConfig);
      insightsPage = new InsightsPage(page,  envConfig);
      peoplePage = new PeoplePage(page,  envConfig);
     
      // Comprehensive test setup logging
      logger.info('Test Setup', {
          environment: envConfig.baseUrl,
          testFile: testInfo.file,
          testName: testInfo.title
      });
  } catch (setupError) {
      // Fallback error handling
      const errorLog = logger.error || console.error;
      errorLog('Test Setup Failed', {
          error: setupError.message,
          stack: setupError.stack
      });
      throw setupError;
  }
});

// Robust Test Teardown
test.afterEach(async ({}, testInfo) => {
const logSafely = (level, message, metadata = {}) => {
  try {
      // Prioritize logger methods, fallback to console
      if (logger && typeof logger[level] === 'function') {
          logger[level](message, metadata);
      } else {
          console[level](JSON.stringify({ message, ...metadata }, null, 2));
      }
  } catch {
      console.error('Logging failed', { message, metadata });
  }
};

try {
  // Safe browser closure
  if (basePage && typeof basePage.closeBrowserOnFailure === 'function') {
      await basePage.closeBrowserOnFailure(testInfo);
  }

  // Log test completion
  logSafely('info', 'Test Completed', {
      testName: testInfo.title,
      status: testInfo.status,
      duration: testInfo.duration
  });
} catch (teardownError) {
  // Comprehensive error logging
  logSafely('error', 'Test Teardown Failed', {
      error: teardownError.message,
      stack: teardownError.stack
  });
}
});

// Repository Pattern is used through the locators files
// Page Object Model is used through the page classes
test.describe('Banner Images Lazy Loading Tests', () => {
    test('Verify insights article banner image is not lazily loaded', async ({ page }) => {
        // Arrange - Initialize page objects
        //const insightsPage = new InsightsPage(page);
        
        // Act - Navigate to insights page and click random article using Fluent Interface
        await insightsPage.navigateToInsightsPage();
        const articleTitle = await insightsPage.clickRandomArticleCard();
        
        // Get lazy loading attribute
        const imageLoadingInfo = await insightsPage.checkInnerBannerImageLazyLoading();
        
        // Log details for debugging
        logger.info(`Clicked article: "${articleTitle}"`);
        logger.info(`Banner image loading attribute: ${imageLoadingInfo.loadingAttribute || 'not set'}`);
        
        // Assert - Check that lazy loading is not used
        expect(imageLoadingInfo.hasLazyLoading).toBe(testConfig.expectations.lazyLoading);
    });
    
    test('Verify people profile banner image is not lazily loaded', async ({ page }) => {
        // Arrange - Initialize page objects
        //const peoplePage = new PeoplePage(page);
        
        // Act - Navigate to people page and click random profile using Fluent Interface
        await peoplePage.navigateToPeoplePage();
        const profileName = await peoplePage.clickRandomProfileCard();
        
        // Get lazy loading attribute
        const imageLoadingInfo = await peoplePage.checkProfileBannerImageLazyLoading();
        
        // Log details for debugging
        logger.info(`Clicked profile: "${profileName}"`);
        logger.info(`Banner image loading attribute: ${imageLoadingInfo.loadingAttribute || 'not set'}`);
        
        // Assert - Check that lazy loading is not used
        expect(imageLoadingInfo.hasLazyLoading).toBe(testConfig.expectations.lazyLoading);
    });
});