const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/loginPage');
const devConfig = require('../../environments/dev.config');
const BasePage = require('../../pages/basePage');

let basePage;
test.beforeEach(async ({ page }) => {
  basePage = new BasePage(page); // Initialize BasePage
});

test.afterEach(async ({}, testInfo) => {
  await basePage.closeBrowserOnFailure(testInfo); // Call closeBrowserOnFailure after each test
});
test('Login with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Navigate to the login page
  await loginPage.navigateToLoginPage();

  // Perform login
  await loginPage.enterUsername();
  await loginPage.enterPassword();
  await loginPage.clickLogin();

  // Verify success
  await expect(loginPage.isHomeIconVisible()).toBeTruthy();
});