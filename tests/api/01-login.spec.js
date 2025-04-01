const { test, expect } = require('@playwright/test');
const AuthApi = require('../../pages/api/auth.api');
const Constants = require('../../config/constants');
const AuthHelper = require('../../utils/auth.helper');

test.describe('Authentication Flow', { tag: ['@apiTests'] }, () => {
    let authApi;

    test.beforeAll(async () => {
        authApi = new AuthApi();
        
        // Only clear token if it doesn't exist or is invalid
        if (!AuthHelper.hasValidToken()) {
            const loginResponse = await authApi.login(Constants.TEST_DATA.VALID_LOGIN);
            
            // Verify status code
            expect(loginResponse.status).toBe(200);
            
            // Verify token exists
            expect(loginResponse).toHaveProperty('token');
            expect(loginResponse.token).toBeTruthy();
            expect(typeof loginResponse.token).toBe('string');
            
            // Store token using AuthHelper
            AuthHelper.setToken(loginResponse.token);
        }
    });

    test('Verify Token Exists',  async () => {
        const token = AuthHelper.getToken();
        expect(token).toBeTruthy();
    });
});
