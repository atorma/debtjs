'use strict';

var path = require('path');
var buildPaths = require('./build.conf').paths;
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var _ = require('lodash');

module.exports = function(options, inputConfig) {
    options = _.extend({
        uglify: false,
        makeCssBundles: false,
        addFileHashes: false
    }, options);

    inputConfig = inputConfig || {};

    var config = {
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
            filename: '[name].js'
        },
        module: {
            loaders: [
                {
                    id: 'html',
                    test: /src.*\.html$/,
                    loader: 'ngtemplate?relativeTo=/src/app/!html',
                    exclude: /index\.html/
                },
                {
                    id: 'css',
                    test: /\.css/,
                    loader: 'style!css'
                },
                {
                    id: 'fonts',
                    test: /\.(eot|ttf|woff|woff2)$/,
                    loader: 'file?name=fonts/[name].[ext]'
                },
                {
                    id: 'images',
                    test: /\.(png|svg)$/,
                    loader: 'url?limit=5000'
                }
            ]
        },
        plugins: [
            new webpack.optimize.CommonsChunkPlugin('libs', options.addFileHashes ? '[name].[chunkhash].js' : '[name].js'),
            new HtmlWebpackPlugin({
                template: buildPaths.indexHtml,
                filename: 'index.html',
                title: 'DebtJS',
                favicon: './src/resources/ic_account_balance_wallet_black_48dp.png',
                inject: 'head',
                myOptions: options
            })
        ]
    };

    if (options.uglify) {
        config.module.loaders.push({
            id: 'js',
            test: /src.*\.js$/,
            loader: 'ng-annotate'
        });
        config.plugins.push(new webpack.optimize.UglifyJsPlugin());
    }

    if (options.addFileHashes) {
        config.output.filename = '[name].[chunkhash].js';
    }

    if (options.makeCssBundles) {
        _.remove(config.module.loaders, {id: 'css'});
        config.module.loaders.push({
            id: 'css',
            test: /\.css$/,
            loader: ExtractTextPlugin.extract('style', 'css')
        });
        config.plugins.push(new ExtractTextPlugin(options.addFileHashes ? '[name].[contenthash].css' : '[name].css'));
    }

    _.extend(config, inputConfig);

    return config;
};