const fs = require('fs');
const path = require('path');

module.exports = {
  generateRandomEmail: () => {
    return `test${Math.floor(Math.random() * 100000)}@example.com`;
  },
  parseDataLayer(html) {
    const regex = /window\.dataLayer\.push\(\s*(\{[^}]*\})\s*\);/s;
    const match = html.match(regex);
    if (match && match[1]) {
      // Convert single quotes to double quotes for valid JSON format
      const jsonString = match[1].replace(/'/g, '"'); // Use RegEx to replace single quotes with double quotes

      // Parse the matched JSON string to a JavaScript object
      const dataLayerObject = JSON.parse(jsonString);

      // Retrieve the practiceArea value
      const practiceArea = dataLayerObject.practiceArea || null; // Default to null if not found

      console.log("Extracted practiceArea:", practiceArea);
    } else {
      console.log("No dataLayer.push found.");
    }
  }
};
const clearAllureResults = () => {
  const resultsDir = path.join(process.cwd(), 'allure-results');
  
  if (fs.existsSync(resultsDir)) {
    const files = fs.readdirSync(resultsDir);
    
    for (const file of files) {
      fs.unlinkSync(path.join(resultsDir, file));
      console.log(`Deleted ${file} from allure-results`);
    }
    console.log('Successfully cleared allure-results directory');
  } else {
    fs.mkdirSync(resultsDir, { recursive: true });
    console.log('Created allure-results directory');
  }
};
module.exports = { 
  // ... other existing exports
  clearAllureResults 
};