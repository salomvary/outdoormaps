var path = require('path');

module.exports = {
  mode: 'development',
  node: false,
  context: path.resolve(__dirname, 'app'),
  entry: './app',
  output: {
    path: path.resolve(__dirname, 'app'),
    filename: 'main.js'
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
    port: 9000,
    hotClient: false,
    content: './app'
  }
};
