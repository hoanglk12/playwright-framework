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
  }
  
  module.exports = BasePage;