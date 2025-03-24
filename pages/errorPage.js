const BasePage = require('./basePage');
const errorLocators = require('../locators/errorLocators');
const constants = require('../config/constants');
const Wait = require('../utils/Wait');

class ErrorPage extends BasePage {
  constructor(page) {
    super(page);
    this.wait = new Wait(page);
  }

  /**
   * Navigate to an invalid URL to generate a 404 error page
   * @param {string} baseUrl - Base site URL
   * @param {string} invalidPath - Invalid path to append
   * @returns {ErrorPage} - Returns this for method chaining (Fluent Interface)
   */
  async navigateToErrorPage(baseUrl, invalidPath = 'sorve') {
    const url = `${baseUrl}/en/${invalidPath}`;
    await this.navigate(url);
    await this.wait.forLoadState('domcontentloaded', constants.DEFAULT_TIMEOUT);
    return this;
  }

  /**
   * Check if the globe icon is visible
   * @returns {Promise<boolean>} True if globe icon is visible
   */
  async isGlobeIconVisible() {
    await this.wait.forLoadState('networkidle', constants.DEFAULT_TIMEOUT);
    return await this.isElementVisible(errorLocators.globeIcon);
  }

  /**
   * Check if the globe icon is clickable
   * @returns {Promise<boolean>} True if the globe icon can be clicked
   */
  async isGlobeIconClickable() {
    try {
      // Wait for the element to be clickable
      const locator = await this._getLocator(errorLocators.globeIcon);
      await locator.waitFor({ state: 'attached' });
      
      // Check if the element is enabled
      const isEnabled = await locator.isEnabled();
      
      return isEnabled;
    } catch (error) {
      console.error('Error checking if globe icon is clickable:', error);
      return false;
    }
  }

  /**
   * Click on the globe icon
   * @returns {Promise<void>}
   */
  async clickGlobeIcon() {
    await this.clickElement(errorLocators.globeIcon);
  }

  /**
   * Verify we're on an error page
   * @returns {Promise<boolean>} True if error page content is visible
   */
  async isErrorPageDisplayed() {
    return await this.isElementVisible(errorLocators.errorPageContent);
  }
}

module.exports = ErrorPage;