const { chromium } = require('playwright');
const constants = require('../config/constants');

class PerformanceHelper {
  constructor() {
    this.thresholds = {
      performance: 80,
      firstContentfulPaint: 2000,
      speedIndex: 3000,
      largestContentfulPaint: 2500,
      timeToInteractive: 3500,
      totalBlockingTime: 200
    };
  }

  async runPerformanceAudit(url, customThresholds = {}, formFactor = 'desktop') {
    // Dynamically import ESM modules
    const { default: lighthouse } = await import('lighthouse');
    const chromeLauncher = await import('chrome-launcher');

    // Launch Chrome using chrome-launcher
    const chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
    });

    // Configure settings based on formFactor
    const isMobile = formFactor === 'mobile';
    
    // Run Lighthouse with consistent settings
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port,
      formFactor: formFactor,
      screenEmulation: {
        mobile: isMobile,
        width: isMobile ? 375 : 1350,
        height: isMobile ? 667 : 940,
        deviceScaleFactor: isMobile ? 2.0 : 1.0,
        disabled: false
      },
      emulatedUserAgent: isMobile 
        ? 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36'
        : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
      throttling: {
        cpuSlowdownMultiplier: 1,
        downloadThroughputKbps: 5120,
        uploadThroughputKbps: 2560,
        rttMs: 40
      }
    };

    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    const runnerResult = await lighthouse(fullUrl, options);
    const results = runnerResult.lhr;

    await chrome.kill();

    const metrics = {
      performanceScore: results.categories.performance.score * 100,
      firstContentfulPaint: results.audits['first-contentful-paint'].numericValue,
      speedIndex: results.audits['speed-index'].numericValue,
      largestContentfulPaint: results.audits['largest-contentful-paint'].numericValue,
      timeToInteractive: results.audits['interactive'].numericValue,
      totalBlockingTime: results.audits['total-blocking-time'].numericValue
    };

    return {
      metrics,
      thresholds: { ...this.thresholds, ...customThresholds },
      fullReport: results
    };
  }

  validateMetrics(results) {
    const { metrics, thresholds } = results;
    const violations = [];

    Object.entries(metrics).forEach(([metric, value]) => {
      if (thresholds[metric] && metric !== 'performanceScore' && value > thresholds[metric]) {
        violations.push({
          metric,
          actual: Math.round(value),
          threshold: thresholds[metric]
        });
      } else if (metric === 'performanceScore' && value < thresholds[metric]) {
        violations.push({
          metric,
          actual: Math.round(value),
          threshold: thresholds[metric]
        });
      }
    });

    return violations;
  }
}

module.exports = new PerformanceHelper();