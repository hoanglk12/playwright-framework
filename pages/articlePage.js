const winston = require('winston');
const BasePage = require('./basePage');
const articleLocators = require('../locators/articleLocators');
const Wait = require('../utils/Wait');
const constants = require('../config/constants');

// Logger configuration similar to cmsAdminPage.js
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.simple()
        }),
        new winston.transports.File({ 
            filename: 'logs/article-page.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

class ArticlePage extends BasePage {
    constructor(page) {
        super(page);
        this.wait = new Wait(page);
        logger.info('ArticlePage initialized');
    }

    /**
     * Utility method to safely execute actions with logging
     */
    async safeExecute(methodName, action) {
        try {
            logger.info(`Executing method: ${methodName}`);
            return await action();
        } catch (error) {
            logger.error(`Error in ${methodName}`, { 
                error: error.message,
                stack: error.stack 
            });
            throw error;
        }
    }

    /**
     * Get the article title
     * @returns {Promise<string>} The trimmed article title
     */
    async getArticleTitle() {
        return this.safeExecute('getArticleTitle', async () => {
            // Wait for page to be idle
            await this.wait.forLoadState('networkidle', constants.LONG_TIMEOUT);
            
            // Extract article title
            const articleTitle = (await this.page.locator(articleLocators.articleTitle.selector).textContent()).trim();
            
            logger.info('Article title retrieved', { 
                title: this.maskSensitiveInfo(articleTitle),
                length: articleTitle.length 
            });
            
            return articleTitle;
        });
    }

    /**
     * Extract practice area from dataLayer
     * @returns {Promise<string|null>} Practice area or null
     */
    async extractPracticeArea() {
        return this.safeExecute('extractPracticeArea', async () => {
            // Wait for page to be idle
            await this.wait.forLoadState('networkidle', constants.LONG_TIMEOUT);
            
            // Get page content
            const html = await this.page.content();
            
            // Regex to find dataLayer.push
            const regex = /window\.dataLayer\.push\(\s*(\{[^}]*\})\s*\);/s;
            const match = html.match(regex);
            
            if (match && match[1]) {
                try {
                    // Convert single quotes to double quotes for valid JSON format
                    const jsonString = match[1].replace(/'/g, '"');
                    
                    // Parse the matched JSON string
                    const dataLayerObject = JSON.parse(jsonString);
                    
                    // Retrieve the practiceArea value
                    const practiceArea = dataLayerObject.practiceArea || null;
                    
                    logger.info('Practice area extracted', { 
                        practiceArea,
                        hasValue: !!practiceArea 
                    });
                    
                    return practiceArea;
                } catch (parseError) {
                    logger.warn('Failed to parse dataLayer object', {
                        error: parseError.message,
                        rawMatch: match[1]
                    });
                    return null;
                }
            } else {
                logger.warn('No dataLayer.push found in page content');
                return null;
            }
        });
    }

    /**
     * Mask sensitive information for logging
     * @param {string} info - Information to mask
     * @returns {string} Masked information
     */
    maskSensitiveInfo(info) {
        if (!info) return info;
        // If info is longer than 8 characters, mask middle characters
        if (info.length > 8) {
            return info.substring(0, 4) + '*'.repeat(info.length - 8) + info.slice(-4);
        }
        // For shorter strings, just mask all but first and last characters
        return info.substring(0, 1) + '*'.repeat(info.length - 2) + info.slice(-1);
    }
}

module.exports = ArticlePage;
