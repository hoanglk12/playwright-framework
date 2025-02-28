const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/loginPage');

test.describe('Login Tests', () => {
  let page;
  let loginPage;
 

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    loginPage = new LoginPage(page);
    await loginPage.navigate('https://ff-fieldfishercom-qa-cms-a4axd5cbatb7g4eu.uksouth-01.azurewebsites.net/CMSPages/logon.aspx');
  });

  test('Successful login', async () => {
    await loginPage.enterUsername('validUser');
    await loginPage.enterPassword('validPass');
    await loginPage.clickLogin();
    await loginPage.verifyWelcomeMessageDisplayed();
  });

 });