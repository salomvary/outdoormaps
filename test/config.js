/*global require:true*/
require = {
  shim: {
    'leaflet': {
      exports: 'L'
    },
    'vendor/bing-layer': ['leaflet']
  }
};
