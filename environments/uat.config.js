require('dotenv').config({ path: '.env.uat' });
module.exports = {
    baseUrl: process.env.CMS_URL,
    users: {
      validUser: {
        username: process.env.VALID_USERNAME,
        password: process.env.VALID_PASSWORD,
      },
    },
    liveSiteUrl: process.env.LIVE_URL,
    insightsPageUrl: 'https://ff-fieldfishercom-uat-web.fieldfisher.com/en/insights',
    articleLiveUrl: 'https://ff-fieldfishercom-uat-web.fieldfisher.com/en/insights/exploring-the-future-of-aviation-automation-with-simon-meakins'
  };