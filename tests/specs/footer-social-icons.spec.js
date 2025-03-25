const { test, expect } = require('@playwright/test');
const HomePage = require('../../pages/homePage');
const BasePage = require('../../pages/basePage');
const Logger = require('../../utils/logger');
const env = process.env.TEST_ENV || 'dev';
const envConfig = require(`../../environments/${env}.config.js`);

// Import the Charts tool
const { Charts_generatesCharts } = require('@playwright/test');

let basePage;
let logger;

test.beforeEach(async ({ page }) => {
  logger = Logger;
  basePage = new BasePage(page);

  try {
    logger.info('Test Setup', {
      environment: env,
      testFile: 'footer-social-icons.spec.js'
    });
  } catch (error) {
    logger.error('Error in test setup', { 
      error: error.message,
      stack: error.stack 
    });
    throw error;
  }
});

test.afterEach(async ({}, testInfo) => {
  try {
    await basePage.closeBrowserOnFailure(testInfo);

    logger.info('Test Completed', {
      testName: testInfo.title,
      status: testInfo.status,
      duration: testInfo.duration
    });
  } catch (error) {
    logger.error('Error in test teardown', { 
      error: error.message,
      stack: error.stack 
    });
  }
});

test('Verify footer social icons have valid dimensions', async ({ page }, testInfo) => {
  try {
    logger.info('Starting footer social icons dimension validation');

    const homePage = new HomePage(page);
    
    logger.info('Navigating to homepage', { 
      url: envConfig.liveSiteUrl 
    });

    await homePage.navigate(envConfig.liveSiteUrl);
    
    logger.debug('Retrieving footer social icons dimensions');
    const iconsDimensions = await homePage.getFooterSocialIconsDimensions();
    
    logger.info('Social icons dimensions retrieved', { 
      count: iconsDimensions.length,
      dimensions: iconsDimensions 
    });
    
    // Create a markdown table for icon dimensions
    const dimensionsTable = [
      '| Icon # | Width (px) | Height (px) | Aspect Ratio |',
      '|--------|------------|-------------|--------------|'
    ];

    iconsDimensions.forEach((icon, index) => {
      const aspectRatio = (icon.width / icon.height).toFixed(2);
      dimensionsTable.push(
        `| ${index + 1} | ${icon.width.toFixed(2)} | ${icon.height.toFixed(2)} | ${aspectRatio} |`
      );
    });

    // Log the table for console output
    logger.info('Social Icons Dimensions Table:\n' + dimensionsTable.join('\n'));

    // Optional: Generate a chart using the Charts tool
    try {
      const chartParam = `Bar chart showing social icon dimensions. 
        Labels: Icon 1, Icon 2, Icon 3, Icon 4. 
        Width data: ${iconsDimensions.map(d => d.width).join(', ')}. 
        Height data: ${iconsDimensions.map(d => d.height).join(', ')}`;

      const chartResponse = await Charts_generatesCharts({
        param: chartParam
      });

      // Optionally attach the chart to the test report
      if (chartResponse) {
        await testInfo.attach('Social Icons Dimensions Chart', {
          body: chartResponse,
          contentType: 'image/png'
        });
      }
    } catch (chartError) {
      logger.warn('Chart generation failed', {
        error: chartError.message
      });
    }

    // Verify that exactly 4 social icons exist
    expect(
      iconsDimensions.length, 
      'There should be exactly 4 social icons in footer'
    ).toBe(4);
    
    // Verify that each icon has valid width and height
    iconsDimensions.forEach((icon, index) => {
      try {
        logger.debug(`Validating social icon ${index + 1} dimensions`, {
          width: icon.width,
          height: icon.height
        });

        // Width validation
        expect(
          icon.width,
          `Social icon ${index + 1} should have a valid width value`
        ).toBeGreaterThan(0);
        
        // Height validation
        expect(
          icon.height,
          `Social icon ${index + 1} should have a valid height value`
        ).toBeGreaterThan(0);

        logger.info(`Social icon ${index + 1} dimension validation passed`);
      } catch (dimensionError) {
        logger.error(`Social icon ${index + 1} dimension validation failed`, {
          width: icon.width,
          height: icon.height,
          error: dimensionError.message
        });
        throw dimensionError;
      }
    });

    // Attach the dimensions table to the test report
    await testInfo.attach('Social Icons Dimensions', {
      body: dimensionsTable.join('\n'),
      contentType: 'text/markdown'
    });

    logger.info('Footer social icons dimension validation completed successfully');
  } catch (error) {
    logger.error('Footer social icons dimension test failed', {
      error: error.message,
      stack: error.stack
    });

    throw error;
  }
});

// Additional test for dimension analysis
test('Analyze footer social icons dimensions', async ({ page }) => {
  try {
    logger.info('Starting social icons dimension analysis');

    const homePage = new HomePage(page);
    await homePage.navigate(envConfig.liveSiteUrl);

    const iconsDimensions = await homePage.getFooterSocialIconsDimensions();

    // Dimension analysis
    const analysis = {
      totalIcons: iconsDimensions.length,
      averageWidth: iconsDimensions.reduce((sum, icon) => sum + icon.width, 0) / iconsDimensions.length,
      averageHeight: iconsDimensions.reduce((sum, icon) => sum + icon.height, 0) / iconsDimensions.length,
      minWidth: Math.min(...iconsDimensions.map(icon => icon.width)),
      maxWidth: Math.max(...iconsDimensions.map(icon => icon.width)),
      minHeight: Math.min(...iconsDimensions.map(icon => icon.height)),
      maxHeight: Math.max(...iconsDimensions.map(icon => icon.height))
    };

    logger.info('Social Icons Dimension Analysis', analysis);

    // Optional: You can add more specific assertions based on your design requirements
    expect(analysis.totalIcons).toBe(4);
    expect(analysis.averageWidth).toBeGreaterThan(0);
    expect(analysis.averageHeight).toBeGreaterThan(0);
  } catch (error) {
    logger.error('Social icons dimension analysis failed', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
});
