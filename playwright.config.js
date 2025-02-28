const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  timeout: 30 * 1000,
  retries: 0,
  workers: 1,
  reporter: [['html', { outputFolder: 'test-results' }]],
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15000,
    ignoreHTTPSErrors: true,
    video: 'off',
    screenshot: 'on',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});