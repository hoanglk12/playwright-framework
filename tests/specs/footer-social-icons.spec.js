const { test, expect } = require('@playwright/test');
const HomePage = require('../../pages/homePage');
const BasePage = require('../../pages/basePage');
const Logger = require('../../utils/logger');
const env = process.env.TEST_ENV || 'dev';
const envConfig = require(`../../environments/${env}.config.js`);

// Import the Charts tool
const chartGenerator = require('../../utils/chartGenerator');

let basePage, homePage, logger;

// Enhanced Test Setup with Robust Initialization
test.beforeEach(async ({ page }, testInfo) => {
  // Defensive initialization with error handling
  try {
      // Ensure logger is always initialized
      logger = Logger || console;

      // Initialize pages with error checking
      basePage = new BasePage(page, envConfig);
      homePage = new HomePage(page, envConfig);
      //loginPage = new LoginPage(page, envConfig);

      // Comprehensive test setup logging
      logger.info('Test Setup', {
          environment: envConfig.liveSiteUrl,
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

test('Verify footer social icons have valid dimensions', async ( {}, testInfo) => {
  try {
    logger.info('Starting footer social icons dimension validation');

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

    // Generate charts using Chart.js
    try {
        logger.info('Generating dimension charts');
        
        // Generate and attach the dimensions chart
        const dimensionsChartBuffer = await chartGenerator.generateDimensionsChart(iconsDimensions);
        await testInfo.attach('Social Icons Dimensions Chart', {
            body: dimensionsChartBuffer,
            contentType: 'image/png'
        });

        // Generate and attach the aspect ratio chart
        const aspectRatioChartBuffer = await chartGenerator.generateAspectRatioChart(iconsDimensions);
        await testInfo.attach('Social Icons Aspect Ratio Chart', {
            body: aspectRatioChartBuffer,
            contentType: 'image/png'
        });

        logger.info('Charts generated successfully');
    } catch (error) {
        logger.error('Chart generation failed', {
            error: error.message,
            stack: error.stack
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
