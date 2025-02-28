const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/loginPage');
const devConfig = require('../../environments/dev.config');

test('Login with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Navigate to the login page
  await loginPage.navigateToLoginPage(devConfig.baseUrl);

  // Perform login
  await loginPage.enterUsername(devConfig.users.validUser.username);
  await loginPage.enterPassword(devConfig.users.validUser.password);
  await loginPage.clickLogin();

  // Verify success
  await expect(loginPage.isWelcomeMessageVisible()).toBeTruthy();
});