import { test, expect } from '@playwright/test';
const ArticlePage = require ('../../pages/articlePage');
import articleDataLayerData from '../../utils/articleDataLayer-data.json';
import cmsLocators from '../../locators/cmsAdminLocators';
import constants from '../../config/constants';
const BasePage = require('../../pages/basePage');
const CMSAdminPage = require('../../pages/cmsAdminPage');
const Wait = require('../../utils/Wait');
const env = process.env.TEST_ENV ||  'dev';
const envConfig = require(`../../environments/${env}.config.js`);

let basePage;

test.beforeEach(async ({ page }) => {
  basePage = new BasePage(page); // Initialize BasePage
});

test.afterEach(async ({}, testInfo) => {
  await basePage.closeBrowserOnFailure(testInfo); // Call closeBrowserOnFailure after each test
});

test('Validate article datalayer vs CMS primary category', async ({ page }) => {
  // Initialize Page Objects
  const articlePage = new ArticlePage(page, envConfig);
  const cmsAdminPage = new CMSAdminPage(page,  envConfig);
  const wait = new Wait(page);

    // Step 1: Article Page Operations
  await articlePage.navigate(envConfig.articleLiveUrl);
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

  //Step 3: Edit the article page and expand the email subscription
  await cmsAdminPage.editArticlePage(articleTitle);
  await cmsAdminPage.expandEmailSubscription();
  await wait.forLoadState('domcontentloaded', constants.LONG_TIMEOUT); 

  //Step 4: Get the extracted primary category value from CMS
  const primaryCategoryValue = await page.locator('iframe[name="cmsdesktop"]').contentFrame().locator('iframe[name="contentview"]').contentFrame().locator('iframe[name="c"]').contentFrame().getByRole(cmsLocators.contentTab_PrimaryCategory.selector.roleType, { name: cmsLocators.contentTab_PrimaryCategory.selector.roleName }).inputValue();
  await wait.forLoadState('domcontentloaded', constants.LONG_TIMEOUT);
  console.log('Primary Category With Path From CMS: ', primaryCategoryValue);
  const pattern = /^[^(]+/;
  const extractedPrimaryCategory = primaryCategoryValue.match(pattern)[0].trim();
  console.log(`Extracted Primary Category: ${extractedPrimaryCategory}`);

          
  //Step 5: Verify the extracted primary category value from CMS matches the practice area value from the article datalayer
  expect(extractedPrimaryCategory).toBe(practiceArea);
});