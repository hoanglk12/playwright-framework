const { test: base } = require('@playwright/test');
const LoginPage = require('../pages/loginPage');
const Logger = require('../utils/logger');

exports.test = base.extend({
  // Login Page Fixture with Enhanced Logging
  loginPage: async ({ page, log }, use) => {
    try {
      log.info('Setting up login page fixture');
      const loginPage = new LoginPage(page);
      
      // Add logging to navigation
      log.info('Navigating to login page');
      await loginPage.navigateToLoginPage();
      
      log.info('Login page fixture prepared successfully');
      await use(loginPage);
    } catch (error) {
      log.error('Failed to set up login page fixture', error);
      throw error;
    }
  },

  // Global Logging Fixture
  log: async ({}, use) => {
    await use(Logger);
  },

  // Performance and Test Metadata Tracking
  testMetadata: async ({}, use, testInfo) => {
    const startTime = Date.now();
    
    // Prepare metadata object
    const metadata = {
      startTime,
      testName: testInfo.title,
      logTestDetails: () => {
        const duration = Date.now() - startTime;
        Logger.logTestEnd(
          testInfo.title, 
          testInfo.status, 
          duration,
          {
            // Additional metadata
            file: testInfo.file,
            line: testInfo.line,
            column: testInfo.column
          }
        );
      }
    };

    await use(metadata);
  },

  // Environment Configuration Fixture
  env: async ({}, use) => {
    const env = process.env.TEST_ENV || 'dev';
    
    try {
      const envConfig = require(`../environments/${env}.config.js`);
      Logger.info(`Loading ${env} environment configuration`);
      await use(envConfig);
    } catch (error) {
      Logger.error(`Failed to load ${env} environment configuration`, error);
      throw error;
    }
  },

  // Screenshot Capture Fixture
  screenshot: async ({ page }, use) => {
    await use(async (name) => {
      try {
        const screenshotPath = `./test-results/screenshots/${name}_${Date.now()}.png`;
        await page.screenshot({ path: screenshotPath });
        Logger.info(`Screenshot captured: ${screenshotPath}`);
        return screenshotPath;
      } catch (error) {
        Logger.error('Failed to capture screenshot', error);
        throw error;
      }
    });
  },

  // Browser Context Fixture with Logging
  context: async ({ context }, use) => {
    context.on('webrequest', (request) => {
      Logger.debug('Web Request', {
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType()
      });
    });

    context.on('response', (response) => {
      Logger.debug('Web Response', {
        url: response.url(),
        status: response.status(),
        request: response.request()
      });
    });

    await use(context);
  }
 
});

exports.expect = base.expect;
