// const { defineConfig } = require('@playwright/test');
// require('dotenv').config();

// // Determine which environment to use
// const env = process.env.TEST_ENV || 'dev'; // Default to 'dev' if not specified
// console.log(`Using environment: ${env}`);

// // Load the appropriate config file
// const envConfig = require(`./environments/${env}.config.js`);

// module.exports = defineConfig({
//   testIgnore: [
//     '**/performance/**', 
//     '**/specs/security.spec.js'
//   ],
//   timeout: 60 * 1000,
//   retries: 1,
//   workers: 1,
//   reporter: [
//     ['list'], // Built-in reporter for console output
//     ['allure-playwright', {
//       detail: true,
//       outputFolder: 'allure-results',
//       suiteTitle: false,
//       environmentInfo: {
//         environment: env,
//         video_quality: 'Full HD (1920x1080)'
//       }
//     }], // Allure reporter
//   ],
//   use: {
//     headless: process.env.CI ? true : false,
//     launchOptions: {
//       args: ['--disable-gpu=false'] // Enable GPU
//     },
//     slowMo: 0,
//     viewport: { width: 1920, height: 1080 },
//     actionTimeout: 15000,
//     ignoreHTTPSErrors: true,
//     video: {
//       mode: 'on',
//       size: { width: 1920, height: 1080 },
//     },
//     screenshot: 'on',
//     baseURL: envConfig.baseUrl,
//     //channel: 'chrome'
//   },
//   projects: [
//     {
//       name: 'chrome',
//       use: { 
//         browserName: 'chromium',
//         channel: 'chrome',
//         launchOptions: {
//           args: [
//             '--force-device-scale-factor=1', // Disable scaling
//             '--high-dpi-support=1'
//           ]
//       },
//     }
//     },
//     {
//       name: 'firefox',
//       use: { browserName: 'firefox' },
//     },
//     {
//       name: 'webkit',
//       use: { browserName: 'webkit' },
//     },
//   ],
  
//   globalSetup: './global-setup.js',
  
// });


const { defineConfig } = require('@playwright/test');
const path = require('path');
require('dotenv').config();

// Determine which environment to use
const env = process.env.TEST_ENV || 'dev';
console.log(`Using environment: ${env}`);

// Load the appropriate config file
const envConfig = require(`./environments/${env}.config.js`);

module.exports = defineConfig({
  fullyParallel: true, // Enable parallel test execution
// Test Directory Configuration
testDir: './tests/api',
testMatch: ['**/*.spec.js'],

// Ignore Non-API Tests
testIgnore: [
  '**/ui/**',
  '**/performance/**', 
  '**/security/**'
],

// Execution Configuration
timeout: 60 * 1000,
retries: process.env.CI ? 2 : 1,
workers: process.env.CI ? 2 : 1,

// Reporting Configuration
reporter: [
  ['list'], // Console output
  ['html', { open: 'never' }]
],

// Global Test Settings
use: {
  baseURL: envConfig.baseApiUrl,
  extraHTTPHeaders: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  
  headless: true,
  screenshot: 'only-on-failure',
  trace: 'retain-on-failure',
  video: 'retain-on-failure',
  actionTimeout: 15000,
  ignoreHTTPSErrors: true
},

// Projects Configuration
projects: [
  {
    name: 'api-tests',
    use: {
      baseURL: envConfig.baseApiUrl,
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
  }
],
globalSetup: './global-setup.js',

});