// locators/cmsAdminLocators.js
module.exports = {
    applicationListIcon: {
      strategy: 'css',
      selector: '#cms-applist-toggle'
    },
    contentManagementApplication: {
      strategy: 'xpath',
      selector: '//div[@class="panel-heading"]//span[text()="Content management"]'
    },
    searchTextBox: {
      strategy: 'css',
      selector: '#app_search'
    },
    insightsCMSPage: {
      strategy: 'xpath',
      selector: '//span[@class="ContentTreeItem"]//span[text()="Insights"]'
    },
    pageTab: {
      strategy: 'xpath',
      selector: '//li[@class="js-filter-item highlighted"]//a[text()="Pages"]'
    },
    contentTab: {
      strategy: 'xpath',
      selector: '//span[@class="tab-title"][text()="Content"]'
    },
    iframeHierarchy: {
      cmsDesktop: {
        strategy: 'css',
        selector: 'iframe[name="cmsdesktop"]'
      },
      contentView: {
        strategy: 'css',
        selector: 'iframe[name="contentview"]'
      },
      frameC: {
        strategy: 'css',
        selector: 'iframe[name="c"]'
      }
    },
    itemsPerPage: {
        strategy: 'role',
        selector: {
          roleType: 'textbox',
          roleName: 'Items Per Page:'
        }
      },
    
    insightsPublishedPage:{
      strategy: 'role',
      selector: {
        roleType: 'link',
        roleName: 'Insights Published page'
      }
    }
  };