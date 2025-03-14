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

    // Navigate and get response with timeout
    const response = await Promise.race([
        page.goto(devConfig.liveSiteUrl, { waitUntil: 'domcontentloaded' }),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Navigation timeout')), 30000)
        )
    ]);

    const headers = response.headers();
    const errors = [];

    // Log all received headers
    console.table(Object.entries(headers).map(([key, value]) => ({
        header: key,
        value: value
    })));

    const securityChecks = [
        {
            header: 'content-security-policy',
            validation: (value) => {
                if (!value) return false;
                // Check for essential CSP directives
                return value.includes('default-src') && 
                       value.includes('script-src') && 
                       value.includes('frame-ancestors');
            },
            expectedValue: 'default-src \'self\'; script-src \'self\'; frame-ancestors \'none\'',
            errorMessage: 'Content-Security-Policy header is missing or incomplete'
        },
        {
            header: 'x-frame-options',
            validation: (value) => /^(DENY|SAMEORIGIN)$/.test(value),
            expectedValue: 'DENY',
            errorMessage: 'X-Frame-Options header is incorrect'
        },
        {
            header: 'x-content-type-options',
            validation: (value) => value === 'nosniff',
            expectedValue: 'nosniff',
            errorMessage: 'X-Content-Type-Options header is incorrect'
        },
        {
            header: 'strict-transport-security',
            validation: (value) => {
                if (!value) return false;
                const maxAgeMatch = value.match(/max-age=(\d+)/);
                return maxAgeMatch && parseInt(maxAgeMatch[1]) >= 31536000;
            },
            expectedValue: 'max-age=31536000; includeSubDomains; preload',
            errorMessage: 'Strict-Transport-Security header is missing or max-age too low'
        },
        {
            header: 'referrer-policy',
            validation: (value) => ['no-referrer', 'strict-origin-when-cross-origin'].includes(value),
            expectedValue: 'strict-origin-when-cross-origin',
            errorMessage: 'Referrer-Policy header is missing or incorrect'
        },
        {
            header: 'permissions-policy',
            validation: (value) => value !== undefined,
            expectedValue: 'camera=(), microphone=(), geolocation=()',
            errorMessage: 'Permissions-Policy header is missing'
        },
        {
            header: 'cross-origin-resource-policy',
            validation: (value) => value === 'same-origin',
            expectedValue: 'same-origin',
            errorMessage: 'Cross-Origin-Resource-Policy header is missing or incorrect'
        }
    ];

    // Check for deprecated or dangerous headers
    const deprecatedHeaders = ['x-powered-by', 'server'];
    deprecatedHeaders.forEach(header => {
        if (headers[header]) {
            errors.push(`Dangerous header '${header}' should not be present`);
        }
    });

    // Perform security checks
    securityChecks.forEach(check => {
        try {
            const headerValue = headers[check.header];
            const isValid = check.validation(headerValue);
            expect(isValid).toBeTruthy();
            
            if (!isValid) {
                const message = `${check.errorMessage}:\nExpected: ${check.expectedValue}\nActual: ${headerValue || 'undefined'}`;
                errors.push(message);
                console.log(message);
            }
        } catch (error) {
            const message = `${check.errorMessage}:\nExpected: ${check.expectedValue}\nActual: ${headers[check.header] || 'undefined'}`;
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

// Additional test for API endpoints
/*test('API Security Headers Check', async ({ request }) => {
    const apiEndpoints = [
        '/api/health',
        '/api/status',
        // Add your API endpoints here
    ];

    for (const endpoint of apiEndpoints) {
        const response = await request.get(`${devConfig.liveSiteUrl}${endpoint}`);
        const headers = response.headers();
        
        // Reuse the same security checks for API endpoints
        // Add API-specific checks here if needed
    }
});*/
