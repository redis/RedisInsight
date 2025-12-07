const protocol = 'garnetinsight://';
const callbackUrl = 'cloud/oauth/callback';

const openAppButton = document.querySelector('#open-app');
// this script is used to open the app from the callback url
// it is also hosted, so changes here won't impact the app
const openApp = (forceOpen) => {
  try {
    const currentUrl = new URL(window.location.href);
    const redirectUrl = protocol + callbackUrl + currentUrl.search;
    const isOpened = window.location.hash === '#success';

    if (forceOpen || !isOpened) {
      window.location.href = redirectUrl.toString();
    }

    window.location.hash = '#success';
  } catch (_e) {
    //
  }
};

// handlers
openAppButton.addEventListener('click', () => openApp(true));

openApp();
