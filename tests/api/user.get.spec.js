const { test, expect } = require('@playwright/test');
const UserApi = require('../../pages/api/user.api');
const AuthHelper = require('../../utils/auth.helper');

test.describe('User Get API Tests', () => {
    let userApi;
    let authToken;

    test.beforeAll(async () => {
        userApi = new UserApi();
        
        // Retrieve token
        authToken = AuthHelper.getToken();
        
        // Validate token exists
        if (!authToken) {
            throw new Error('Authentication token not found. Ensure login test runs first.');
        }
    });

    test('Get Existing User Details', async () => {
        const userId = 2; // Example user ID
        
        try {
            const userResponse = await userApi.getUser(userId, {
                Authorization: `Bearer ${authToken}`
            });

            // Assertions
            expect(userResponse.status).toBe(200);
            
            const userData = userResponse.data;
            expect(userData).toHaveProperty('id', userId);
            expect(userData).toHaveProperty('email');
            expect(userData).toHaveProperty('first_name');
            expect(userData).toHaveProperty('last_name');
            expect(userData).toHaveProperty('avatar');
        } catch (error) {
            console.error('User details fetch failed:', error);
            throw error;
        }
    });

    test('Get Non-Existent User', async () => {
        const nonExistentUserId = 9999;

        try {
            await userApi.getUser(nonExistentUserId, {
                Authorization: `Bearer ${authToken}`
            });
        } catch (error) {
            // Assertions for non-existent user
            expect(error.response).toBeDefined();
            expect(error.response.status).toBe(404);
        }
    });
});
