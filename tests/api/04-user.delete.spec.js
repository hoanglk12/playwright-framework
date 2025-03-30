const { test, expect } = require('@playwright/test');
const UserApi = require('../../pages/api/user.api');
const AuthApi = require('../../pages/api/auth.api');
const Constants = require('../../config/constants');
const AuthHelper = require('../../utils/auth.helper');
const Logger = require('../../utils/logger');

test.describe('User Delete API Tests', () => {
    let userApi, authApi, authToken, logger;
    let userIdFromUpdateSpec; // Variable to store user ID from update spec

    test.beforeAll(async () => {
        userApi = new UserApi();
        authApi = new AuthApi();
        logger = Logger || console;

        // Retrieve user ID from update spec
        userIdFromUpdateSpec = Number(global.createdUserId); // Assuming you set this in update spec
        console.log(`User ID from update spec: ${userIdFromUpdateSpec}`);
        // Check if we need to get a new token
        if (!AuthHelper.hasValidToken()) {
            const loginResponse = await authApi.login(Constants.TEST_DATA.VALID_LOGIN);
            
            expect(loginResponse.status).toBe(200);
            expect(loginResponse).toHaveProperty('token');
            
            AuthHelper.setToken(loginResponse.token);
        }

        // Retrieve token for tests
        authToken = AuthHelper.getToken();
        expect(authToken).toBeTruthy();

     
    });

    test('Delete Recently Created User Successfully', async () => {
        try {
            const deleteResponse = await userApi.deleteUser(userIdFromUpdateSpec, {
                Authorization: `Bearer ${authToken}`
            });
            
            // Assertions
            //expect(deleteResponse.status).toBeOneOf([200, 204]);
            expect([200, 204]).toContain(deleteResponse.status);
            logger.info(`Successfully deleted user with ID: ${userIdFromUpdateSpec}`);

            // Optional: Verify user no longer exists
            try {
                await userApi.getUser(userIdFromUpdateSpec);
                throw new Error('User should not exist after deletion');
            } catch (error) {
                expect([404, 400]).toContain(error.response?.status);
            }
        } catch (error) {
            logger.error(`Delete user failed: ${error.message}`);
            throw error;
        }
    });

    // test('Attempt to Delete Already Deleted User', async () => {
    //     try {
    //         await userApi.deleteUser(userIdFromUpdateSpec, {
    //             Authorization: `Bearer ${authToken}`
    //         });
            
    //         throw new Error('Delete should have failed for already deleted user');
    //     } catch (error) {
    //         expect(error.response).toBeDefined();
    //         expect([404, 400]).toContain(error.response.status);
    //         logger.info(`Correctly handled deletion of already deleted user`);
    //     }
    // });

    // test('Delete User with Invalid Authorization', async () => {
    //     const invalidToken = 'invalid_token_123';

    //     try {
    //         await userApi.deleteUser(userIdFromUpdateSpec, {
    //             Authorization: `Bearer ${invalidToken}`
    //         });
            
    //         throw new Error('Delete should have failed with invalid token');
    //     } catch (error) {
    //         expect(error.response).toBeDefined();
    //         expect([401, 403]).toContain(error.response.status);
    //         logger.info(`Correctly handled unauthorized delete attempt`);
    //     }
    // });
});
