const BasePage = require('./basePage');
const articleLocators = require('../locators/articleLocators');
const Wait = require('../utils/Wait');
const constants = require('../config/constants');



class ArticlePage extends BasePage {
  constructor(page) {
    super(page);
    this.wait = new Wait(page);
  }

  async getArticleTitle() {
    await this.wait.forLoadState('networkidle', constants.LONG_TIMEOUT);
    return (await this.page.locator(articleLocators.ariticleTitle.selector).textContent()).trim();
  }

  async extractPracticeArea() {
    await this.wait.forLoadState('networkidle', constants.LONG_TIMEOUT);
    const html = await this.page.content();
    const regex = /window\.dataLayer\.push\(\s*(\{[^}]*\})\s*\);/s;
    const match = html.match(regex);
    if (match && match[1]) {
      // Convert single quotes to double quotes for valid JSON format
      const jsonString = match[1].replace(/'/g, '"'); // Use RegEx to replace single quotes with double quotes

      // Parse the matched JSON string to a JavaScript object
      const dataLayerObject = JSON.parse(jsonString);

      // Retrieve the practiceArea value
      const practiceArea = dataLayerObject.practiceArea || null; // Default to null if not found
      return practiceArea;
    } else {
      console.log("No dataLayer.push found.");
    }
    }
}

module.exports = ArticlePage;