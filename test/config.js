require = {
  deps: [
    'polyfills'
  ],
  paths: {
    'vendor/leaflet': 'vendor/leaflet.js/leaflet-src'
  },
  shim: {
    'vendor/leaflet': {
      exports: 'L'
    },
    'vendor/bing-layer': ['vendor/leaflet']
  }
};
