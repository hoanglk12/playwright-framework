class DataGenerator {
    static generateLoginCredentials() {
      return {
        username: `user_${this.generateRandomString(8)}`,
        password: this.generateRandomString(12)
      };
    }
  
    static generateRandomString(length) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
    }
  }
  
  module.exports = DataGenerator;
  