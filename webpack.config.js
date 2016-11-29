'use strict';

var _ = require('lodash');
var merge = require('webpack-merge');
var validate = require('webpack-validator');
var configParts = require('./webpack.config.parts');

var config = merge(
    configParts.setupCommon(),
    {
        devtool: 'eval-source-map'
    },
    configParts.setupDevServer({
        host: 'localhost',
        port: 8080
    })
);

_.forEach(_.keys(config.entry), function (entryKey) {
    config.entry[entryKey].unshift('webpack-dev-server/client?http://localhost:8080/', 'webpack/hot/dev-server');
});

module.exports = validate(config, {
    quiet: true
});