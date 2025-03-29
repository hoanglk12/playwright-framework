const axios = require('axios');
const devConfig = require('../../environments/dev.config');
const Constants = require('../../config/constants');

class UserApi {
    constructor() {
        this.baseApiUrl = devConfig.baseApiUrl;
        this.userEndpoint = `${this.baseApiUrl}/users`;
    }

    async getUser(userId, headers = {}) {
        try {
            // Validate userId
            if (!userId || typeof userId !== 'number') {
                throw new Error('Invalid user ID');
            }

            // Perform GET request
            const response = await axios.get(`${this.userEndpoint}/${userId}`, {
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                },
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
                const customError = new Error(`User fetch failed: ${error.response.data.error || 'Unknown error'}`);
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
    async createUser(userData, headers = {}) {
        try {
            // Validate user data
            if (!userData || typeof userData !== 'object') {
                throw new Error('Invalid user data');
            }

            // Perform POST request to create user
            const response = await axios.post(this.userEndpoint, userData, {
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                },
                validateStatus: function (status) {
                    return status >= 200 && status < 300; // Default
                }
            });

            // Create a response object with status and data
            return {
                status: response.status,
                data: {
                    ...response.data,
                    status: response.status
                }
            };
        } catch (error) {
            // Enhanced error handling
            if (error.response) {
                // Server responded with an error
                const customError = new Error(`User creation failed: ${error.response.data.error || 'Unknown error'}`);
                customError.response = {
                    status: error.response.status,
                    data: error.response.data
                };
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
    async updateUser(userId, userData, headers = {}) {
        try {
            // Validate inputs
            if (!userId || typeof userId !== 'number') {
                throw new Error('Invalid user ID');
            }
    
            if (!userData || typeof userData !== 'object') {
                throw new Error('Invalid user data');
            }
    
            // Perform PUT request to update user
            const response = await axios.put(`${this.userEndpoint}/${userId}`, userData, {
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                },
                validateStatus: function (status) {
                    return status >= 200 && status < 300; // Default
                }
            });
    
            // Create a response object with status and data
            return {
                status: response.status,
                data: {
                    ...response.data,
                    status: response.status
                }
            };
        } catch (error) {
            // Enhanced error handling
            if (error.response) {
                // Server responded with an error
                const customError = new Error(`User update failed: ${error.response.data.error || 'Unknown error'}`);
                customError.response = {
                    status: error.response.status,
                    data: error.response.data
                };
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


module.exports = UserApi;
