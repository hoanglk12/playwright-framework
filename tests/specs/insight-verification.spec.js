const { test, expect } = require('@playwright/test');
const CMSAdminPage = require('../../pages/cmsAdminPage');
const InsightsPage = require('../../pages/insightsPage');
const BasePage = require('../../pages/basePage');
const Logger = require('../../utils/logger');
// Determine which environment to use
const env = process.env.TEST_ENV || 'dev';
const envConfig = require(`../../environments/${env}.config.js`);
let basePage, cmsAdmin, insightsPage, logger;


 // Enhanced Test Setup with Robust Initialization
    test.beforeEach(async ({ page }, testInfo) => {
        // Defensive initialization with error handling
        try {
            // Ensure logger is always initialized
            logger = Logger || console;

            // Initialize pages with error checking
            basePage = new BasePage(page, envConfig);
            cmsAdmin = new CMSAdminPage(page,  envConfig);
            insightsPage = new InsightsPage(page,  envConfig);

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

test('Verify articles per page on live site as per CMS configuration', async ({ }) => {
  
    //const cmsAdmin = new CMSAdminPage(page,  envConfig);
    //const insightsPage = new InsightsPage(page,  envConfig);

    // Step 1: CMS Admin Operations
    await cmsAdmin.navigateToCMSAdmin();
    await cmsAdmin.clickApplicationListIcon();
    await cmsAdmin.enterToSearchBox();
    await cmsAdmin.clickInsightsCMSPage(); 
    await cmsAdmin.clickContentTab();
    const itemsPerPage = await cmsAdmin.getItemsPerPageValue();
    console.log(`CMS Configuration - Items Per Page: ${itemsPerPage}`);

    // Step 2 & 3: Insights Page Verification
    await insightsPage.navigateToInsightsPage();
    const visibleArticles = await insightsPage.countVisibleArticles();
    
    expect(visibleArticles).toBe(Number(itemsPerPage));
    console.log(`Visible Lawyers: ${visibleArticles}/18`);
});