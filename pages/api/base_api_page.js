const ApiHelper = require('../../utils/api_helper');
const Constants = require('../../config/constants');

class BaseApiPage {
constructor(baseUrl = Constants.BASE_URL) {
  this.apiHelper = new ApiHelper(baseUrl);
}

// Common methods for all API pages
async handleApiCall(method, endpoint, data = null, config = {}) {
  try {
    switch(method.toLowerCase()) {
      case 'get':
        return await this.apiHelper.get(endpoint, config);
      case 'post':
        return await this.apiHelper.post(endpoint, data, config);
      case 'put':
        return await this.apiHelper.put(endpoint, data, config);
      case 'delete':
        return await this.apiHelper.delete(endpoint, config);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  } catch (error) {
    console.error(`API Call Error: ${method} ${endpoint}`, error);
    throw error;
  }
}

// Validate response status
validateResponseStatus(response, expectedStatus = 200) {
  if (response.status !== expectedStatus) {
    throw new Error(`Unexpected status code. Expected ${expectedStatus}, got ${response.status}`);
  }
}
}

module.exports = BaseApiPage;