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
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: false
    }], // Allure reporter
  ],
  use: {
    headless: false,
    slowMo: 0,
    viewport: { width: 1536, height: 695 },
    actionTimeout: 15000,
    ignoreHTTPSErrors: true,
    video: 'on',
    screenshot: 'on',
    timeout: 60000,
    //channel: 'chrome'
  },
  projects: [
    {
      name: 'chromium-dev',
      use: { 
        browserName: 'chromium',
        channel: 'chrome'
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
