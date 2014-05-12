require = {
  deps: [
    'vendor/polyfills'
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
};
