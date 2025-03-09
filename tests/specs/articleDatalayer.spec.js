import { test, expect } from '@playwright/test';
const ArticlePage = require ('../../pages/articlePage');
import articleDataLayerData from '../../utils/articleDataLayer-data.json';


test('Validate article datalayer vs CMS primary category', async ({ page }) => {
  // Initialize Page Objects
  const articlePage = new ArticlePage(page);

    // Step 1: Article Page Operations
  await articlePage.navigate(articleDataLayerData.article.liveURL);
  const articleTitle = await articlePage.getArticleTitle();
  console.log(`Article Title: ${articleTitle}`);
  const practiceArea = await articlePage.extractPracticeArea();
  console.log(`Practice Area: ${practiceArea}`);
 
});