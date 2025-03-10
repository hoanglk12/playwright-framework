import { test, expect } from '@playwright/test';
const ArticlePage = require ('../../pages/articlePage');
import articleDataLayerData from '../../utils/articleDataLayer-data.json';
import cmsLocators from '../../locators/cmsAdminLocators';
import constants from '../../config/constants';
const BasePage = require('../../pages/basePage');
const CMSAdminPage = require('../../pages/cmsAdminPage');
const Wait = require('../../utils/Wait');

let basePage;
test.beforeEach(async ({ page }) => {
  basePage = new BasePage(page); // Initialize BasePage
});

test.afterEach(async ({}, testInfo) => {
  await basePage.closeBrowserOnFailure(testInfo); // Call closeBrowserOnFailure after each test
});

test('Validate article datalayer vs CMS primary category', async ({ page }) => {
  // Initialize Page Objects
  const articlePage = new ArticlePage(page);
  const cmsAdminPage = new CMSAdminPage(page);
  const wait = new Wait(page);

    // Step 1: Article Page Operations
  await articlePage.navigate(articleDataLayerData.article.liveURL);
  const articleTitle = await articlePage.getArticleTitle();
  console.log(`Article Title: ${articleTitle}`);
  const practiceArea = await articlePage.extractPracticeArea();
  console.log(`Practice Area: ${practiceArea}`);

  //Step 2: Find the article from step 1 in CMS
  await cmsAdminPage.navigateToCMSAdmin();
  await cmsAdminPage.clickApplicationListIcon();
  await basePage.waitForElementFocused(cmsLocators.searchTextBox);
  await basePage.fillElement(cmsLocators.searchTextBox, articleDataLayerData.seachTextPageTypes);
  await basePage.pressKey('Enter');
  await wait.forLoadState('networkidle', constants.LONG_TIMEOUT); 
  //await basePage.clickElement(cmsLocators.pageTab);
  //await wait.forLoadState('networkidle', constants.DEFAULT_TIMEOUT); 
});