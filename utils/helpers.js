module.exports = {
    generateRandomEmail: () => {
      return `test${Math.floor(Math.random() * 100000)}@example.com`;
    },
    // Add more helper functions as needed
  };
  function getDynamicLocator(baseSelector, dynamicText) {
    return baseSelector.replace('{dynamicText}', dynamicText);
  }
  
  module.exports = { getDynamicLocator };