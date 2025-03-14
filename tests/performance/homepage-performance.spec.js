const { test, expect } = require('@playwright/test');
const performanceHelper = require('../../utils/performanceHelper');
const devConfig = require('../../environments/dev.config');

test.describe('Performance Tests', () => {
  test('Homepage performance audit', async () => {
    const results = await performanceHelper.runPerformanceAudit(devConfig.liveSiteUrl);
    
    // Log performance metrics
    console.table(results.metrics);

    // Validate against thresholds
    const violations = performanceHelper.validateMetrics(results);
    
    // Generate detailed report
    if (violations.length > 0) {
      console.log('Performance threshold violations:');
      console.table(violations);
    }

    // Assertions
    expect(results.metrics.performanceScore).toBeGreaterThanOrEqual(80, 
      'Overall performance score should be above 80');
    
    expect(violations).toHaveLength(0,
      `Found ${violations.length} performance metrics exceeding thresholds`);
  });
});
