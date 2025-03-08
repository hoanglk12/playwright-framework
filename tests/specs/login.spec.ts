const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/loginPage');
const devConfig = require('../../environments/dev.config');

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