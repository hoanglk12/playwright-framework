const BasePage = require('./basePage');
const homeLocators = require('../locators/homeLocators');
const constants = require('../config/constants');
const Wait = require('../utils/Wait');
const Logger = require('../utils/logger');

class HomePage extends BasePage {
  constructor(page) {
    super(page);
    this.wait = new Wait(page);
    this.logger = Logger;
  }

  /**
   * Get all social icons in the footer
   * @returns {Promise<Array<Locator>>} Array of social icon locators
   */
  async getFooterSocialIcons() {
    try {
      this.logger.debug('Retrieving footer social icons', {
        selector: homeLocators.footerSocialIcons.selector
      });

      // Wait for network idle state
      await this.wait.forLoadState('networkidle', constants.DEFAULT_TIMEOUT);

      // Locate and retrieve social icons
      const icons = await this.page.locator(homeLocators.footerSocialIcons.selector).all();
      
      this.logger.info('Footer social icons retrieved', {
        iconCount: icons.length
      });

      return icons;
    } catch (error) {
      this.logger.error('Failed to retrieve footer social icons', {
        selector: homeLocators.footerSocialIcons.selector,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Get dimensions of all social icons in the footer
   * @returns {Promise<Array<{width: number, height: number}>>} Array of icon dimensions
   */
  async getFooterSocialIconsDimensions() {
    try {
      this.logger.debug('Starting footer social icons dimension retrieval');

      // Get social icons
      const icons = await this.getFooterSocialIcons();
      const dimensions = [];
      
      // Measure dimensions for each icon
      for (const [index, icon] of icons.entries()) {
        try {
          const boundingBox = await icon.boundingBox();
          
          const iconDimension = {
            width: boundingBox.width,
            height: boundingBox.height
          };
          
          dimensions.push(iconDimension);
          
          this.logger.debug(`Social icon ${index + 1} dimensions`, {
            width: iconDimension.width,
            height: iconDimension.height
          });
        } catch (iconError) {
          this.logger.error(`Failed to get dimensions for social icon ${index + 1}`, {
            error: iconError.message
          });
          throw iconError;
        }
      }
      
      this.logger.info('Footer social icons dimensions retrieved', {
        totalIcons: dimensions.length
      });
      
      return dimensions;
    } catch (error) {
      this.logger.error('Failed to retrieve footer social icons dimensions', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Get social icon links from the footer
   * @returns {Promise<Array<string>>} Array of social icon links
   */
  async getFooterSocialIconLinks() {
    try {
      this.logger.debug('Retrieving footer social icon links');

      // Get social icons
      const icons = await this.getFooterSocialIcons();
      const links = [];
      
      // Extract links for each icon
      for (const [index, icon] of icons.entries()) {
        try {
          // Assuming social icons are within anchor tags
          const link = await icon.getAttribute('href');
          
          if (link) {
            links.push(link);
            
            this.logger.debug(`Social icon ${index + 1} link`, {
              link: link
            });
          } else {
            this.logger.warn(`No link found for social icon ${index + 1}`);
          }
        } catch (linkError) {
          this.logger.error(`Failed to get link for social icon ${index + 1}`, {
            error: linkError.message
          });
          throw linkError;
        }
      }
      
      this.logger.info('Footer social icon links retrieved', {
        totalLinks: links.length
      });
      
      return links;
    } catch (error) {
      this.logger.error('Failed to retrieve footer social icon links', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Navigate to home page
   * @param {string} url - URL to navigate to
   */
  async navigate(url) {
    try {
      this.logger.info('Navigating to home page', { url });
      
      await this.page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: constants.DEFAULT_TIMEOUT 
      });
      
      this.logger.debug('Home page navigation completed', {
        currentUrl: this.page.url()
      });
    } catch (error) {
      this.logger.error('Failed to navigate to home page', {
        url,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Check if home page is loaded
   * @returns {Promise<boolean>} Whether home page is loaded
   */
  async isLoaded() {
    try {
      this.logger.debug('Checking home page load status');
      
      // Example check - adjust based on your specific page
      const pageTitle = await this.page.title();
      const isLoaded = pageTitle.includes('Home');
      
      this.logger.info('Home page load status', {
        loaded: isLoaded,
        pageTitle: pageTitle
      });
      
      return isLoaded;
    } catch (error) {
      this.logger.error('Failed to check home page load status', {
        error: error.message,
        stack: error.stack
      });
      return false;
    }
  }
}

module.exports = HomePage;
