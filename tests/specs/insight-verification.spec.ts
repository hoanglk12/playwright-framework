import { test, expect } from '@playwright/test';
import CMSAdminPage from '../../pages/cmsAdminPage';
import InsightsPage from '../../pages/insightsPage';


test('Verify articles per page on live site as per CMS configuration', async ({ page }) => {
    const cmsAdmin = new CMSAdminPage(page);
    const insightsPage = new InsightsPage(page);

    // Step 1: CMS Admin Operations
    await cmsAdmin.navigateToCMSAdmin();
    await cmsAdmin.clickApplicationListIcon();
    await cmsAdmin.enterToSearchBox();
    await cmsAdmin.clickInsightsCMSPage(); 
    await cmsAdmin.clickContentTab();
    const itemsPerPage = await cmsAdmin.getItemsPerPageValue();
    console.log(`CMS Configuration - Items Per Page: ${itemsPerPage}`);

    // Step 2 & 3: Insights Page Verification
    await insightsPage.navigateToInsightsPage();
    const visibleArticles = await insightsPage.countVisibleArticles();
    
    expect(visibleArticles).toBe(Number(itemsPerPage));
    console.log(`Visible Lawyers: ${visibleArticles}/18`);

});