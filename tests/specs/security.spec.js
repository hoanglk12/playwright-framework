// tests/specs/security.spec.js
const { test, expect } = require('@playwright/test');
const BasePage = require('../../pages/basePage');
const devConfig = require('../../environments/dev.config');

let basePage;
test.beforeEach(async ({ page }) => {
  basePage = new BasePage(page); // Initialize BasePage
});

test.afterEach(async ({}, testInfo) => {
  await basePage.closeBrowserOnFailure(testInfo); // Call closeBrowserOnFailure after each test
});

test('Security Headers Check', async ({ page }) => {
  // Log all network requests and responses
  page.on('request', request => {
    console.log('Request:', request.url());
  });

  page.on('response', response => {
    console.log('Response:', response.url(), response.status());
  });

  // Navigate to the application
  await page.goto('https://fieldfisher.com');

  // Wait for the specific response
  /*let response;
  try {
        await page.waitForLoadState('networkidle', { timeout: 60000 });
        response = await page.waitForResponse(response => response.url().includes('https://www.example.com'),{ timeout: 60000 });
  } catch (error) {
    console.error('Failed to wait for response:', error);
    throw error;
  }*/
const response = await page.goto('https://fieldfisher.com', { waitUntil: 'domcontentloaded' });
  // Verify security headers
  const headers = response.headers();
  // Validate each security header using try-catch for soft assertions
  const errors = [];

  try {
    expect(headers['content-security-policy']).toBeDefined();
  } catch (error) {
    errors.push('Content-Security-Policy header is missing: ' +  headers['content-security-policy']);
    console.log('Content-Security-Policy header is missing: ', headers['content-security-policy']);
  }

  try {
    expect(headers['x-frame-options']).toMatch(/^(DENY|SAMEORIGIN)$/);
  } catch (error) {
    errors.push('X-Frame-Options header is incorrect: '+ headers['x-frame-options']);
    console.log('X-Frame-Options header is incorrect: ', headers['x-frame-options']);
  }

  try {
    expect(headers['x-content-type-options']).toBe('nosniff');
  } catch (error) {
    errors.push('X-Content-Type-Options header is incorrect: '+ headers['x-content-type-options']);
    console.log('X-Content-Type-Options header is incorrect: ', headers['x-content-type-options']);
  }

  try {
    expect(headers['strict-transport-security']).toBeDefined();
  } catch (error) {
    errors.push('Strict-Transport-Security header is missing: '+ headers['strict-transport-security']);
    console.log('Strict-Transport-Security header is missing: ', headers['strict-transport-security']);
  }

  try {
    expect(headers['referrer-policy']).toBeDefined();
  } catch (error) {
    errors.push('Referrer-Policy header is missing: '+ headers['referrer-policy']);
    console.log('Referrer-Policy header is missing: ', headers['referrer-policy']);
  }
  try {
    expect(headers['x-xss-protection']).toBe('1; mode=block');
  } catch (error) {
    errors.push('x-xss-protection is missing or incorrect: '+ headers['referrer-policy']);
    console.log('x-xss-protection is missing or incorrect: ', headers['referrer-policy']);
  }
  if (errors.length > 0) {
    throw new Error(`Security header validation failed:\n${errors.join('\n')}`);
  }

  // Attach the headers to the Allure report (optional)
  await test.info().attach('security-headers', {
    body: JSON.stringify(headers, null, 2),
    contentType: 'application/json',
  });

});