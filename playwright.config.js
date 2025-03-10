const { defineConfig } = require('@playwright/test');
const devConfig = require('./environments/dev.config');
const prodConfig = require('./environments/prod.config');
const { clearAllureResults } = require('./utils/helpers');


module.exports = defineConfig({
  timeout: 30 * 1000,
  retries: 1,
  workers: 1,
  reporter: [
    ['list'], // Built-in reporter for console output
    ['allure-playwright'], // Allure reporter
  ],
  use: {
    headless: false,
    slowMo: 0,
    viewport: null,
    actionTimeout: 15000,
    ignoreHTTPSErrors: true,
    video: 'on',
    screenshot: 'on',
    timeout: 60000,
  },
  projects: [
    {
      name: 'chromium-dev',
      use: { 
        browserName: 'chromium',
        baseUrl: devConfig.baseUrl,
      },
      
    },
    /*{
      name: 'edge', // Microsoft Edge browser
      use: { 
        browserName: 'chromium', // Edge is based on Chromium
        channel: 'msedge', // Use the Edge channel
      },
    },*/
    /*{
      name: 'firefox',
      use: { browserName: 'firefox' },
    },*/
    /* {
       name: 'webkit',
       use: { browserName: 'webkit' },
     },
    */
  ],
  globalSetup: require.resolve('./global-setup.js'),
});
