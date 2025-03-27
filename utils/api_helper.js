const axios = require('axios');
const logger = require('./logger');

class ApiHelper {
constructor(baseURL, config = {}) {
  this.client = axios.create({
    baseURL,
    timeout: config.timeout || 5000,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers
    }
  });

  // Request Interceptor
  this.client.interceptors.request.use(
    config => {
      logger.info(`[API Request] ${config.method.toUpperCase()} ${config.url}`, {
        data: config.data,
        headers: config.headers
      });
      return config;
    },
    error => {
      logger.error('Request Interceptor Error', error);
      return Promise.reject(error);
    }
  );

  // Response Interceptor
  this.client.interceptors.response.use(
    response => {
      logger.info(`[API Response] ${response.status}`, {
        data: response.data
      });
      return response;
    },
    error => {
      logger.error('Response Interceptor Error', {
        status: error.response?.status,
        data: error.response?.data
      });
      return Promise.reject(error);
    }
  );
}

// Generic HTTP Methods
async get(url, config = {}) {
  return this.client.get(url, config);
}

async post(url, data, config = {}) {
  return this.client.post(url, data, config);
}

async put(url, data, config = {}) {
  return this.client.put(url, data, config);
}

async delete(url, config = {}) {
  return this.client.delete(url, config);
}

// Authentication Helpers
setAuthHeader(token) {
  this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

clearAuthHeader() {
  delete this.client.defaults.headers.common['Authorization'];
}
}

module.exports = ApiHelper;