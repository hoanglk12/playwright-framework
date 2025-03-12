// tests/specs/performance.spec.js
const { test, expect } = require('@playwright/test');
const { runPerformanceAudit } = require('../../utils/performanceHelper');


test('Homepage Performance Audit', async ({ page }) => {
    // Navigate to the URL
    await page.goto('https://www.fieldfisher.com/');
  
    // Disable Cookiebot
    await page.evaluate(() => {
      window.Cookiebot && (window.Cookiebot.dialog = null); // Disable Cookiebot dialog
      document.cookie = 'CookieConsent=stub; path=/'; // Simulate cookie consent
    });
  
    // Run performance audit
    const { score, metrics, fullReport } = await runPerformanceAudit(page.url());
  
    // Attach full performance report to Allure
    await test.info().attach('performance-full-report', {
      body: JSON.stringify(fullReport, null, 2),
      contentType: 'application/json'
    });
  
    // Attach individual metrics to Allure
    await test.info().attach('performance-metrics', {
      body: JSON.stringify(metrics, null, 2),
      contentType: 'application/json'
    });
  
    // Attach score to Allure
    await test.info().attach('performance-score', {
      body: `Performance Score: ${score}`,
      contentType: 'text/plain'
    });
  });