var path = require('path');

module.exports = {
  mode: 'development',
  node: false,
  entry: './app/app',
  output: {
    path: path.resolve(__dirname, 'app')
  },
  module: {
    rules: [
      {
        test: require.resolve('./app/vendor/OS'),
        use: 'imports-loader?proj4leaflet=vendor/proj4leaflet,MapMultiCRS=vendor/MapMultiCRS'
      }
    ]
  },
  resolve: {
    modules: [path.resolve(__dirname, 'app')],
    alias: {
      'vendor/leaflet': 'vendor/leaflet/leaflet-src',
      'proj4': 'vendor/proj4',
      'polyline': 'vendor/polyline',
      'corslite': 'vendor/corslite',
      'leaflet': 'vendor/leaflet/leaflet-src'
    }
  },
  serve: {
    hotClient: false,
    content: 'app'
  }
};
