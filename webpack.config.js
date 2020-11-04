var path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './app/app',
  context: __dirname,
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: './main.js',
    publicPath: 'dist/',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  devServer: {
    port: 9000,
  },
};
