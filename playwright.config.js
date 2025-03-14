const { defineConfig } = require('@playwright/test');
// const devConfig = require('./environments/dev.config');
// const prodConfig = require('./environments/prod.config');
// const { clearAllureResults } = require('./utils/helpers');


module.exports = defineConfig({
  timeout: 30 * 1000,
  retries: 1,
  workers: 1,
  reporter: [
    ['list'], // Built-in reporter for console output
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: false,
      environmentInfo: {
        video_quality: 'Full HD (1920x1080)'
      }
    }], // Allure reporter
  ],
  use: {
    headless: false,
    launchOptions: {
      args: ['--disable-gpu=false'] // Enable GPU
    },
    slowMo: 0,
    viewport: { width: 1920, height: 1080 },
    actionTimeout: 15000,
    ignoreHTTPSErrors: true,
    video: {
      mode: 'on',
      size: { width: 1920, height: 1080 },
    },
    screenshot: 'on',
    timeout: 60000,
    //channel: 'chrome'
  },
  projects: [
    {
      name: 'chromium-dev',
      use: { 
        browserName: 'chromium',
        channel: 'chrome',
        launchOptions: {
          args: [
            '--force-device-scale-factor=1', // Disable scaling
            '--high-dpi-support=1'
          ]
      },
    }
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
