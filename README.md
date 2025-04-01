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
7. Run parallel tests:
   # Run all tests in parallel
   npm run test:parallel
   # Run specific test groups
   npm run test:api
   npm run test:ui






```
playwright-framework
├─ .auth
│  └─ token.json
├─ .idea
│  ├─ inspectionProfiles
│  │  └─ Project_Default.xml
│  ├─ modules.xml
│  ├─ playwright-framework.iml
│  └─ vcs.xml
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
│  ├─ errorLocators.js
│  ├─ homeLocators.js
│  ├─ insightsLocators.js
│  ├─ loginLocators.js
│  └─ peopleLocators.js
├─ package-lock.json
├─ package.json
├─ pages
│  ├─ api
│  │  ├─ auth.api.js
│  │  ├─ base.api.js
│  │  └─ user.api.js
│  ├─ articlePage.js
│  ├─ basePage.js
│  ├─ cmsAdminPage.js
│  ├─ errorPage.js
│  ├─ homePage.js
│  ├─ insightsPage.js
│  ├─ loginPage.js
│  └─ peoplePage.js
├─ playwright.config.js
├─ README.md
├─ scripts
│  ├─ clean-log.js
│  └─ upscale-videos.sh
├─ tests
│  ├─ api
│  │  ├─ 01-login.spec.js
│  │  ├─ 02-user.get.spec.js
│  │  ├─ 03-user.update.spec.js
│  │  └─ 04-user.delete.spec.js
│  ├─ performance
│  │  ├─ homepage-performance.spec.js
│  │  └─ page-load-time.spec.js
│  └─ specs
│     ├─ articleDatalayer.spec.js
│     ├─ banner-image-loading.spec.js
│     ├─ error-page.spec.js
│     ├─ footer-social-icons.spec.js
│     ├─ hero-banner-validation.spec.js
│     ├─ insight-verification.spec.js
│     ├─ login.spec.js
│     └─ security.spec.js
└─ utils
   ├─ api.helper.js
   ├─ articleDataLayer-data.json
   ├─ auth.helper.js
   ├─ chartGenerator.js
   ├─ cmsAdminData.json
   ├─ data.generator.js
   ├─ helpers.js
   ├─ logger.js
   ├─ login-data.json
   ├─ performanceHelper.js
   ├─ securityHelper.js
   └─ Wait.js

```