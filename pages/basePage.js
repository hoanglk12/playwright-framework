class BasePage {
    constructor(page) {
      this.page = page;
    }
  
    async navigate(url) {
      await this.page.goto(url);
    }
  
    async getTitle() {
      return await this.page.title();
    }
    async login(username, password) {
      await this.page.goto('https://example.com/login');
      await this.page.fill('#username', username);
      await this.page.fill('#password', password);
      await this.page.click('#login-button');
      await this.page.waitForNavigation();
  }
  }
  
  module.exports = BasePage;