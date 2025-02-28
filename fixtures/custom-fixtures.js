const { test: base } = require('@playwright/test');
const LoginPage = require('../pages/loginPage');

exports.test = base.extend({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLoginPage(); // Assuming you have this method
    await use(loginPage);
  },
});

exports.expect = base.expect;