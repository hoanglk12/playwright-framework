// utils/performanceHelper.js
const { chromium } = require('playwright');
const { default: lighthouse } = import('lighthouse');

async function runPerformanceAudit(url) {
  // Launch Playwright's Chromium browser
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Get the WebSocket endpoint for CDP
  const cdpEndpoint = await context.newCDPSession(page);
  const wsEndpoint = cdpEndpoint._connection._url;
  console.log('WebSocket Endpoint:', wsEndpoint);

  // Extract the port from the WebSocket endpoint
  const port = new URL(wsEndpoint).port;

  // Run Lighthouse audit
  const results = await lighthouse(url, {
    port: Number(port), // Lighthouse expects a number, not a string
    output: 'json',
    onlyCategories: ['performance']
  });

  // Close the browser
  await browser.close();

  return {
    score: results.lhr.categories.performance.score * 100,
    metrics: results.lhr.audits,
    fullReport: results.lhr // Include the full Lighthouse report
  };
}

module.exports = { runPerformanceAudit };