'use strict';

var webpack = require('webpack');
var webpackBaseConf = require('./webpack-base.config');

var webpackConf = Object.create(webpackBaseConf);
webpackConf.devtool = 'source-map';
webpackBaseConf.module.loaders.push({test: /src.*\.js$/, loaders: ['ng-annotate']});
webpackConf.plugins.push(new webpack.optimize.UglifyJsPlugin());


module.exports = webpackConf;