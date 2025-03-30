const ApiHelper = require('../../utils/api.helper');
//const Constants = require('../../config/constants');
const devConfig = require('../../environments/dev.config');

class BaseApi {
constructor(baseApiUrl = devConfig.baseApiUrl) {
  this.apiHelper = new ApiHelper(baseApiUrl);
}

async handleApiCall(method, endpoint, data = null, config = {}) {
  try {
    switch(method.toLowerCase()) {
      case 'get':
        return await this.apiHelper.get(endpoint, config);
      case 'post':
        return await this.apiHelper.post(endpoint, data, config);
      case 'put':
        return await this.apiHelper.put(endpoint, data, config);
      case 'patch':
        return await this.apiHelper.put(endpoint, data, config);
      case 'delete':
        return await this.apiHelper.delete(endpoint, config);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  } catch (error) {
    console.error(`API Call Error: ${method} ${endpoint}`, error.response?.data);
    throw error;
  }
}

validateResponse(response, expectedStatus = 200) {
  if (response.status !== expectedStatus) {
    throw new Error(`Unexpected status code. Expected ${expectedStatus}, got ${response.status}`);
  }
  return response.data;
}
}

module.exports = BaseApi;