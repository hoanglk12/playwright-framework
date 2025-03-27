const { test, expect } = require('@playwright/test');
const LoginApiPage = require('../../pages/api/login_api_page');
const loginApiData = require('../../utils/login-data.json');

test.describe('Login API Tests', () => {
let loginApiPage;

test.beforeEach(() => {
  loginApiPage = new LoginApiPage();
});

test('Successful Login with Valid Credentials', async () => {
  const { credentials } = loginApiData;
  
  const loginResponse = await loginApiPage.login(
    credentials.validUser.email, 
    credentials.validUser.password
  );

  // Assertions
  expect(loginResponse).toHaveProperty('token');
  expect(loginResponse.token).toBeTruthy();
});

test('Failed Login with Invalid Credentials', async () => {
  const invalidCredentials = {
    email: 'invalid@example.com',
    password: 'wrongpassword'
  };

  await expect(
    loginApiPage.login(
      invalidCredentials.email, 
      invalidCredentials.password
    )
  ).rejects.toThrow();
});

test('Logout Functionality', async () => {
  // Perform login first
  const { credentials } = DevConfig;
  await loginApiPage.login(
    credentials.validUser.email, 
    credentials.validUser.password
  );

  // Logout
  await loginApiPage.logout();
  // Add additional assertions if needed
});
});