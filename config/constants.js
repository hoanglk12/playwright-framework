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
    
    ENDPOINTS: {
      LOGIN: '/login',
      USERS: '/users',
      REGISTER: '/register',
      DELETE: '/users',
    },
    TEST_DATA: {
      VALID_LOGIN: {
        email: 'eve.holt@reqres.in',
        password: 'cityslicka'
      },
      INVALID_LOGIN: {
        email: 'invalid@reqres.in',
        password: ''
      }
    },
    // ERROR_MESSAGES: {
    //   UNAUTHORIZED: 'Missing credentials',
    //   NOT_FOUND: 'User not found'
    // }
    
  };