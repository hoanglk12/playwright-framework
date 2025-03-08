class Wait {
    constructor(page) {
        if (!page) {
            throw new Error('Page object is required for Wait class');
        }
        this.page = page;
    }

    async forElement(locator, timeout = 10000) {
        await this.page.waitForSelector(locator, { state: 'visible', timeout });
    }

    async forElementToBeClickable(locator, timeout = 10000) {
        await this.page.waitForSelector(locator, { state: 'visible', timeout });
        const element = this.page.locator(locator);
        await element.waitFor({ state: 'attached' });
        return element;
    }

    async forFrame(frameName, timeout = 60000) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            try {
                await this.page.waitForSelector(`iframe[name="${frameName}"]`, { timeout: 5000 });
                const frame = this.page.frameLocator(`iframe[name="${frameName}"]`);
                if (frame) return frame;
            } catch (error) {
                if (Date.now() - startTime >= timeout) {
                    throw new Error(`Frame ${frameName} not found after ${timeout}ms`);
                }
                await this.page.waitForTimeout(1000);
            }
        }
        throw new Error(`Frame ${frameName} not found after ${timeout}ms`);
    }

    async forLoadState(state = 'networkidle', timeout = 60000) {
        try {
            await this.page.waitForLoadState(state, { timeout });
        } catch (error) {
            console.warn(`Wait for ${state} timed out: ${error.message}`);
        }
    }
    static async forElementAttached(page, locatorConfig, timeout = DEFAULT_TIMEOUT) {
        try {
          const { strategy, selector , iframes = [] } = locatorConfig;
          let context = page;
    
          // Handle nested iframes
          for (const frameSelector of iframes) {
            context = await this._waitForFrame(context, frameSelector, timeout);
          }
    
          // Handle different locator strategies
          switch (strategy.toLowerCase()) {
            case 'css':
              await context.waitForSelector(selector, { state: 'attached', timeout });
              return context.locator(selector);
    
            case 'xpath':
              await context.waitForSelector(`xpath=${selector}`, { state: 'attached', timeout });
              return context.locator(`xpath=${selector}`);
    
            case 'role':
              const roleLocator = context.getByRole(selector.type, { name: selector.value });
              await roleLocator.waitFor({ state: 'attached', timeout });
              return roleLocator;
    
            case 'text':
              const textLocator = context.getByText(selector.value, selector.options);
              await textLocator.waitFor({ state: 'attached', timeout });
              return textLocator;
    
            case 'placeholder':
              const placeholderLocator = context.getByPlaceholder(selector.value, selector.options);
              await placeholderLocator.waitFor({ state: 'attached', timeout });
              return placeholderLocator;
    
            case 'label':
              const labelLocator = context.getByLabel(selector.value, selector.options);
              await labelLocator.waitFor({ state: 'attached', timeout });
              return labelLocator;
    
            case 'testid':
              const testIdLocator = context.getByTestId(selector.value);
              await testIdLocator.waitFor({ state: 'attached', timeout });
              return testIdLocator;
    
            case 'nestedframewithrole':
              return this._handleNestedFrameWithRole(context, selector, timeout);
    
            default:
              throw new Error(`Unsupported strategy: ${strategy}`);
          }
        } catch (error) {
          throw new Error(`Element not found: ${JSON.stringify(locatorConfig)}\n${error.message}`);
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
        try {
          // Validate selector configuration
          if (!selector?.frameSelectors || !selector?.roleType || !selector?.roleName) {
            throw new Error(`Invalid selector configuration: ${JSON.stringify(selector)}`);
          }
    
          const { frameSelectors, roleType, roleName } = selector;
          let frameContext = context;
    
          // Navigate through nested frames
          for (const frameSelector of frameSelectors) {
            // Wait for the iframe to be attached
            await frameContext.waitForSelector(frameSelector, { state: 'attached', timeout });
            // Switch to the iframe
            frameContext = frameContext.frameLocator(frameSelector);
          }
    
          // Locate the element by role in the final frame
          const roleLocator = frameContext.getByRole(roleType, { name: roleName });
          await roleLocator.waitFor({ state: 'attached', timeout });
          return roleLocator;
        } catch (error) {
          console.error(`Failed to handle nested frame with role: ${error.message}`);
          throw error;
        }
      }
}

module.exports = Wait;
