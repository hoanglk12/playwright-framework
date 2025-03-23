const constants = require('../config/constants');
const peopleLocators = require('../locators/peopleLocators');
const Wait = require('../utils/Wait');
const BasePage = require('./basePage');
require('dotenv').config();
const env = process.env.TEST_ENV || 'dev'; // Default to 'dev' if not specified
const envConfig = require(`../environments/${env}.config.js`);

class PeoplePage extends BasePage {
    constructor(page) {
        super(page);
        this.basePage = new BasePage(page);
        this.wait = new Wait(page);
    }

    /**
     * Navigate to the people page
     * @returns {PeoplePage} - For method chaining (Fluent Interface Pattern)
     */
    async navigateToPeoplePage() {
        await this.basePage.navigate('https://ff-fieldfishercom-qa-web-ekfefjdmh6dbg3f7.uksouth-01.azurewebsites.net/en/people');
        await this.wait.forLoadState('domcontentloaded', constants.LONG_TIMEOUT);
        return this;
    }

    /**
     * Click on a random profile card
     * @returns {Promise<string>} The name of the clicked profile
     */
    async clickRandomProfileCard() {
        await this.page.waitForSelector(peopleLocators.profileName.selector, { state: 'visible' });
        const profileNames = await this.page.$$(peopleLocators.profileName.selector);
        
        if (profileNames.length === 0) {
            throw new Error('No profile cards found on the page');
        }
        
        // Select a random profile card
        const randomIndex = Math.floor(Math.random() * profileNames.length);
        const selectedCard = profileNames[randomIndex];
        
        // Get the name before clicking
        const nameElement = await selectedCard.$(peopleLocators.profileName.selector);
        const profileName = await nameElement.textContent();
        
        // Click the card
        await selectedCard.click();
        await this.wait.forLoadState('domcontentloaded', constants.LONG_TIMEOUT);
        
        return profileName;
    }

    /**
     * Check if profile banner image has lazy loading
     * @returns {Promise<{hasLazyLoading: boolean, loadingAttribute: string|null}>}
     */
    async checkProfileBannerImageLazyLoading() {
        await this.page.waitForSelector(peopleLocators.profileBannerImage.selector, { state: 'visible' });
        const bannerImage = await this.page.$(peopleLocators.profileBannerImage.selector);
        const loadingAttribute = await bannerImage.getAttribute('loading');
        
        return {
            hasLazyLoading: loadingAttribute === 'lazy',
            loadingAttribute: loadingAttribute
        };
    }
}

module.exports = PeoplePage;