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




```
playwright-framework
├─ check-chromium-version.js
├─ config
│  └─ constants.js
├─ environments
│  ├─ dev.config.js
│  ├─ prod.config.js
│  └─ uat.config.js
├─ fixtures
│  └─ custom-fixtures.js
├─ global-setup.js
├─ locators
│  ├─ articleLocators.js
│  ├─ cmsAdminLocators.js
│  ├─ homeLocators.js
│  ├─ insightsLocators.js
│  ├─ loginLocators.js
│  └─ peopleLocators.js
├─ package-lock.json
├─ package.json
├─ pages
│  ├─ articlePage.js
│  ├─ basePage.js
│  ├─ cmsAdminPage.js
│  ├─ homePage.js
│  ├─ insightsPage.js
│  ├─ loginPage.js
│  └─ peoplePage.js
├─ playwright.config.js
├─ README.md
├─ scripts
│  └─ upscale-videos.sh
├─ tests
│  ├─ performance
│  │  ├─ homepage-performance.spec.js
│  │  └─ page-load-time.spec.js
│  └─ specs
│     ├─ articleDatalayer.spec.js
│     ├─ banner-image-loading.spec.js
│     ├─ footer-social-icons.spec.js
│     ├─ hero-banner-validation.spec.js
│     ├─ insight-verification.spec.js
│     ├─ login.spec.js
│     └─ security.spec.js
└─ utils
   ├─ articleDataLayer-data.json
   ├─ cmsAdminData.json
   ├─ helpers.js
   ├─ login-data.json
   ├─ performanceHelper.js
   ├─ securityHelper.js
   └─ Wait.js

```