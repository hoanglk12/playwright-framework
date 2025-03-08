const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const { DEFAULT_TIMEOUT } = require('../config/constants');
const Wait = require('../utils/Wait');
const constants = require('../config/constants');

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

    async closeBrowserOnFailure(testResult) {
        if (!testResult) {
            try {
                await this.page.close();
                exec('taskkill /F /IM taskmgr.exe', (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error killing task manager process: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.error(`stderr: ${stderr}`);
                        return;
                    }
                    console.log(`stdout: ${stdout}`);
                });
            } catch (error) {
                console.error('Error in closeBrowserOnFailure:', error);
                throw error;
            }
        }
    }

    async waitForPageLoad() {
        await this.page.waitForLoadState('load');
    }

    async _getLocator(locatorConfig, timeout = DEFAULT_TIMEOUT) {
        return Wait.forElementAttached(this.page, locatorConfig, timeout);
    }

    async fillElement(locatorConfig, text, options = {}) {
        const element = await this._getLocator(locatorConfig, options.timeout);
        await element.fill(text, options);
    }

    async clickElement(locatorConfig, options = {}) {
        const element = await this._getLocator(locatorConfig, options.timeout);
        await element.click(options);
    }
    async waitForElementFocused(locatorConfig, options = {}) {
        const element = await this._getLocator(locatorConfig, options.timeout);
        await element.focus(options);
    }
    async waitForLoadState(state, timeout = constants.DEFAULT_TIMEOUT) {
        await this.page.waitForLoadState(state, { timeout });
    }

    async isElementVisible(locatorConfig, options = {}) {
        const element = await this._getLocator(locatorConfig, options.timeout);
        return element.isVisible(options);
    }
    async waitForElementsVisible(locatorConfig, options = {}) {
        const elements = await this._getLocator(this.page, locatorConfig);

      // Wait for each element to be visible
     
        await elements.waitFor({ state: 'visible', timeout: options.timeout || DEFAULT_TIMEOUT });
        
      
    }
    async pressKey(key) {
       await this.page.keyboard.press(key);
            
    }

    async clickElementInFrameName(frameName, role, name, options = {}) {
        try {
          // Wait for the iframe to be attached
          await this.page.waitForSelector(`iframe[name="${frameName}"]`, {
            state: 'attached',
            timeout: options.timeout || DEFAULT_TIMEOUT
          });
    
          // Switch to the iframe
          const iframe = this.page.frame({ name: frameName });
          if (!iframe) {
            throw new Error(`Iframe with name "${frameName}" not found`);
          }
    
          // Locate the element by role and name within the iframe
          const element = iframe.getByRole(role, { name });
    
          // Perform the action (e.g., click)
          await element.click(options);
    
          console.log(`Clicked element with role "${role}" and name "${name}" in iframe "${frameName}"`);
        } catch (error) {
          console.error(`Failed to interact with element in iframe "${frameName}":`, error);
          throw error;
        }
      }
      async clickElementInFrameLocator(frameLocator, role, name, options = {}) {
        try {
          // Wait for the iframe to be attached
          await this.page.waitForSelector(frameLocator, {
            state: 'attached',
            timeout: options.timeout || DEFAULT_TIMEOUT
          });
    
          // Switch to the iframe
          const iframe = this.page.frameLocator(frameLocator);
          if (!iframe) {
            throw new Error(`Iframe with name "${frameLocator}" not found`);
          }
    
          // Locate the element by role and name within the iframe
          const element = iframe.getByRole(role, { name });
    
          // Perform the action (e.g., click)
          await element.click(options);
    
          console.log(`Clicked element with role "${role}" and name "${name}" in iframe "${frameLocator}"`);
        } catch (error) {
          console.error(`Failed to interact with element in iframe "${frameLocator}":`, error);
          throw error;
        }
      }
      async interactWithElementInFrame(frameName, locatorConfig, options = {}) {
        try {
          // Validate locator configuration
          if (!locatorConfig?.strategy || !locatorConfig?.selector) {
            throw new Error(`Invalid locator config: ${JSON.stringify(locatorConfig)}`);
          }
    
          // Wait for the iframe to be attached
          await this.page.waitForSelector(`iframe[name="${frameName}"]`, {
            state: 'attached',
            timeout: options.timeout || DEFAULT_TIMEOUT
          });
    
          // Switch to the iframe
          const iframe = this.page.frame({ name: frameName });
          if (!iframe) {
            throw new Error(`Iframe with name "${frameName}" not found`);
          }
    
          // Locate the element within the iframe using the dynamic locator
          const element = await this._getLocator(iframe, locatorConfig, options.timeout);
    
          // Perform the action (e.g., click)
          await element.click(options);
    
          console.log(`Clicked element in iframe "${frameName}" using strategy: ${locatorConfig.strategy}`);
        } catch (error) {
          console.error(`Failed to interact with element in iframe "${frameName}":`, error);
          throw error;
        }
      }

    /**
       * Wait for a frame to be attached and return its context
       * @param {Page|Frame} context - Parent context
       * @param {string} frameSelector - Frame selector
       * @param {number} timeout - Maximum wait time
       * @returns {Frame} - Playwright frame
       */
    static async _waitForFrame(context, frameSelector, timeout) {
        await context.waitForSelector(frameSelector, { state: 'attached', timeout });
        return context.frameLocator(frameSelector);
      }
    
      /**
       * Handle nested frames with role-based locators
       * @param {Page|Frame} context - Parent context
       * @param {object} selector - Role selector configuration
       * @param {number} timeout - Maximum wait time
       * @returns {Locator} - Playwright locator
       */
      static async _handleNestedFrameWithRole(context, selector, timeout) {
        const { frameSelectors, roleType, roleName } = selector;
        let frameContext = context;
    
        // Navigate through nested frames
        for (const frameSelector of frameSelectors) {
          frameContext = await this._waitForFrame(frameContext, frameSelector, timeout);
        }
    
        // Locate element by role in the final frame
        const roleLocator = frameContext.getByRole(roleType, { name: roleName });
        await roleLocator.waitFor({ state: 'attached', timeout });
        return roleLocator;
      }
}

module.exports = BasePage;
