const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const { DEFAULT_TIMEOUT } = require('../config/constants');
const Wait = require('../utils/Wait');
const constants = require('../config/constants');
const Logger = require('../utils/logger');

class BasePage {
    constructor(page) {
        this.page = page;
        this.logger = Logger;
    }

    async navigate(url) {
        try {
            this.logger.info(`Navigating to URL: ${url}`);
            await this.page.goto(url);
            this.logger.info(`Successfully navigated to ${url}`);
        } catch (error) {
            this.logger.error(`Navigation failed to ${url}`, error);
            throw error;
        }
    }

    async getTitle() {
        try {
            const title = await this.page.title();
            this.logger.info(`Page title retrieved: ${title}`);
            return title;
        } catch (error) {
            this.logger.error('Failed to retrieve page title', error);
            throw error;
        }
    }

    async closeBrowserOnFailure(testResult) {
        if (testResult && testResult.status === 'failed') {
            try {
                this.logger.warn('Test failed. Attempting to close browser and kill task manager.');
                
                // Close the page
                await this.page.close();
                
                // Kill task manager
                return new Promise((resolve, reject) => {
                    exec('taskkill /F /IM taskmgr.exe', (error, stdout, stderr) => {
                        if (error) {
                            this.logger.error(`Error killing task manager process: ${error.message}`);
                            reject(error);
                            return;
                        }
                        if (stderr) {
                            this.logger.error(`Task manager kill stderr: ${stderr}`);
                            reject(new Error(stderr));
                            return;
                        }
                        this.logger.info(`Task manager killed: ${stdout}`);
                        resolve();
                    });
                });
            } catch (error) {
                this.logger.error('Error in closeBrowserOnFailure', error);
                throw error;
            }
        }
    }

    async waitForPageLoad() {
        try {
            this.logger.info('Waiting for page load');
            await this.page.waitForLoadState('load');
            this.logger.info('Page load complete');
        } catch (error) {
            this.logger.error('Failed to wait for page load', error);
            throw error;
        }
    }

    async _getLocator(locatorConfig, timeout = DEFAULT_TIMEOUT) {
        try {
            this.logger.debug(`Getting locator for config: ${JSON.stringify(locatorConfig)}`, { timeout });
            return await Wait.forElementAttached(this.page, locatorConfig, timeout);
        } catch (error) {
            this.logger.error('Failed to get locator', { 
                locatorConfig, 
                timeout, 
                errorMessage: error.message 
            });
            throw error;
        }
    }

    async fillElement(locatorConfig, text, options = {}) {
        try {
            this.logger.info(`Filling element with text`, { 
                locatorConfig, 
                textLength: text.length 
            });
            const element = await this._getLocator(locatorConfig, options.timeout);
            await element.fill(text, options);
            this.logger.info('Element filled successfully');
        } catch (error) {
            this.logger.error('Failed to fill element', { 
                locatorConfig, 
                errorMessage: error.message 
            });
            throw error;
        }
    }

    async clickElement(locatorConfig, options = {}) {
        try {
            this.logger.info('Clicking element', { 
                locatorConfig, 
                options 
            });
            const element = await this._getLocator(locatorConfig, options.timeout);
            await element.click(options);
            this.logger.info('Element clicked successfully');
        } catch (error) {
            this.logger.error('Failed to click element', { 
                locatorConfig, 
                errorMessage: error.message 
            });
            throw error;
        }
    }

    async waitForElementFocused(locatorConfig, options = {}) {
        try {
            this.logger.info('Waiting for element to be focused', { locatorConfig });
            const element = await this._getLocator(locatorConfig, options.timeout);
            await element.focus(options);
            this.logger.info('Element focused successfully');
        } catch (error) {
            this.logger.error('Failed to focus element', { 
                locatorConfig, 
                errorMessage: error.message 
            });
            throw error;
        }
    }

    async waitForLoadState(state, timeout = constants.DEFAULT_TIMEOUT) {
        try {
            this.logger.info(`Waiting for load state: ${state}`, { timeout });
            await this.page.waitForLoadState(state, { timeout });
            this.logger.info('Load state reached successfully');
        } catch (error) {
            this.logger.error('Failed to wait for load state', { 
                state, 
                timeout, 
                errorMessage: error.message 
            });
            throw error;
        }
    }

    async isElementVisible(locatorConfig, options = {}) {
        try {
            this.logger.info('Checking element visibility', { locatorConfig });
            const element = await this._getLocator(locatorConfig, options.timeout);
            const isVisible = await element.isVisible(options);
            this.logger.info(`Element visibility: ${isVisible}`);
            return isVisible;
        } catch (error) {
            this.logger.error('Failed to check element visibility', { 
                locatorConfig, 
                errorMessage: error.message 
            });
            throw error;
        }
    }

    async waitForElementsVisible(locatorConfig, options = {}) {
        try {
            this.logger.info('Waiting for elements to be visible', { locatorConfig });
            const elements = await this._getLocator(this.page, locatorConfig);
            await elements.waitFor({ 
                state: 'visible', 
                timeout: options.timeout || DEFAULT_TIMEOUT 
            });
            this.logger.info('Elements became visible');
        } catch (error) {
            this.logger.error('Failed to wait for elements visibility', { 
                locatorConfig, 
                errorMessage: error.message 
            });
            throw error;
        }
    }

    async pressKey(key) {
        try {
            this.logger.info(`Pressing key: ${key}`);
            await this.page.keyboard.press(key);
            this.logger.info('Key pressed successfully');
        } catch (error) {
            this.logger.error('Failed to press key', { 
                key, 
                errorMessage: error.message 
            });
            throw error;
        }
    }

    async clickElementInFrameName(frameName, role, name, options = {}) {
        try {
            this.logger.info(`Clicking element in iframe`, { 
                frameName, 
                role, 
                name 
            });

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
    
            this.logger.info(`Clicked element with role "${role}" and name "${name}" in iframe "${frameName}"`);
        } catch (error) {
            this.logger.error(`Failed to interact with element in iframe "${frameName}"`, { 
                frameName, 
                role, 
                name, 
                errorMessage: error.message 
            });
            throw error;
        }
    }

    async clickElementInFrameLocator(frameLocator, role, name, options = {}) {
        try {
            this.logger.info(`Clicking element in iframe locator`, { 
                frameLocator, 
                role, 
                name 
            });

            // Wait for the iframe to be attached
            await this.page.waitForSelector(frameLocator, {
                state: 'attached',
                timeout: options.timeout || DEFAULT_TIMEOUT
            });
    
            // Switch to the iframe
            const iframe = this.page.frameLocator(frameLocator);
            if (!iframe) {
                throw new Error(`Iframe with locator "${frameLocator}" not found`);
            }
    
            // Locate the element by role and name within the iframe
            const element = iframe.getByRole(role, { name });
    
            // Perform the action (e.g., click)
            await element.click(options);
    
            this.logger.info(`Clicked element with role "${role}" and name "${name}" in iframe "${frameLocator}"`);
        } catch (error) {
            this.logger.error(`Failed to interact with element in iframe "${frameLocator}"`, { 
                frameLocator, 
                role, 
                name, 
                errorMessage: error.message 
            });
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
        try {
            this.logger.info(`Waiting for frame with selector: ${frameSelector}`, { timeout });
            await context.waitForSelector(frameSelector, { state: 'attached', timeout });
            const frame = context.frameLocator(frameSelector);
            this.logger.info('Frame located successfully');
            return frame;
        } catch (error) {
            this.logger.error('Failed to wait for frame', { 
                frameSelector, 
                timeout, 
                errorMessage: error.message 
            });
            throw error;
        }
    }

    /**
     * Handle nested frames with role-based locators
     * @param {Page|Frame} context - Parent context
     * @param {object} selector - Role selector configuration
     * @param {number} timeout - Maximum wait time
     * @returns {Locator} - Playwright locator
     */
    static async _handleNestedFrameWithRole(context, selector, timeout) {
        try {
            this.logger.info('Handling nested frame with role', { 
                selector, 
                timeout 
            });

            const { frameSelectors, roleType, roleName } = selector;
            let frameContext = context;

            // Navigate through nested frames
            for (const frameSelector of frameSelectors) {
                frameContext = await this._waitForFrame(frameContext, frameSelector, timeout);
            }

            // Locate element by role in the final frame
            const roleLocator = frameContext.getByRole(roleType, { name: roleName });
            await roleLocator.waitFor({ state: 'attached', timeout });
            
            this.logger.info('Nested frame element located successfully');
            return roleLocator;
        } catch (error) {
            this.logger.error('Failed to handle nested frame with role', { 
                selector, 
                timeout, 
                errorMessage: error.message 
            });
            throw error;
        }
    }
}

module.exports = BasePage;
