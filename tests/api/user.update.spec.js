const { test, expect } = require('@playwright/test');
const UserApi = require('../../pages/api/user.api');
const AuthApi = require('../../pages/api/auth.api');
const DataGenerator = require('../../utils/data.generator');
const Constants = require('../../config/constants');

test.describe('User Update API Tests', () => {
let userApi;
let authApi;

test.beforeEach(async () => {
  userApi = new UserApi();
  authApi = new AuthApi();
  
  // Login to get authentication token
  await authApi.login(Constants.TEST_DATA.VALID_LOGIN);
});

test('Update Existing User Successfully', async () => {
  const userId = 2; // Example user ID
  const updatedUserData = DataGenerator.generateUser();

  const updateResponse = await userApi.updateUser(userId, updatedUserData);
  
  expect(updateResponse).toHaveProperty('name', updatedUserData.name);
  expect(updateResponse).toHaveProperty('job', updatedUserData.job);
  expect(updateResponse).toHaveProperty('updatedAt');
});

test('Create New User', async () => {
  const newUserData = DataGenerator.generateUser();

  const createResponse = await userApi.createUser(newUserData);
  
  expect(createResponse).toHaveProperty('name', newUserData.name);
  expect(createResponse).toHaveProperty('job', newUserData.job);
  expect(createResponse).toHaveProperty('id');
  expect(createResponse).toHaveProperty('createdAt');
});
});