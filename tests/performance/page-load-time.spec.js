const { test, expect } = require('@playwright/test');
const constants = require('../../config/constants');
const devConfig = require('../../environments/dev.config');
const BasePage = require('../../pages/basePage');
const Wait = require('../../utils/Wait');

// Define performance thresholds
const PERFORMANCE_THRESHOLDS = {
  navigationTime: 3000,    // Time until navigationEnd in ms
  domContentLoaded: 2500,  // DOMContentLoaded event time in ms
  fullPageLoad: 5000,      // Load event time in ms
  firstPaint: 1500,        // First paint time in ms
  firstContentfulPaint: 2000  // First contentful paint in ms
};

test.describe('Page Load Performance Tests', () => {
  let basePage;
  let wait;

  test.beforeEach(async ({ page }) => {
    basePage = new BasePage(page);
    wait = new Wait(page);
  });

  test('Homepage load time should be within acceptable thresholds', async ({ page }) => {
    // Enable performance metrics collection
    const client = await page.context().newCDPSession(page);
    await client.send('Performance.enable');

    // Navigate to the homepage
    await basePage.navigate(devConfig.liveSiteUrl);
    await wait.forLoadState('networkidle', constants.DEFAULT_TIMEOUT);

    // Collect performance metrics
    const performanceMetrics = await client.send('Performance.getMetrics');
    const navigationTimings = JSON.parse(
      await page.evaluate(() => JSON.stringify(performance.timing))
    );
    
    // Calculate key metrics
    const navigationTime = navigationTimings.navigationStart ? 
      navigationTimings.loadEventEnd - navigationTimings.navigationStart : 0;
    const domContentLoadedTime = navigationTimings.domContentLoadedEventEnd - 
      navigationTimings.navigationStart;
    const loadTime = navigationTimings.loadEventEnd - navigationTimings.navigationStart;
    
    // Get paint timing metrics
    const paintMetrics = JSON.parse(
      await page.evaluate(() => JSON.stringify(performance.getEntriesByType('paint')))
    );
    
    const firstPaint = paintMetrics.find(metric => metric.name === 'first-paint')?.startTime || 0;
    const firstContentfulPaint = paintMetrics.find(
      metric => metric.name === 'first-contentful-paint'
    )?.startTime || 0;

    // Collect all metrics in one object
    const metrics = {
      navigationTime,
      domContentLoaded: domContentLoadedTime,
      fullPageLoad: loadTime,
      firstPaint,
      firstContentfulPaint
    };

    // Log performance results
    console.log('Page Load Performance Metrics:');
    console.table(metrics);

    // Check for violations
    const violations = [];
    Object.entries(metrics).forEach(([metric, value]) => {
      if (PERFORMANCE_THRESHOLDS[metric] && value > PERFORMANCE_THRESHOLDS[metric]) {
        violations.push({
          metric,
          actual: Math.round(value),
          threshold: PERFORMANCE_THRESHOLDS[metric],
          status: 'FAILED'
        });
      }
    });

    // Log violations if any
    if (violations.length > 0) {
      console.log('Performance threshold violations:');
      console.table(violations);
    } else {
      console.log('All performance metrics are within acceptable thresholds');
    }

    // Assert that there are no violations
    expect(violations.length, 
      `Found ${violations.length} performance metrics exceeding thresholds`).toBe(0);
    
    // Individual assertions for detailed reporting
    expect(metrics.navigationTime, 
      `Navigation time (${metrics.navigationTime}ms) exceeds threshold (${PERFORMANCE_THRESHOLDS.navigationTime}ms)`)
      .toBeLessThanOrEqual(PERFORMANCE_THRESHOLDS.navigationTime);
    
    expect(metrics.fullPageLoad, 
      `Full page load time (${metrics.fullPageLoad}ms) exceeds threshold (${PERFORMANCE_THRESHOLDS.fullPageLoad}ms)`)
      .toBeLessThanOrEqual(PERFORMANCE_THRESHOLDS.fullPageLoad);
  });
});
