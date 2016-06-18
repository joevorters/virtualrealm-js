"use strict";

const path = require('path'),
  webpack = require('webpack'),
  assetPath = path.join(__dirname, 'assets'),
  publicPath = path.join(__dirname, 'public');

module.exports = {
  entry: path.join(assetPath, 'main.js'),
  output: {
    path: publicPath,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  }
};
