var Map = require('map');

window.addToHomeConfig = {
  returningVisitor: true
};

// eslint-disable-next-line no-new
new Map();

// check for application cache updates
if (window.applicationCache) {
  window.applicationCache.addEventListener('updateready', function() {
    if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
      if (window.confirm('A new version of Outdoor Maps is available. Load update?')) {
        window.location.reload();
      }
    }
  }, false);
}
