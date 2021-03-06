import Map from './map';
import 'add-to-homescreen';

(<any>window).addToHomeConfig = {
  returningVisitor: true,
};

// eslint-disable-next-line no-new
new Map();

// check for application cache updates
if ('serviceWorker' in navigator) {
  const sw = navigator.serviceWorker.getRegistration();
  if (sw) {
    // See https://github.com/GoogleChromeLabs/sw-precache/blob/master/demo/app/js/service-worker-registration.js
    sw.then(function (reg) {
      if (reg) {
        reg.onupdatefound = function () {
          const installingWorker = reg.installing;

          if (installingWorker) {
            installingWorker.onstatechange = function () {
              if (
                installingWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                if (
                  window.confirm(
                    'A new version of Outdoor Maps is available. Load update?'
                  )
                ) {
                  window.location.reload();
                }
              }
            };
          }
        };
      }
    });
  }
}
