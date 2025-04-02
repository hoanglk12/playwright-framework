const { defineConfig } = require('@playwright/test');
require('dotenv').config();

// Import the Allure Metadata Generator
const AllureMetadataGenerator = require('./utils/allure-metadata');

// Determine which environment to use
const env = process.env.TEST_ENV || 'dev'; // Default to 'dev' if not specified
//console.log(`Using environment: ${env}`);

// Load the appropriate config file
const envConfig = require(`./environments/${env}.config.js`);

// Generate Allure metadata
const metadataGenerator = new AllureMetadataGenerator({ env });
const metadata = metadataGenerator.generateTestRunMetadata();

module.exports = defineConfig({
  testIgnore: [
    '**/performance/**', 
    '**/specs/security.spec.js'
  ],
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000  // 10 seconds for assertions
  },
  retries: 1,
  workers: '50%',
  fullyParallel: true,  // Run tests in parallel
  // Test directory
  testDir: './tests',
  globalTimeout: 60 * 60 * 1000,  // 1 hour
  
  reporter: [
    ['list'], // Built-in reporter for console output
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: true,
      environmentInfo: {
     // Use only primitive types and simple string values
     'Environment': env,
     'Run ID': metadata.uuid,
     'Timestamp': new Date(metadata.start).toISOString(),
     
     // Operating System
     'OS Name': process.platform,
     'OS Version': require('os').release(),
     'OS Architecture': process.arch,
     
     // Runtime
     'Node Version': process.version,
     'NPM Version': (() => {
       try {
         return require('child_process')
           .execSync('npm --version')
           .toString()
           .trim();
       } catch {
         return 'Unknown';
       }
     })(),
     
     // Test Configuration
     'Test Framework': 'Playwright',
     'Execution Mode': process.env.CI ? 'CI' : 'Local',
     'Parallel Execution': 'Yes',
     'Worker Count': '50%',
     'Retry Count': '1',
     
     // Performance
     'CPU Cores': String(require('os').cpus().length),
     'Total Memory': `${Math.round(require('os').totalmem() / (1024 * 1024 * 1024))} GB`,
     'Free Memory': `${Math.round(require('os').freemem() / (1024 * 1024 * 1024))} GB`,
     
     // Additional Context
    //  'Branch': process.env.BRANCH || 'N/A',
    //  'Commit': process.env.COMMIT_SHA || 'N/A',
    //  'Build Number': process.env.BUILD_NUMBER || 'N/A',
      
      // Additional Configuration
      'video_quality': 'Full HD (1920x1080)',
      
     
    },
      disableWebdriverStepsReporting: false,
      disableWebdriverScreenshotsReporting: false,
    }], // Allure reporter
  ],
  use: {
    //headless: process.env.CI ? true : false,
    headless: true,
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
    baseURL: envConfig.baseUrl,
    browserConsoleLogToFile: true,
    //channel: 'chrome'
  },
  
  projects: [
    {
      name: 'chrome',
      use: { 
        browserName: 'chromium',
        channel: 'chrome',
        launchOptions: {
          args: [
            '--force-device-scale-factor=1', // Disable scaling
            '--high-dpi-support=1',
            '--disable-infobars',
            '--disable-notifications',
            '--disable-geolocation',
            '--disable-extensions',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-logging', // Equivalent to webdriver.chrome.args
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-site-isolation-trials',
            '--disable-blink-features=AutomationControlled' 
          ],
          ignoreDefaultArgs: ['--enable-automation'], // Equivalent to excludeSwitches
      },// Equivalent to ChromeOptions prefs
      userPreferences: {
        'credentials_enable_service': false,
        'profile.password_manager_enabled': false,
        'profile.default_content_setting_values.notifications': 2,
        'profile.default_content_setting_values.geolocation': 2,
        'useAutomationExtension': false,
      },
    }
    },
    {
      name: 'firefox',
      use: { 
        browserName: 'firefox',
        channel: 'firefox',
        launchOptions: {
          args: [
            '--disable-infobars',
            '--disable-notifications',
            '--disable-geolocation'
          ],
          firefoxUserPrefs: {
            // Equivalent to disable-infobars and notifications
            'dom.webnotifications.enabled': false,
            'dom.push.enabled': false,
            
            // Equivalent to disable-geolocation
            'geo.enabled': false,
            'geo.provider.use_corelocation': false,
            'geo.prompt.testing': true,
            'geo.prompt.testing.allow': false,
            
            // Equivalent to DRIVER_USE_MARIONETTE
            'marionette.enabled': true,
            
            // Additional recommended settings
            'permissions.default.desktop-notification': 2,
            'permissions.default.geo': 2
          },
        }
      },
    },
    {
      name: 'edge',
      use: { browserName: 'chromium', channel: 'msedge' },
    },
  ],
  
  globalSetup: './global-setup.js',
  
  // Specify which tests to run based on tags
  grep: process.env.TAGS ? new RegExp(process.env.TAGS) : /.*/
  
});


// const { defineConfig } = require('@playwright/test');
// const path = require('path');
// require('dotenv').config();

// // Determine which environment to use
// const env = process.env.TEST_ENV || 'dev';
// console.log(`Using environment: ${env}`);

// // Load the appropriate config file
// const envConfig = require(`./environments/${env}.config.js`);

// module.exports = defineConfig({
// fullyParallel: true, // Enable parallel test execution
// // Test Directory Configuration
// testDir: './tests/api',
// testMatch: ['**/*.spec.js'],

// // Ignore Non-API Tests
// testIgnore: [
//   '**/ui/**',
//   '**/performance/**', 
//   '**/security/**'
// ],

// // Execution Configuration
// timeout: 60 * 1000,
// retries: process.env.CI ? 2 : 1,
// workers: process.env.CI ? 2 : 1,

// // Reporting Configuration
// reporter: [
//       ['list'], // Built-in reporter for console output
//       ['allure-playwright', {
//         detail: true,
//         outputFolder: 'allure-results',
//         suiteTitle: false,
//         environmentInfo: {
//           environment: env,
//           video_quality: 'Full HD (1920x1080)'
//         }
//       }], // Allure reporter
//     ],

// // Global Test Settings
// use: {
//   baseURL: envConfig.baseApiUrl,
//   extraHTTPHeaders: {
//     'Accept': 'application/json',
//     'Content-Type': 'application/json'
//   },
  
//   headless: true,
//   screenshot: 'only-on-failure',
//   trace: 'retain-on-failure',
//   video: 'retain-on-failure',
//   actionTimeout: 15000,
//   ignoreHTTPSErrors: true
// },

// // Projects Configuration
// projects: [
//   {
//     name: 'api-tests',
//     use: {
//       baseURL: envConfig.baseApiUrl,
//       extraHTTPHeaders: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json'
//       }
//     }
//   }
// ],
// globalSetup: './global-setup.js',

// });