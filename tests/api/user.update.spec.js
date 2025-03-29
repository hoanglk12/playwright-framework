const { test, expect } = require('@playwright/test');
const UserApi = require('../../pages/api/user.api');
const AuthApi = require('../../pages/api/auth.api');
const DataGenerator = require('../../utils/data.generator');
const Constants = require('../../config/constants');
const AuthHelper = require('../../utils/auth.helper');

test.describe('User Update API Tests', () => {
    let userApi;
    let authApi;
    let authToken;

    test.beforeAll(async () => {
        userApi = new UserApi();
        authApi = new AuthApi();
        
        // Check if we need to get a new token
        if (!AuthHelper.hasValidToken()) {
            const loginResponse = await authApi.login(Constants.TEST_DATA.VALID_LOGIN);
            
            // Verify login response and store token
            expect(loginResponse.status).toBe(200);
            expect(loginResponse).toHaveProperty('token');
            
            // Store token using AuthHelper
            AuthHelper.setToken(loginResponse.token);
        }

        // Retrieve token for tests
        authToken = AuthHelper.getToken();
        expect(authToken).toBeTruthy();
    });

    test('Update Existing User Successfully', async () => {
        const userId = 2; // Example user ID
        const updatedUserData = DataGenerator.generateUser();

        const updateResponse = await userApi.updateUser(userId, updatedUserData, {
            Authorization: `Bearer ${authToken}`
        });
        
        // Assertions
        expect(updateResponse.status).toBe(200);
        expect(updateResponse.data).toHaveProperty('name', updatedUserData.name);
        expect(updateResponse.data).toHaveProperty('job', updatedUserData.job);
        expect(updateResponse.data).toHaveProperty('updatedAt');
    });

    test('Create New User', async () => {
        const newUserData = DataGenerator.generateLoginCredentials();

        const createResponse = await userApi.createUser(newUserData, {
            Authorization: `Bearer ${authToken}`
        });
        
        // Assertions
        expect(createResponse.status).toBe(201);
        expect(createResponse.data).toHaveProperty('email', newUserData.email);
        expect(createResponse.data).toHaveProperty('password', newUserData.password);
        expect(createResponse.data).toHaveProperty('id');
        expect(createResponse.data).toHaveProperty('createdAt');
    });

    test('Update User with Invalid Data', async () => {
        const userId = 2;
        const invalidUserData = {
            name: '', // Empty name
            job: null // Null job
        };

        try {
            await userApi.updateUser(userId, invalidUserData, {
                Authorization: `Bearer ${authToken}`
            });
        } catch (error) {
            // Assertions for validation errors
            expect(error.response).toBeDefined();
            expect([404, 422]).toContain(error.response.status);
        }
    });
});
