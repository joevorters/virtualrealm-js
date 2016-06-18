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
        loaders: [{
            test: /\.jsx?$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
                presets: ['es2015', 'react']
            }
        }, {
            test: /\.css$/,
            loader: 'style!css'
        }, {
            test: /\.svg$/,
            loader: 'file'
        }, {
            test: /\.gif/,
            loader: 'url?limit=10000&mimetype=image/gif'
        }, {
            test: /\.jpg/,
            loader: 'url?limit=10000&mimetype=image/jpg'
        }, {
            test: /\.png/,
            loader: 'url?limit=10000&mimetype=image/png'
        }, {
            test: /\.woff|woff2$/,
            loader: 'url?limit=10000&mimetype=application/font-woff'
        }, {
            test: /\.ttf$/,
            loader: 'file'
        }, {
            test: /\.eot$/,
            loader: 'file'
        }, {
            test: /\.svg$/,
            loader: 'file'
        }]
    }
};
