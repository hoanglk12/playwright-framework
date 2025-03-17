# Playwright Automation Framework

This is a basic Playwright automation testing framework.

## Features
- Page Object Model (POM) pattern
- Support for multiple browsers
- Allure reporting
- CI/CD integration

## Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/playwright-framework.git
2. Install dependencies:
   npm install
3. Run all tests:
   npm test
4. Run all tests and generate allure report:
   npm run test && npm run report
5. Run specific test:
   npx playwright test tests/specs/articleDatalayer.spec.js tests/specs/insight-verification.spec.ts tests/specs/login.spec.ts
6. Update with multiple environments:
   npm run test:uat
   npm run test:dev
   npm run test:uat tests/specs/articleDatalayer.spec.js
   npm run test:dev tests/specs/articleDatalayer.spec.js
   npm run test:dev tests/specs/articleDatalayer.spec.js --project=chromium


