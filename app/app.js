window.addToHomeConfig = {
  returningVisitor: true
};

require.config({
  deps: [
    'vendor/polyfills',
    'vendor/add-to-homescreen/src/add2home'
  ],
  paths: {
    'vendor/leaflet': 'vendor/leaflet/leaflet-src'
  },
  shim: {
    'vendor/leaflet': {
      exports: 'L'
    },
    'vendor/GPX': {
      exports: 'L.GPX'
    },
    'vendor/bing-layer': ['vendor/leaflet']
  }
});

require(['map', 'vendor/leaflet-patches'], function(Map) {
  return new Map();
});

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
