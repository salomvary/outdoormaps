var path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  node: false,
  context: path.resolve(__dirname, 'app'),
  entry: './app',
  output: {
    path: path.resolve(__dirname, 'app'),
    filename: 'main.js'
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'app/node_modules')
    ]
  },
  serve: {
    port: 9000,
    hotClient: false,
    content: './app'
  }
};
