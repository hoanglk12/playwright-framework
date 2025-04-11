const { test: base } = require('@playwright/test');
const AccessibilityHelper = require('../utils/accessibility.helper');

// Create a test fixture that provides accessibility testing capabilities
exports.test = base.extend({
  accessibilityAnalyzer: async ({ page }, use) => {
    // Create an instance of AccessibilityHelper with the page
    const accessibilityAnalyzer = new AccessibilityHelper(page);
    
    // Pass the instance to the test
    await use({
      analyze: async (config) => {
        return accessibilityAnalyzer.analyze(config);
      },
      generateHTMLReport: async (axeResults, reportPath) => {
        return accessibilityAnalyzer.generateHTMLReport(axeResults, reportPath);
      },
      filterViolationsByImpact: async (axeResults, impactLevels) => {
        return accessibilityAnalyzer.filterViolationsByImpact(axeResults, impactLevels);
      }
    });
  }
});

exports.expect = require('@playwright/test').expect;