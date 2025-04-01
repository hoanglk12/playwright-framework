const os = require('os');
const process = require('process');
const fs = require('fs');
const path = require('path');

class EnvironmentInfoCollector {
  static getSystemInfo() {
    return {
      // Operating System Details
      'os.platform': os.platform(),
      'os.type': os.type(),
      'os.release': os.release(),
      'os.arch': os.arch(),

      // Node.js Environment
      'node.version': process.version,
      'node.platform': process.platform,
      'node.arch': process.arch,

      // Hardware Information
      'cpu.cores': os.cpus().length,
      'memory.total': `${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`,
    };
  }

  static getTestEnvironmentInfo() {
    return {
      // Test Environment Variables
      'test.environment': process.env.TEST_ENV || 'Not Specified',
      'test.url': process.env.CMS_URL || 'Not Configured',
      'test.type': process.env.TEST_TYPE || 'Regression',

      // CI/CD Information
      'ci.running': process.env.CI ? 'Yes' : 'No',
      'ci.name': process.env.CI_NAME || 'Local',
      'ci.build.number': process.env.CI_BUILD_NUMBER || 'N/A',
    };
  }

  static getBrowserInfo() {
    // This can be dynamically set based on the current test run
    return {
      'browser.name': process.env.BROWSER || 'chromium',
      'browser.version': process.env.BROWSER_VERSION || 'Unknown',
    };
  }

  static getProjectInfo() {
    let packageJson;
    try {
      packageJson = JSON.parse(
        fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8')
      );
      return {
        'project.name': packageJson.name || 'Unnamed Project',
        'project.version': packageJson.version || 'Unknown',
      };
    } catch (error) {
      return {
        'project.name': 'Unknown',
        'project.version': 'Unknown',
      };
    }
  }

  static collectAllEnvironmentInfo() {
    return {
      ...this.getSystemInfo(),
      ...this.getTestEnvironmentInfo(),
      ...this.getBrowserInfo(),
      ...this.getProjectInfo(),
      'timestamp': new Date().toISOString(),
    };
  }

  static writeEnvironmentProperties(info) {
    const allureResultsDir = path.resolve('./allure-results');
    
    // Ensure allure-results directory exists
    if (!fs.existsSync(allureResultsDir)) {
      fs.mkdirSync(allureResultsDir);
    }

    // Convert to properties format
    // const environmentProperties = Object.entries(info)
    //   .map(([key, value]) => `${key}=${value}`)
    //   .join('\n');

    // // Write environment.properties file
    // fs.writeFileSync(
    //   path.resolve(allureResultsDir, 'environment.properties'), 
    //   environmentProperties
    // );

    // // Optional: Create categories.json
    // const categoriesJson = [
    //   {
    //     "name": "Ignored Tests",
    //     "matchedStatuses": ["skipped"]
    //   },
    //   {
    //     "name": "Infrastructure Problems",
    //     "matchedStatuses": ["broken", "failed"],
    //     "messageRegex": ".*infrastructure.*"
    //   },
    //   {
    //     "name": "Outdated Tests",
    //     "matchedStatuses": ["broken"],
    //     "messageRegex": ".*obsolete.*"
    //   }
    // ];

    // fs.writeFileSync(
    //   path.resolve(allureResultsDir, 'categories.json'), 
    //   JSON.stringify(categoriesJson, null, 2)
    // );

    return info;
  }
}

module.exports = EnvironmentInfoCollector;
