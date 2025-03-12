// utils/securityHelper.js
const { execSync } = require('child_process');

function checkVulnerabilities() {
  try {
    execSync('npm audit --audit-level=moderate');
    return true;
  } catch (error) {
    console.error('Security vulnerabilities detected:', error.stdout.toString());
    return false;
  }
}

function validateEnvVars(requiredVars) {
  const missing = requiredVars.filter(varName => !process.env[varName]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = { checkVulnerabilities, validateEnvVars };