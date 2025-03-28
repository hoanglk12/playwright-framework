class AuthHelper {
    static token = null;

    static setToken(token) {
        this.token = token;
    }

    static getToken() {
        return this.token;
    }

    static clearToken() {
        this.token = null;
    }
}

module.exports = AuthHelper;
