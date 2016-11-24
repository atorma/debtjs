'use strict';

var webpack = require('webpack');
var webpackBaseConf = require('./webpack-base.config');

var webpackConf = Object.create(webpackBaseConf);
webpackConf.devtool = 'eval';
webpackConf.debug = true;

module.exports = webpackConf;