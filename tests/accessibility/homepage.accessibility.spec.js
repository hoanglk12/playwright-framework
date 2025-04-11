const { test, expect } = require('../../fixtures/accessibility-fixture');
const axeConfig = require('../../utils/axe-config');

// Define the pages to test
const pagesToTest = [
  {
    name: 'Homepage',
    url: 'https://ff-fieldfishercom-qa-web-ekfefjdmh6dbg3f7.uksouth-01.azurewebsites.net/'
  },
{
    name: 'POK',
    url: 'https://petersofkensington.com.au/'
  }
  // Add more pages as needed
];

// Add this function to your test to handle frames better:

test.describe('Multi-page Accessibility Tests', () => {
    for (const page of pagesToTest) {
      test(`${page.name} should be accessible`, async ({ page: pageObject, accessibilityAnalyzer }) => {
        // Navigate to the page
        await pageObject.goto(page.url);
        
        // Wait for page to be fully loaded
        await pageObject.waitForLoadState('networkidle');
        
        // Optional: Extract frames for deeper testing
        const frameUrls = await pageObject.evaluate(() => {
          return Array.from(document.querySelectorAll('iframe'))
            .map(iframe => iframe.src)
            .filter(src => src && src.trim() !== '');
        });
        
        console.log(`Found ${frameUrls.length} frames on ${page.name}`);
        
        // Run accessibility analysis on main page
        const axeResults = await accessibilityAnalyzer.analyze(axeConfig.options);
        
        // Generate HTML report
        const reportPath = `axe-reports/${page.name.toLowerCase()}-accessibility-report.html`;
        await accessibilityAnalyzer.generateHTMLReport(axeResults, reportPath);
        
        // Filter violations by impact
        const criticalViolations = await accessibilityAnalyzer.filterViolationsByImpact(
          axeResults,
          ['critical', 'serious']
        );
        
        // Assert that there are no critical violations
        expect(criticalViolations.length).toBe(0, 
          `Critical accessibility violations found on ${page.name} page`);
          
        // Optional: Log frame-specific issues for manual testing
        const frameIssues = axeResults.violations.filter(v => 
          v.id === 'frame-title' || 
          v.nodes.some(n => n.html && n.html.toLowerCase().includes('iframe'))
        );
        
        if (frameIssues.length > 0) {
          console.log(`Found ${frameIssues.length} frame-related issues on ${page.name}`);
          for (const issue of frameIssues) {
            console.log(`- ${issue.id}: ${issue.help}`);
          }
        }
      });
    }
  });