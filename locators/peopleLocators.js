module.exports = {
    profileCard: {
      strategy: 'css',
      selector: '.card-profile'
    },
    profileName: {
      strategy: 'xpath',
      selector: '//h3[@class="card-profile__title"]//parent::a'
    },
    profileBannerImage: {
      strategy: 'css',
      selector: 'div.banner-profile__media > picture > img'
    }
  };