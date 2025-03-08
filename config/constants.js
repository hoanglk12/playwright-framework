// config/constants.js
module.exports = {
    // Timeouts
    DEFAULT_TIMEOUT: 30000, // 30 seconds
    SHORT_TIMEOUT: 10000,   // 10 seconds
    LONG_TIMEOUT: 60000,    // 60 seconds
  
    // Retries
    DEFAULT_RETRIES: 3,
  
    // Environment-specific values
    BASE_URL: process.env.BASE_URL || 'https://example.com',
  
    // Browser settings
    BROWSER: process.env.BROWSER || 'chromium', // chromium, firefox, webkit
    HEADLESS: process.env.HEADLESS !== 'false', // true by default
  
    // Test data
    DEFAULT_USER: {
      username: 'testuser',
      password: 'testpassword123'
    }
  };