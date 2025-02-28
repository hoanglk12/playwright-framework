module.exports = {
    generateRandomEmail: () => {
      return `test${Math.floor(Math.random() * 100000)}@example.com`;
    },
    // Add more helper functions as needed
  };