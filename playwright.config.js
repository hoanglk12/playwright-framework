const { defineConfig } = require('@playwright/test');
require('dotenv').config();
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'playwright-logs.log' })
  ]
});

// Determine which environment to use
const env = process.env.TEST_ENV || 'dev'; // Default to 'dev' if not specified
console.log(`Using environment: ${env}`);

// Load the appropriate config file
const envConfig = require(`./environments/${env}.config.js`);

module.exports = defineConfig({
  timeout: 60 * 1000,
  retries: 1,
  workers: 1,
  reporter: [
    ['list'], // Built-in reporter for console output
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: false,
      environmentInfo: {
        environment: env,
        video_quality: 'Full HD (1920x1080)'
      }
    }], // Allure reporter
  ],
  use: {
    headless: process.env.CI ? true : false,
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
            '--high-dpi-support=1'
          ]
      },
    }
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' },
    },
  ],
  
  globalSetup: './global-setup.js',
  
});
