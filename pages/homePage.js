const BasePage = require('./basePage');
const homeLocators = require('../locators/homeLocators');
const constants = require('../config/constants');
const Wait = require('../utils/Wait');

class HomePage extends BasePage {
  constructor(page) {
    super(page);
    this.wait = new Wait(page);
  }

  /**
   * Get all social icons in the footer
   * @returns {Promise<Array<Locator>>} Array of social icon locators
   */
  async getFooterSocialIcons() {
    await this.wait.forLoadState('networkidle', constants.DEFAULT_TIMEOUT);
    return this.page.locator(homeLocators.footerSocialIcons.selector).all();
  }

  /**
   * Get dimensions of all social icons in the footer
   * @returns {Promise<Array<{width: number, height: number}>>} Array of icon dimensions
   */
  async getFooterSocialIconsDimensions() {
    const icons = await this.getFooterSocialIcons();
    const dimensions = [];
    
    for (const icon of icons) {
      const boundingBox = await icon.boundingBox();
      dimensions.push({
        width: boundingBox.width,
        height: boundingBox.height
      });
    }
    
    return dimensions;
  }
}

module.exports = HomePage;