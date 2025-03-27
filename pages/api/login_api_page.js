const BaseApiPage = require('./base_api_page');
const Constants = require('../../config/constants');

class LoginApiPage extends BaseApiPage {
constructor() {
  super();
  this.loginEndpoint = Constants.ENDPOINTS.LOGIN;
}

async login(email, password) {
  try {
    const response = await this.handleApiCall('POST', this.loginEndpoint, {
      email,
      password
    });

    // Validate login response
    this.validateResponseStatus(response);

    // Optional: Set auth token if login successful
    if (response.data.token) {
      this.apiHelper.setAuthHeader(response.data.token);
    }

    return response.data;
  } catch (error) {
    console.error('Login API Error', error);
    throw error;
  }
}

async logout() {
  // Clear authentication header
  this.apiHelper.clearAuthHeader();
}
}

module.exports = LoginApiPage;