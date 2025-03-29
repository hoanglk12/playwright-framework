const fs = require('fs');
const path = require('path');

class AuthHelper {
    static TOKEN_FILE = path.resolve(__dirname, '../.auth/token.json');

    static setToken(token) {
        try {
            // Ensure directory exists
            const dir = path.dirname(this.TOKEN_FILE);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Write token to file
            fs.writeFileSync(this.TOKEN_FILE, JSON.stringify({ 
                token, 
                timestamp: Date.now() 
            }, null, 2), 'utf8');
        } catch (error) {
            console.error('Failed to write token:', error);
        }
    }

    static getToken() {
        try {
            if (fs.existsSync(this.TOKEN_FILE)) {
                const tokenData = JSON.parse(fs.readFileSync(this.TOKEN_FILE, 'utf8'));
                
                // Optional: Add token expiration check
                const TOKEN_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours
                if (tokenData.timestamp && 
                    (Date.now() - tokenData.timestamp > TOKEN_EXPIRATION_TIME)) {
                    this.clearToken();
                    return null;
                }

                return tokenData.token;
            }
            return null;
        } catch (error) {
            console.error('Failed to read token:', error);
            return null;
        }
    }

    static clearToken() {
        try {
            if (fs.existsSync(this.TOKEN_FILE)) {
                fs.unlinkSync(this.TOKEN_FILE);
            }
        } catch (error) {
            console.error('Failed to clear token:', error);
        }
    }

    // New method to check if token exists and is valid
    static hasValidToken() {
        const token = this.getToken();
        return token !== null && token !== undefined;
    }
}

module.exports = AuthHelper;
