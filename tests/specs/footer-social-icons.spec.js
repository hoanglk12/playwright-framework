const { test, expect } = require('@playwright/test');
const HomePage = require('../../pages/homePage');
const BasePage = require('../../pages/basePage');
const env = process.env.TEST_ENV || 'dev';
const envConfig = require(`../../environments/${env}.config.js`);

let basePage;

test.beforeEach(async ({ page }) => {
  basePage = new BasePage(page);
});

test.afterEach(async ({}, testInfo) => {
  await basePage.closeBrowserOnFailure(testInfo);
});

test('Verify footer social icons have valid dimensions', async ({ page }) => {
  // Initialize home page
  const homePage = new HomePage(page);
  
  // Navigate to the homepage
  await homePage.navigate(envConfig.liveSiteUrl);
  
  // Get dimensions of all social icons in footer
  const iconsDimensions = await homePage.getFooterSocialIconsDimensions();
  
  // Log for debugging
  console.log('Social icons found:', iconsDimensions.length);
  console.table(iconsDimensions);
  
  // Verify that exactly 4 social icons exist
  expect(iconsDimensions.length, 'There should be exactly 4 social icons in footer').toBe(4);
  
  // Verify that each icon has valid width and height
  for (let i = 0; i < iconsDimensions.length; i++) {
    const icon = iconsDimensions[i];
    expect(
      icon.width,
      `Social icon ${i+1} should have a valid width value`
    ).toBeGreaterThan(0);
    
    expect(
      icon.height,
      `Social icon ${i+1} should have a valid height value`
    ).toBeGreaterThan(0);
  }
});