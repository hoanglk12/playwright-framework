const { test, expect } = require('@playwright/test');
const BasePage = require('../../pages/basePage');
const devConfig = require('../../environments/dev.config');

let basePage;

test.beforeEach(async ({ page }) => {
    basePage = new BasePage(page);
});

test.afterEach(async ({}, testInfo) => {
    await basePage.closeBrowserOnFailure(testInfo);
});

test('Security Headers Check', async ({ page }) => {
    // Network request logging
    page.on('request', request => {
        console.log('Request:', request.url());
    });

    page.on('response', response => {
        console.log('Response:', response.url(), response.status());
    });

    // Navigate and get response
    const response = await page.goto(devConfig.liveSiteUrl, { 
        waitUntil: 'domcontentloaded' 
    });

    // Header validation
    const headers = response.headers();
    const errors = [];

    const securityChecks = [
        {
            header: 'content-security-policy',
            validation: (value) => value !== undefined,
            errorMessage: 'Content-Security-Policy header is missing'
        },
        {
            header: 'x-frame-options',
            validation: (value) => /^(DENY|SAMEORIGIN)$/.test(value),
            errorMessage: 'X-Frame-Options header is incorrect'
        },
        {
            header: 'x-content-type-options',
            validation: (value) => value === 'nosniff',
            errorMessage: 'X-Content-Type-Options header is incorrect'
        },
        {
            header: 'strict-transport-security',
            validation: (value) => value !== undefined,
            errorMessage: 'Strict-Transport-Security header is missing'
        },
        {
            header: 'referrer-policy',
            validation: (value) => value !== undefined,
            errorMessage: 'Referrer-Policy header is missing'
        },
        {
            header: 'x-xss-protection',
            validation: (value) => value === '1; mode=block',
            errorMessage: 'x-xss-protection is missing or incorrect'
        }
    ];

    // Perform security checks
    securityChecks.forEach(check => {
        try {
            const headerValue = headers[check.header];
            expect(check.validation(headerValue)).toBeTruthy();
        } catch (error) {
            const message = `${check.errorMessage}: ${headers[check.header]}`;
            errors.push(message);
            console.log(message);
        }
    });

    // Report failures
    if (errors.length > 0) {
        throw new Error(`Security header validation failed:\n${errors.join('\n')}`);
    }

    // Attach headers to report
    await test.info().attach('security-headers', {
        body: JSON.stringify(headers, null, 2),
        contentType: 'application/json'
    });
});
