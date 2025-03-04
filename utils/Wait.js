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
}

module.exports = Wait;
