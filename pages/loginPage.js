const loginLocators = require('../locators/loginLocators');

class LoginPage {
  constructor(page) {
    this.page = page;
  }
  // Navigate to the login page
  async navigateToLoginPage(baseUrl) {
    await this.page.goto(`${baseUrl}/login`); // Assuming /login is the login page path
    await this.page.waitForLoadState('networkidle'); // Wait for the page to fully load
  }
  async enterUsername(username) {
    await this.page.fill(loginLocators.usernameField, username);
  }

  async enterPassword(password) {
    await this.page.fill(loginLocators.passwordField, password);
  }

  async clickLogin() {
    await this.page.click(loginLocators.loginButton);
  }

  async isWelcomeMessageVisible() {
    return await this.page.locator(loginLocators.welcomeMessage).isVisible();
  }
}

module.exports = LoginPage;