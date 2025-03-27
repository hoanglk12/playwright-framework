const { test, expect } = require('@playwright/test');
const ErrorPage = require('../../pages/errorPage');
const BasePage = require('../../pages/basePage');
const env = process.env.TEST_ENV || 'dev';
const envConfig = require(`../../environments/${env}.config.js`);
const Logger = require('../../utils/logger');

// Builder Pattern for test configuration
class TestConfigBuilder {
  constructor() {
    this.config = {
      baseUrl: envConfig.liveSiteUrl,
      invalidPath: 'sorve' // Updated to use 'sorve' instead of 'x'
    };
  }

  withBaseUrl(url) {
    this.config.baseUrl = url;
    return this;
  }

  withInvalidPath(path) {
    this.config.invalidPath = path;
    return this;
  }

  build() {
    return this.config;
  }
}

// Create test configuration using Builder Pattern
const testConfig = new TestConfigBuilder().build();

let basePage, errorPage, logger;

// Enhanced Test Setup with Robust Initialization
test.beforeEach(async ({ page }, testInfo) => {
  // Defensive initialization with error handling
  try {
      // Ensure logger is always initialized
      logger = Logger || console;

      // Initialize pages with error checking
      basePage = new BasePage(page, envConfig);
      errorPage = new ErrorPage(page,  envConfig);
     
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

test.describe('Error Page Tests', () => {
  test('Verify globe icon is visible and clickable on 404 error page', async ({ page }) => {
    // Arrange - Initialize page object
    //const errorPage = new ErrorPage(page);
    
    // Act - Navigate to an error page using Fluent Interface
    await errorPage.navigateToErrorPage(testConfig.baseUrl, testConfig.invalidPath);
    
    // Assert - Verify we're on an error page
    const isErrorPage = await errorPage.isErrorPageDisplayed();
    expect(isErrorPage, 'Should be on an error page').toBeTruthy();
    
    // Assert - Verify the globe icon is visible
    const isGlobeIconVisible = await errorPage.isGlobeIconVisible();
    expect(isGlobeIconVisible, 'Globe icon should be visible on error page').toBeTruthy();
    
    // Assert - Verify the globe icon is clickable
    const isGlobeIconClickable = await errorPage.isGlobeIconClickable();
    expect(isGlobeIconClickable, 'Globe icon should be clickable on error page').toBeTruthy();

    // Take a screenshot for visual verification
    await page.screenshot({ path: `./test-results/error-page-${env}-screenshot.png` });
    
    // Optional - Verify clicking the icon doesn't cause errors
    await errorPage.clickGlobeIcon();
    console.log('Successfully clicked globe icon on error page');
  });
});