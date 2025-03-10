// playwright-framework/global-setup.js
const { clearAllureResults } = require('./utils/helpers');

module.exports = async () => {
  console.log('Running global setup: Cleaning Allure results directory...');
  clearAllureResults();
};