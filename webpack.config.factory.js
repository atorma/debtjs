'use strict';

var path = require('path');
var buildPaths = require('./build.conf').paths;
var webpack = require('webpack');
var _ = require('lodash');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = function(options) {
    var defaults = {
        cache: true,
        entry: {
            debt: buildPaths.jsMain,
            libs: [
                'angular',
                'angular-animate',
                'angular-aria',
                'angular-local-storage',
                'angular-material',
                'angular-material/angular-material.css',
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
            loaders: [
                {
                    test: /src.*\.html$/,
                    loader: 'ngtemplate?relativeTo=/src/app/!html'
                },
                {
                    test: /\.css/,
                    loader: ExtractTextPlugin.extract('style', 'css')
                },
                {
                    test: /\.(eot|ttf|woff|woff2)$/,
                    loader: 'file?name=fonts/[name].[ext]'
                }
            ]
        },
        plugins: [
            new webpack.optimize.CommonsChunkPlugin('libs', buildPaths.libDestName),
            new ExtractTextPlugin("[name].css")
        ]
    };

    return _.extend({}, defaults, options);
};