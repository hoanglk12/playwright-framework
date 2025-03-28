const { test, expect } = require('@playwright/test');
const AuthApi = require('../../pages/api/auth.api');
const Constants = require('../../config/constants');
const AuthHelper = require('../../utils/auth.helper');

test.describe('Authentication Flow', () => {
  let authApi;

  test.beforeEach(() => {
      authApi = new AuthApi();
      // Clear any existing token before each test
      AuthHelper.clearToken();
  });

  

  test('Successful Login with Valid Credentials', async () => {
    try {
      const loginResponse = await authApi.login(Constants.TEST_DATA.VALID_LOGIN);
      
      // Assertion 1: Verify status code is 200
      expect(loginResponse.status).toBe(200);
      
      // Assertion 2: Verify token is received and stored
      expect(loginResponse).toHaveProperty('token');
      expect(loginResponse.token).toBeTruthy();
      expect(typeof loginResponse.token).toBe('string');
      
       
            // Store token using AuthHelper
            AuthHelper.setToken(loginResponse.token);
        } catch (error) {
            console.error('Login test failed:', error);
            throw error;
        }
    });

  test('Failed Login with Invalid Credentials', async () => {
    try {
      // Test login with missing password
      const invalidCredentials = {
        email: Constants.TEST_DATA.VALID_LOGIN.email,
        password: '' // Intentionally empty password
      };

      await expect(authApi.login(invalidCredentials)).rejects.toThrow();
    } catch (error) {
      // Verify error details
      expect(error.message).toContain('Missing password');
      
      // If the API provides a response object, additional assertions can be made
      if (error.response) {
        // Assertion 1: Verify status code is 400
        expect(error.response.status).toBe(400);
        
        // Assertion 2: Verify error message
        expect(error.response.data.error).toBe('Missing password');
      }
    }
  });
});
