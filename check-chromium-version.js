// Check Chromium version
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const version = browser.version();
  console.log('Chromium Version:', version);
  await browser.close();
})();