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

    async getCurrentPageUrl() {
        try {
            const currentPageUrl = await this.page.url();
            this.logger.info(`Page opened with url: ${title}`);
            return currentPageUrl;
        } catch (error) {
            this.logger.error('Error getting current page URL', error);
            throw error;
        }
    }

    async getPageSource() {
        try {
            const pageSource = await this.page.content();
            this.logger.info(`Page source retrieved successfully: ${pageSource}`);
            return pageSource;
        } catch (error) {
            this.logger.error('Error getting page source', error);
            throw error;
        }
    }

      // Browser Navigation
    async backToPage() {
        try {
            this.logger.info('Waiting for backToPage to be called');
            await this.page.goBack();
            this.logger.info('Navigated back successfully');
        } catch (error) {
            this.logger.error('Error navigating back', error);
            throw error;
        }
    }

    async refreshCurrentPage() {
        try {
            this.logger.info('Refreshing current page');
            await this.page.reload();
            this.logger.info('Page refreshed successfully');
        } catch (error) {
            this.logger.error('Error refreshing current page', error);
            throw error;
        }
    }

    async forwardToPage() {
        try {
            this.logger.info('Waiting for forwardToPage to be called');
            await this.page.goForward();

        } catch (error) {
            console.error('Error navigating forward', error);
            throw error;
        }
    }

    // Cookie methods
    async getAllCookies() {
        try {
            this.logger.info('Getting all cookies');
            const cookies = await this.page.context().cookies();
            this.logger.info(`Retrieved ${cookies.length} cookies`);
            return cookies;
        } catch (error) {
            this.logger.error('Error getting cookies', error);
            throw error;
        }
    }

    async setAllCookies(cookies) {
        try {
            this.logger.info(`Setting ${cookies.length} cookies`);
            await this.page.context().addCookies(cookies);
            this.logger.info('Cookies set successfully');
        } catch (error) {
            this.logger.error('Error setting cookies', error);
            throw error;
        }
    }

    // Alert handling - Playwright handles dialogs differently than Selenium
    async waitForAlertPresence(action) {
        try {
            this.logger.info('Waiting for alert presence');
            return new Promise(async (resolve) => {
                this.page.once('dialog', async dialog => {
                    this.logger.info(`Alert detected: ${dialog.message()}`);
                    resolve(dialog);
                });
                
                if (action) {
                    await action();
                }
            });
        } catch (error) {
            this.logger.error('Error waiting for alert', error);
            throw error;
        }
    }

    async acceptAlert(action) {
        try {
            this.logger.info('Accepting alert');
            const dialog = await this.waitForAlertPresence(action);
            await dialog.accept();
            this.logger.info('Alert accepted');
        } catch (error) {
            this.logger.error('Error accepting alert', error);
            throw error;
        }
    }
    
    async cancelAlert(action) {
        try {
            this.logger.info('Dismissing alert');
            const dialog = await this.waitForAlertPresence(action);
            await dialog.dismiss();
            this.logger.info('Alert dismissed');
        } catch (error) {
            this.logger.error('Error dismissing alert', error);
            throw error;
        }
    }

    async getTextAlert(action) {
        try {
            this.logger.info('Getting alert text');
            const dialog = await this.waitForAlertPresence(action);
            const text = dialog.message();
            this.logger.info(`Alert text: ${text}`);
            return text;
        } catch (error) {
            this.logger.error('Error getting alert text', error);
            throw error;
        }
    }

    async sendkeyToAlert(text, action) {
        try {
            this.logger.info(`Sending text to alert: ${text}`);
            const dialog = await this.waitForAlertPresence(action);
            await dialog.accept(text);
            this.logger.info('Text sent to alert');
        } catch (error) {
            this.logger.error('Error sending text to alert', error);
            throw error;
        }
    }

    // Window handling
    async switchToWindowByTitle(expectedTitle) {
        try {
            this.logger.info(`Switching to window with title: ${expectedTitle}`);
            const pages = this.page.context().pages();
            for (const page of pages) {
                const title = await page.title();
                if (title === expectedTitle) {
                    await page.bringToFront();
                    this.page = page;
                    this.logger.info('Switched to window successfully');
                    return;
                }
            }
            throw new Error(`Window with title "${expectedTitle}" not found`);
        } catch (error) {
            this.logger.error('Error switching to window by title', error);
            throw error;
        }
    }

    async switchToWindowById(parentWindowId) {
        try {
            this.logger.info(`Switching to window other than: ${parentWindowId}`);
            const pages = this.page.context().pages();
            for (const page of pages) {
                if (page !== this.page) {
                    await page.bringToFront();
                    this.page = page;
                    this.logger.info('Switched to new window successfully');
                    return;
                }
            }
            throw new Error('No other window found');
        } catch (error) {
            this.logger.error('Error switching to window by id', error);
            throw error;
        }
    }

    async closeAllWindowsWithoutParent() {
        try {
            this.logger.info('Closing all windows except parent');
            const parentPage = this.page;
            const pages = this.page.context().pages();
            for (const page of pages) {
                if (page !== parentPage) {
                    await page.close();
                }
            }
            await parentPage.bringToFront();
            this.page = parentPage;
            this.logger.info('All other windows closed');
        } catch (error) {
            this.logger.error('Error closing windows', error);
            throw error;
        }
    }

    // Helper method to get element by selector
    async getElement(selector, options = {}) {
        try {
            this.logger.info(`Getting element with selector: ${selector}`);
            return await this.page.locator(selector);
        } catch (error) {
            this.logger.error('Failed to get element', { selector, error });
            throw error;
        }
    }

    // Helper method to get multiple elements
    async getElements(selector, options = {}) {
        try {
            this.logger.info(`Getting elements with selector: ${selector}`);
            return await this.page.locator(selector).all();
        } catch (error) {
            this.logger.error('Failed to get elements', { selector, error });
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

    // Helper method to get element by selector
    async getElement(selector, options = {}) {
        try {
            this.logger.info(`Getting element with selector: ${selector}`);
            return await this.page.locator(selector);
        } catch (error) {
            this.logger.error('Failed to get element', { selector, error });
            throw error;
        }
    }

    // Helper method to get multiple elements
    async getElements(selector, options = {}) {
        try {
            this.logger.info(`Getting elements with selector: ${selector}`);
            return await this.page.locator(selector).all();
        } catch (error) {
            this.logger.error('Failed to get elements', { selector, error });
            throw error;
        }
    }

    async clickElement(selector, options = {}) {
        try {
            this.logger.info(`Clicking element: ${selector}`);
            const element = await this.page.locator(selector);
            await element.click(options);
            this.logger.info('Element clicked successfully');
        } catch (error) {
            this.logger.error('Failed to click element', { selector, error });
            throw error;
        }
    }

    async clickElementByJS(selector, options = {}) {
        try {
            this.logger.info(`Clicking element by JS: ${selector}`);
            const element = await this.page.locator(selector);
            await this.page.evaluate(el => el.click(), await element.elementHandle());
            this.logger.info('Element clicked by JS successfully');
        } catch (error) {
            this.logger.error('Failed to click element by JS', { selector, error });
            throw error;
        }
    }

    async sendkeyToElement(selector, value, options = {}) {
        try {
            this.logger.info(`Sending keys to element: ${selector}, value: ${value}`);
            const element = await this.page.locator(selector);
            await element.fill(''); // Clear first
            await element.type(value, options);
            this.logger.info('Keys sent successfully');
        } catch (error) {
            this.logger.error('Failed to send keys to element', { selector, value, error });
            throw error;
        }
    }

     // Dropdown handling
     async selectItemInDropdown(selector, textItem, options = {}) {
        try {
            this.logger.info(`Selecting item in dropdown: ${selector}, text: ${textItem}`);
            const element = await this.page.locator(selector);
            await element.selectOption({ label: textItem });
            this.logger.info('Item selected successfully');
        } catch (error) {
            this.logger.error('Failed to select item in dropdown', { selector, textItem, error });
            throw error;
        }
    }

    async getSelectedItemInDropdown(selector) {
        try {
            this.logger.info(`Getting selected item in dropdown: ${selector}`);
            const element = await this.page.locator(selector);
            const selectedValue = await element.evaluate(select => {
                return select.options[select.selectedIndex].text;
            });
            this.logger.info(`Selected item: ${selectedValue}`);
            return selectedValue;
        } catch (error) {
            this.logger.error('Failed to get selected item in dropdown', { selector, error });
            throw error;
        }
    }

    async isDropdownMultiple(selector) {
        try {
            this.logger.info(`Checking if dropdown is multiple: ${selector}`);
            const element = await this.page.locator(selector);
            const isMultiple = await element.evaluate(select => select.multiple);
            this.logger.info(`Dropdown multiple: ${isMultiple}`);
            return isMultiple;
        } catch (error) {
            this.logger.error('Failed to check if dropdown is multiple', { selector, error });
            throw error;
        }
    }

    async selectItemInCustomDropdown(parentSelector, childSelector, expectedItem) {
        try {
            this.logger.info(`Selecting item in custom dropdown: ${parentSelector}, item: ${expectedItem}`);
            // Click the dropdown to open it
            await this.clickElement(parentSelector);
            
            // Wait for dropdown items to appear
            await this.page.waitForSelector(childSelector);
            
            // Find and click the desired item
            const items = await this.page.locator(childSelector).all();
            for (const item of items) {
                const text = await item.textContent();
                if (text.trim() === expectedItem) {
                    await item.scrollIntoViewIfNeeded();
                    await item.click();
                    this.logger.info('Item selected successfully');
                    return;
                }
            }
            throw new Error(`Item "${expectedItem}" not found in dropdown`);
        } catch (error) {
            this.logger.error('Failed to select item in custom dropdown', { parentSelector, childSelector, expectedItem, error });
            throw error;
        }
    }

    // Element properties and attributes
    async getAttributeValue(selector, attribute) {
        try {
            this.logger.info(`Getting attribute value: ${selector}, attribute: ${attribute}`);
            const element = await this.page.locator(selector);
            const value = await element.getAttribute(attribute);
            this.logger.info(`Attribute value: ${value}`);
            return value;
        } catch (error) {
            this.logger.error('Failed to get attribute value', { selector, attribute, error });
            throw error;
        }
    }

    async getTextElement(selector) {
        try {
            this.logger.info(`Getting text from element: ${selector}`);
            const element = await this.page.locator(selector);
            const text = await element.textContent();
            this.logger.info(`Element text: ${text}`);
            return text.trim();
        } catch (error) {
            this.logger.error('Failed to get text from element', { selector, error });
            throw error;
        }
    }

    async getCssValue(selector, cssProperty) {
        try {
            this.logger.info(`Getting CSS value: ${selector}, property: ${cssProperty}`);
            const element = await this.page.locator(selector);
            const value = await element.evaluate((el, property) => {
                return window.getComputedStyle(el).getPropertyValue(property);
            }, cssProperty);
            this.logger.info(`CSS value: ${value}`);
            return value;
        } catch (error) {
            this.logger.error('Failed to get CSS value', { selector, cssProperty, error });
            throw error;
        }
    }

    async getElementSize(selector) {
        try {
            this.logger.info(`Getting element count: ${selector}`);
            const count = await this.page.locator(selector).count();
            this.logger.info(`Element count: ${count}`);
            return count;
        } catch (error) {
            this.logger.error('Failed to get element count', { selector, error });
            throw error;
        }
    }

    // Checkbox and radio button handling
    async checkToCheckboxOrRadio(selector) {
        try {
            this.logger.info(`Checking checkbox or radio: ${selector}`);
            const element = await this.page.locator(selector);
            const isChecked = await element.isChecked();
            if (!isChecked) {
                await element.check();
                this.logger.info('Checkbox/radio checked successfully');
            } else {
                this.logger.info('Checkbox/radio already checked');
            }
        } catch (error) {
            this.logger.error('Failed to check checkbox or radio', { selector, error });
            throw error;
        }
    }

    async uncheckToCheckbox(selector) {
        try {
            this.logger.info(`Unchecking checkbox: ${selector}`);
            const element = await this.page.locator(selector);
            const isChecked = await element.isChecked();
            if (isChecked) {
                await element.uncheck();
                this.logger.info('Checkbox unchecked successfully');
            } else {
                this.logger.info('Checkbox already unchecked');
            }
        } catch (error) {
            this.logger.error('Failed to uncheck checkbox', { selector, error });
            throw error;
        }
    }

    // Element state checking
    async isElementDisplayed(selector, options = { timeout: 1000 }) {
        try {
            this.logger.info(`Checking if element is displayed: ${selector}`);
            const element = await this.page.locator(selector);
            const isVisible = await element.isVisible({ timeout: options.timeout });
            this.logger.info(`Element displayed: ${isVisible}`);
            return isVisible;
        } catch (error) {
            this.logger.info(`Element not displayed: ${selector}`);
            return false;
        }
    }

    async isElementUndisplayed(selector, options = { timeout: 1000 }) {
        try {
            this.logger.info(`Checking if element is undisplayed: ${selector}`);
            const count = await this.page.locator(selector).count();
            if (count === 0) {
                this.logger.info('Element not found (undisplayed)');
                return true;
            }
            
            const isVisible = await this.page.locator(selector).first().isVisible({ timeout: options.timeout });
            this.logger.info(`Element undisplayed: ${!isVisible}`);
            return !isVisible;
        } catch (error) {
            this.logger.info(`Error checking if element is undisplayed: ${selector}`);
            return true; // Element not found or not visible
        }
    }

    async isElementSelected(selector) {
        try {
            this.logger.info(`Checking if element is selected: ${selector}`);
            const element = await this.page.locator(selector);
            const isChecked = await element.isChecked();
            this.logger.info(`Element selected: ${isChecked}`);
            return isChecked;
        } catch (error) {
            this.logger.error('Failed to check if element is selected', { selector, error });
            throw error;
        }
    }

    async isElementEnabled(selector) {
        try {
            this.logger.info(`Checking if element is enabled: ${selector}`);
            const element = await this.page.locator(selector);
            const isEnabled = await element.isEnabled();
            this.logger.info(`Element enabled: ${isEnabled}`);
            return isEnabled;
        } catch (error) {
            this.logger.error('Failed to check if element is enabled', { selector, error });
            throw error;
        }
    }

    // Frame handling
    async switchToFrame(frameSelector) {
        try {
            this.logger.info(`Switching to frame: ${frameSelector}`);
            const frame = await this.page.frameLocator(frameSelector);
            this.logger.info('Switched to frame successfully');
            return frame;
        } catch (error) {
            this.logger.error('Failed to switch to frame', { frameSelector, error });
            throw error;
        }
    }

    async switchToDefaultContent() {
        try {
            this.logger.info('Switching to default content');
            // In Playwright, you don't need to switch back explicitly
            this.logger.info('Switched to default content successfully');
        } catch (error) {
            this.logger.error('Failed to switch to default content', error);
            throw error;
        }
    }

    // Mouse actions
    async doubleClickToElement(selector) {
        try {
            this.logger.info(`Double clicking element: ${selector}`);
            const element = await this.page.locator(selector);
            await element.dblclick();
            this.logger.info('Element double clicked successfully');
        } catch (error) {
            this.logger.error('Failed to double click element', { selector, error });
            throw error;
        }
    }

    async hoverToElement(selector) {
        try {
            this.logger.info(`Hovering over element: ${selector}`);
            const element = await this.page.locator(selector);
            await element.hover();
            this.logger.info('Element hovered successfully');
        } catch (error) {
            this.logger.error('Failed to hover over element', { selector, error });
            throw error;
        }
    }

    async rightClickToElement(selector) {
        try {
            this.logger.info(`Right clicking element: ${selector}`);
            const element = await this.page.locator(selector);
            await element.click({ button: 'right' });
            this.logger.info('Element right clicked successfully');
        } catch (error) {
            this.logger.error('Failed to right click element', { selector, error });
            throw error;
        }
    }

    async dragAndDrop(sourceSelector, targetSelector) {
        try {
            this.logger.info(`Dragging from ${sourceSelector} to ${targetSelector}`);
            const sourceElement = await this.page.locator(sourceSelector);
            const targetElement = await this.page.locator(targetSelector);
            
            await sourceElement.dragTo(targetElement);
            this.logger.info('Drag and drop completed successfully');
        } catch (error) {
            this.logger.error('Failed to perform drag and drop', { sourceSelector, targetSelector, error });
            throw error;
        }
    }

    async pressKeyboardToElement(selector, key) {
        try {
            this.logger.info(`Pressing key ${key} on element: ${selector}`);
            const element = await this.page.locator(selector);
            await element.press(key);
            this.logger.info('Key pressed successfully');
        } catch (error) {
            this.logger.error('Failed to press key on element', { selector, key, error });
            throw error;
        }
    }

    // JavaScript execution
    async executeForBrowser(javaScript) {
        try {
            this.logger.info(`Executing JavaScript: ${javaScript}`);
            const result = await this.page.evaluate(javaScript);
            this.logger.info('JavaScript executed successfully');
            return result;
        } catch (error) {
            this.logger.error('Failed to execute JavaScript', { javaScript, error });
            throw error;
        }
    }

    async getInnerText() {
        try {
            this.logger.info('Getting inner text of document');
            const innerText = await this.page.evaluate(() => document.documentElement.innerText);
            this.logger.info('Inner text retrieved successfully');
            return innerText;
        } catch (error) {
            this.logger.error('Failed to get inner text', error);
            throw error;
        }
    }

    async isExpectedTextInInnerText(textExpected) {
        try {
            this.logger.info(`Checking if text "${textExpected}" is in inner text`);
            const result = await this.page.evaluate((text) => {
                const match = document.documentElement.innerText.match(text);
                return match && match[0] === text;
            }, textExpected);
            this.logger.info(`Text found: ${result}`);
            return result;
        } catch (error) {
            this.logger.error('Failed to check text in inner text', { textExpected, error });
            throw error;
        }
    }

    async scrollToBottomPage() {
        try {
            this.logger.info('Scrolling to bottom of page');
            await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            this.logger.info('Scrolled to bottom successfully');
        } catch (error) {
            this.logger.error('Failed to scroll to bottom of page', error);
            throw error;
        }
    }

    async scrollToTopPage() {
        try {
            this.logger.info('Scrolling to top of page');
            await this.page.evaluate(() => window.scrollTo(0, 0));
            this.logger.info('Scrolled to top successfully');
        } catch (error) {
            this.logger.error('Failed to scroll to top of page', error);
            throw error;
        }
    }

    async navigateToUrlByJS(url) {
        try {
            this.logger.info(`Navigating to URL by JS: ${url}`);
            await this.page.evaluate((url) => window.location = url, url);
            this.logger.info('Navigated successfully');
        } catch (error) {
            this.logger.error('Failed to navigate by JS', { url, error });
            throw error;
        }
    }

    async highlightElement(selector) {
        try {
            this.logger.info(`Highlighting element: ${selector}`);
            await this.page.evaluate((selector) => {
                const element = document.querySelector(selector);
                const originalStyle = element.getAttribute('style');
                element.setAttribute('style', 'border: 2px solid red; border-style: dashed;');
                setTimeout(() => element.setAttribute('style', originalStyle || ''), 1000);
            }, selector);
            this.logger.info('Element highlighted successfully');
            await this.page.waitForTimeout(1000); // Wait for highlight to complete
        } catch (error) {
            this.logger.error('Failed to highlight element', { selector, error });
            throw error;
        }
    }

    async scrollToElement(selector) {
        try {
            this.logger.info(`Scrolling to element: ${selector}`);
            const element = await this.page.locator(selector);
            await element.scrollIntoViewIfNeeded();
            this.logger.info('Scrolled to element successfully');
        } catch (error) {
            this.logger.error('Failed to scroll to element', { selector, error });
            throw error;
        }
    }

    async sendkeyToElementByJS(selector, value) {
        try {
            this.logger.info(`Sending keys to element by JS: ${selector}, value: ${value}`);
            await this.page.evaluate((selector, value) => {
                document.querySelector(selector).value = value;
            }, selector, value);
            this.logger.info('Keys sent by JS successfully');
        } catch (error) {
            this.logger.error('Failed to send keys by JS', { selector, value, error });
            throw error;
        }
    }

    async removeAttributeInDOM(selector, attributeRemove) {
        try {
            this.logger.info(`Removing attribute "${attributeRemove}" from element: ${selector}`);
            await this.page.evaluate((selector, attr) => {
                document.querySelector(selector).removeAttribute(attr);
            }, selector, attributeRemove);
            this.logger.info('Attribute removed successfully');
        } catch (error) {
            this.logger.error('Failed to remove attribute', { selector, attributeRemove, error });
            throw error;
        }
    }

    async getElementValidationMessage(selector) {
        try {
            this.logger.info(`Getting validation message for element: ${selector}`);
            const message = await this.page.evaluate((selector) => {
                return document.querySelector(selector).validationMessage;
            }, selector);
            this.logger.info(`Validation message: ${message}`);
            return message;
        } catch (error) {
            this.logger.error('Failed to get validation message', { selector, error });
            throw error;
        }
    }

    async isImageLoaded(selector) {
        try {
            this.logger.info(`Checking if image is loaded: ${selector}`);
            const isLoaded = await this.page.evaluate((selector) => {
                const img = document.querySelector(selector);
                return img.complete && typeof img.naturalWidth !== 'undefined' && img.naturalWidth > 0;
            }, selector);
            this.logger.info(`Image loaded: ${isLoaded}`);
            return isLoaded;
        } catch (error) {
            this.logger.error('Failed to check if image is loaded', { selector, error });
            throw error;
        }
    }

    // Wait methods
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

    async waitForElementVisible(selector, options = {}) {
        try {
            this.logger.info(`Waiting for element visible: ${selector}`);
            await this.page.locator(selector).waitFor({ 
                state: 'visible', 
                timeout: options.timeout || DEFAULT_TIMEOUT 
            });
            this.logger.info('Element became visible');
        } catch (error) {
            this.logger.error('Failed to wait for element visibility', { selector, error });
            throw error;
        }
    }

    async waitForAllElementVisible(selector, options = {}) {
        try {
            this.logger.info(`Waiting for all elements visible: ${selector}`);
            await this.page.locator(selector).waitFor({ 
                state: 'visible', 
                timeout: options.timeout || DEFAULT_TIMEOUT 
            });
            this.logger.info('All elements became visible');
        } catch (error) {
            this.logger.error('Failed to wait for all elements visibility', { selector, error });
            throw error;
        }
    }

    async waitForElementInvisible(selector, options = {}) {
        try {
            this.logger.info(`Waiting for element invisible: ${selector}`);
            await this.page.locator(selector).waitFor({ 
                state: 'hidden', 
                timeout: options.timeout || constants.SHORT_TIMEOUT 
            });
            this.logger.info('Element became invisible');
        } catch (error) {
            this.logger.error('Failed to wait for element invisibility', { selector, error });
            throw error;
        }
    }

    async waitForElementClickable(selector, options = {}) {
        try {
            this.logger.info(`Waiting for element clickable: ${selector}`);
            await this.page.locator(selector).waitFor({ 
                state: 'visible', 
                timeout: options.timeout || DEFAULT_TIMEOUT 
            });
            // In Playwright, if element is visible, it's considered clickable
            this.logger.info('Element became clickable');
        } catch (error) {
            this.logger.error('Failed to wait for element to be clickable', { selector, error });
            throw error;
        }
    }

    async sleepInSecond(timeOutSecond) {
        try {
            this.logger.info(`Sleeping for ${timeOutSecond} seconds`);
            await this.page.waitForTimeout(timeOutSecond * 1000);
            this.logger.info('Sleep completed');
        } catch (error) {
            this.logger.error('Error during sleep', error);
            throw error;
        }
    }
    
    async handleUnexpectedAlert() {
        try {
            this.logger.info('Handling unexpected alert');
            // Set up dialog handler to automatically dismiss alerts
            this.page.on('dialog', async dialog => {
                await dialog.dismiss();
            });
            await this.sleepInSecond(2);
            this.logger.info('Unexpected alert handled');
        } catch (error) {
            this.logger.error('Error handling unexpected alert', error);
            // Intentionally not throwing error to match Java implementation
        }
    }
    
    async isDataStringSortedAscending(selector) {
        try {
            this.logger.info(`Checking if data is sorted ascending: ${selector}`);
            
            // Get all elements matching the selector
            const elements = await this.page.locator(selector).all();
            
            // Extract text from each element
            const names = [];
            for (const element of elements) {
                names.push(await element.textContent());
            }
            
            // Create a sorted copy of the names array
            const sortedNames = [...names].sort();
            
            // Compare the original array with the sorted one
            const isEqual = JSON.stringify(names) === JSON.stringify(sortedNames);
            this.logger.info(`Data is sorted ascending: ${isEqual}`);
            return isEqual;
        } catch (error) {
            this.logger.error('Failed to check if data is sorted ascending', { selector, error });
            throw error;
        }
    }
    
    async isDataStringSortedDescending(selector) {
        try {
            this.logger.info(`Checking if data is sorted descending: ${selector}`);
            
            // Get all elements matching the selector
            const elements = await this.page.locator(selector).all();
            
            // Extract text from each element
            const names = [];
            for (const element of elements) {
                names.push(await element.textContent());
            }
            
            // Create a sorted copy of the names array and reverse it
            const sortedNames = [...names].sort().reverse();
            
            // Compare the original array with the sorted and reversed one
            const isEqual = JSON.stringify(names) === JSON.stringify(sortedNames);
            this.logger.info(`Data is sorted descending: ${isEqual}`);
            return isEqual;
        } catch (error) {
            this.logger.error('Failed to check if data is sorted descending', { selector, error });
            throw error;
        }
    }
    
    async isDataFloatSortedAscending(selector) {
        try {
            this.logger.info(`Checking if float data is sorted ascending: ${selector}`);
            
            // Get all elements matching the selector
            const elements = await this.page.locator(selector).all();
            
            // Extract text from each element and parse as float
            const arrayList = [];
            for (const element of elements) {
                const text = await element.textContent();
                const value = parseFloat(text.replace('$', '').replace(',', '').trim());
                arrayList.push(value);
            }
            
            // Create a sorted copy of the array
            const sortedList = [...arrayList].sort((a, b) => a - b);
            
            // Compare the original array with the sorted one
            const isEqual = JSON.stringify(arrayList) === JSON.stringify(sortedList);
            this.logger.info(`Float data is sorted ascending: ${isEqual}`);
            return isEqual;
        } catch (error) {
            this.logger.error('Failed to check if float data is sorted ascending', { selector, error });
            throw error;
        }
    }
    
    async isDataFloatSortedDescending(selector) {
        try {
            this.logger.info(`Checking if float data is sorted descending: ${selector}`);
            
            // Get all elements matching the selector
            const elements = await this.page.locator(selector).all();
            
            // Extract text from each element and parse as float
            const arrayList = [];
            for (const element of elements) {
                const text = await element.textContent();
                const value = parseFloat(text.replace('$', '').replace(',', '').trim());
                arrayList.push(value);
            }
            
            // Create a sorted copy of the array and reverse it
            const sortedList = [...arrayList].sort((a, b) => a - b).reverse();
            
            // Compare the original array with the sorted and reversed one
            const isEqual = JSON.stringify(arrayList) === JSON.stringify(sortedList);
            this.logger.info(`Float data is sorted descending: ${isEqual}`);
            return isEqual;
        } catch (error) {
            this.logger.error('Failed to check if float data is sorted descending', { selector, error });
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
