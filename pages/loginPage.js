const constants = require('../config/constants');
const devConfig = require('../environments/dev.config');
const loginLocators = require('../locators/loginLocators');
const Wait = require('../utils/Wait');
const BasePage = require('./basePage');

class LoginPage {
  constructor(page) {
    this.basePage = new BasePage(page);
    this.wait = new Wait(page);
  }
  // Navigate to the login page
  async navigateToLoginPage() {
   await this.basePage.navigate(devConfig.baseUrl);
  }
  async enterUsername() {
    await this.basePage.fillElement(loginLocators.usernameField, devConfig.users.validUser.username);
  }

  async enterPassword() {
    await this.basePage.fillElement(loginLocators.passwordField, devConfig.users.validUser.password);
  }

  async clickLogin() {
    await this.basePage.clickElement(loginLocators.loginButton);
    await this.wait.forLoadState('networkidle', constants.DEFAULT_TIMEOUT);
  }

  async isHomeIconVisible() {
    return await this.basePage.isElementVisible(loginLocators.homeIcon);
  }
}

module.exports = LoginPage;