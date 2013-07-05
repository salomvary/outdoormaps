window.addToHomeConfig = {
  returningVisitor: true
};

require.config({
  deps: [
    'polyfills',
    'vendor/add-to-homescreen/src/add2home'
  ],
  paths: {
    'vendor/leaflet': 'vendor/leaflet/leaflet-src'
  },
  shim: {
    'vendor/leaflet': {
      exports: 'L'
    },
    'vendor/bing-layer': ['vendor/leaflet']
  }
});

require(['map'], function(Map) {
  new Map();
});
