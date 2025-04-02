const { v4: uuidv4 } = require('uuid');

class AllureMetadataGenerator {
  constructor(options = {}) {
    this.options = options;
    this.testRunId = uuidv4();
    this.startTime = Date.now();
  }

  generateTestRunMetadata() {
    return {
      uuid: this.testRunId,
      start: this.startTime,
      env: this.options.env || 'unknown',
      systemInfo: this.options.systemInfo || {}
    };
  }
}

module.exports = AllureMetadataGenerator;
