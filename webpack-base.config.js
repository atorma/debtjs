'use strict';

var buildPaths = require('./build.conf').paths;
var webpack = require('webpack');

module.exports = {
  cache: true,
  entry: {
    main: buildPaths.jsMain,
    libs: [
      'angular',
      'angular-animate',
      'angular-aria',
      'angular-local-storage',
      'angular-material',
      'angular-ui-router',
      'blob-polyfill',
      'lodash',
      'ng-file-upload',
      'node-safe-filesaver',
      'random-js',
      'simple-decimal-money'
    ]
  },
  output: {
    path: buildPaths.build,
    publicPath: '/',
    filename: buildPaths.appDestName
  },
  module: {
    loaders: []
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('libs', buildPaths.libDestName)
  ]
};