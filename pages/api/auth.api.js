const axios = require('axios');
const Constants = require('../../config/constants');
const devConfig = require('../../environments/dev.config');

class AuthApi {
  constructor() {
    this.baseApiUrl = devConfig.baseApiUrl;
    this.loginEndpoint = `${this.baseApiUrl}${Constants.ENDPOINTS.LOGIN}`;
  }

  async login(credentials) {
    try {
      // Validate input
      if (!credentials.email) {
        throw new Error('Email is required');
      }
      
      if (!credentials.password) {
        const error = new Error('Missing password');
        error.response = {
          status: 400,
          data: { error: 'Missing password' }
        };
        throw error;
      }

      // Perform login request
      const response = await axios.post(this.loginEndpoint, {
        email: credentials.email,
        password: credentials.password
      }, {
        // Capture full response including status
        validateStatus: function (status) {
          return status >= 200 && status < 300; // Default
        }
      });

      // Attach status to the response data
      response.data.status = response.status;

      return response.data;
    } catch (error) {
      // Enhanced error handling
      if (error.response) {
        // Server responded with an error
        const customError = new Error(`Login failed: ${error.response.data.error || 'Unknown error'}`);
        customError.response = error.response;
        throw customError;
      } else if (error.request) {
        // Request made but no response received
        throw new Error('No response received from server');
      } else {
        // Error in setting up the request
        throw error;
      }
    }
  }
}

module.exports = AuthApi;
