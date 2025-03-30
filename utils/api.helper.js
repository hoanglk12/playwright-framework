const axios = require('axios');
const fs = require('fs');
const path = require('path');

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
      this.logRequest(config);
      return config;
    },
    error => Promise.reject(error)
  );

  // Response Interceptor
  this.client.interceptors.response.use(
    response => {
      this.logResponse(response);
      return response;
    },
    error => Promise.reject(error)
  );
}

logRequest(config) {
  const logPath = path.resolve(__dirname, '../../logs/api-requests.log');
  const logEntry = `[${new Date().toISOString()}] ${config.method.toUpperCase()} ${config.url}\n` +
    `Headers: ${JSON.stringify(config.headers)}\n` +
    `Body: ${JSON.stringify(config.data)}\n\n`;
  
  fs.appendFileSync(logPath, logEntry);
}

logResponse(response) {
  const logPath = path.resolve(__dirname, '../../logs/api-responses.log');
  const logEntry = `[${new Date().toISOString()}] ${response.status} ${response.config.url}\n` +
    `Body: ${JSON.stringify(response.data)}\n\n`;
  
  fs.appendFileSync(logPath, logEntry);
}

async get(url, config = {}) {
  return this.client.get(url, config);
}

async post(url, data, config = {}) {
  return this.client.post(url, data, config);
}

async put(url, data, config = {}) {
  return this.client.put(url, data, config);
}

async patch(url, data, config = {}) {
  return this.client.patch(url, data, config);
}

async delete(url, config = {}) {
  return this.client.delete(url, config);
}

setAuthHeader(token) {
  this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

clearAuthHeader() {
  delete this.client.defaults.headers.common['Authorization'];
}
}

module.exports = ApiHelper;