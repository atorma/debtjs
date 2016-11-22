'use strict';

var buildPaths = require('./build.conf').paths;
var webpack = require('webpack');
var webpackBaseConf = require('./webpack-base.config');

var webpackConf = Object.create(webpackBaseConf);
webpackConf.devtool = 'eval';
webpackConf.debug = true;

module.exports = webpackConf;