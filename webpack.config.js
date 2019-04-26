var path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './app/app',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  serve: {
    port: 9000,
    hotClient: false,
    content: './'
  }
};
