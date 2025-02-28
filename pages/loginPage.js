const BasePage = require('./basePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameField = '#Login1_UserName';
    this.passwordField = '#Login1_Password';
    this.loginButton = '#Login1_LoginButton';
    this.welcomeMessage = '#js-nav-breadcrumb i';
  }

  async enterUsername(username) {
    await this.page.fill(this.usernameField, 'Hoang.Pham');
  }

  async enterPassword(password) {
    await this.page.fill(this.passwordField, 'P@ssw0rd2024July');
  }

  async clickLogin() {
    await this.page.click(this.loginButton);
  }
  async verifyWelcomeMessageDisplayed() {
    await this.page.locator(this.welcomeMessage).waitFor({ state: 'visible', timeout: 10000 });
  }
}

module.exports = LoginPage;