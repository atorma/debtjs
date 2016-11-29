'use strict';

var merge = require('webpack-merge');
var validate = require('webpack-validator');
var configParts = require('./webpack.config.parts');

var config = merge.smart(
    configParts.setupCommon({
        appcache: 'debt.appcache',
        ngStrictDi: 'ng-strict-di'
    }),
    {
        devtool: 'source-map',
        output: {
            filename: '[name].[chunkhash].js'
        }
    },
    configParts.extractCSS(),
    configParts.ngAnnotate(),
    configParts.minify(),
    configParts.setupAppCache({name: 'debt.appcache'})
);

module.exports = validate(config, {
    quiet: true
});