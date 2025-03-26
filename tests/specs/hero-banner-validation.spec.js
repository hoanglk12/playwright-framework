const { test, expect } = require('@playwright/test');
const Logger = require('../../utils/logger');
const BasePage = require('../../pages/basePage');
const CMSAdminPage = require('../../pages/cmsAdminPage');
const LoginPage = require('../../pages/loginPage');
const constants = require('../../config/constants');

// Environment Configuration
const env = process.env.TEST_ENV || 'dev';
const envConfig = require(`../../environments/${env}.config.js`);

// Test Suite for Hero Banner Validation
test.describe('Hero Banner Text Validation', () => {
    let basePage, cmsAdminPage, loginPage, logger;

    // Enhanced Test Setup with Robust Initialization
    test.beforeEach(async ({ page }, testInfo) => {
        // Defensive initialization with error handling
        try {
            // Ensure logger is always initialized
            logger = Logger || console;

            // Initialize pages with error checking
            basePage = new BasePage(page, envConfig);
            cmsAdminPage = new CMSAdminPage(page, envConfig);
            loginPage = new LoginPage(page, envConfig);

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

    // Main Test Case with Enhanced Error Handling
    test('Validate hero banner text length restriction', async ({ page } ) => {
        // Test Data Scenarios
        const testScenarios = [
            {
                description: 'Text exceeding maximum length',
                text: 'The swift brown fox jumps quickly over the lazy dog while the curious cat watches intently, wondering what makes the dog so unbothered by the playful fox\'s antics.',
                expectedError: "The field Text must be a string or array type with a maximum length of '160'"
            }
        ];

        // Centralized error handling wrapper
        const runTestScenario = async (scenario) => {
            try {
                // Log scenario details
                logger.info('Testing Scenario', {
                    description: scenario.description,
                    textLength: scenario.text.length
                });

                // Navigation steps
                await cmsAdminPage.navigateToCMSAdmin();
                await cmsAdminPage.clickApplicationListIcon();
                await cmsAdminPage.enterToSearchBox();
                await cmsAdminPage.clickHomePageLink();
                await cmsAdminPage.openHeroBannerProperties();

                // Set hero banner text
                await cmsAdminPage.setHeroBannerText(scenario.text);
                await cmsAdminPage.clickApplyButton();

                // Wait for network stabilization
                await page.waitForLoadState('networkidle', { 
                    timeout: constants.LONG_TIMEOUT 
                });

                // Retrieve and validate error message
                const errorMessage = await cmsAdminPage.getHeroBannerError();

                // Assertion with detailed logging
                if (scenario.expectedError) {
                    expect(errorMessage).toContain(scenario.expectedError);
                } else {
                    expect(errorMessage).toBe('');
                }

                logger.info('Scenario Validation Passed', { 
                    scenario: scenario.description 
                });
            } catch (error) {
                // Detailed error logging
                logger.error('Scenario Validation Failed', {
                    scenario: scenario.description,
                    error: error.message,
                    stack: error.stack
                });
                throw error;
            }
        };

        // Run all test scenarios
        for (const scenario of testScenarios) {
            await runTestScenario(scenario);
        }
    });


    
});
