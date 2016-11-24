'use strict';

var webpack = require('webpack');
var makeWebpackConfig = require('./webpack.config.factory.js');

var webpackConf = makeWebpackConfig({
    devtool: 'source-map'
});
webpackConf.module.loaders.push({test: /src.*\.js$/, loaders: ['ng-annotate']});
webpackConf.plugins.push(new webpack.optimize.UglifyJsPlugin());

module.exports = webpackConf;