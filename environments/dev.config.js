require('dotenv').config({ path: '.env.dev' });
module.exports = {
    baseUrl: process.env.CMS_URL,
    users: {
      validUser: {
        username: process.env.VALID_USERNAME,
        password: process.env.VALID_PASSWORD,
      },
    },
    liveSiteUrl: process.env.LIVE_URL,
    figmaUrl: process.env.TEST_FIGMA_URL,
    insightsPageUrl: 'https://ff-fieldfishercom-qa-web-ekfefjdmh6dbg3f7.uksouth-01.azurewebsites.net/en/insights',
    articleLiveUrl: 'https://ff-fieldfishercom-qa-web-ekfefjdmh6dbg3f7.uksouth-01.azurewebsites.net/en/insights/evaluating-online-safety-measures-ofcom-s-economic-discussion-papers-10-and-11',
    peopleListingPageUrl: 'https://ff-fieldfishercom-qa-web-ekfefjdmh6dbg3f7.uksouth-01.azurewebsites.net/en/people',
    baseApiUrl: 'https://reqres.in/api',
    environment: 'development',
    timeout: 10000,
    retry: 1,
    debug: true
};