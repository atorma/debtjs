'use strict';

var path = require('path');
var buildPaths = require('./build.conf').paths;
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var _ = require('lodash');
var packageJson = require('./package.json');
var AppCachePlugin = require('appcache-webpack-plugin');


exports.setupCommon = function (options) {
    options = _.extend({}, options);

    return {
        cache: true,
        entry: {
            debt: buildPaths.jsMain,
            libs: _.keys(packageJson.dependencies)
        },
        output: {
            path: buildPaths.build,
            filename: '[name].js'
        },
        module: {
            loaders: [
                {
                    test: /\.html$/,
                    loader: 'ngtemplate?relativeTo=/src/app/!html',
                    exclude: /index\.html/
                },
                {
                    test: /\.css$/,
                    loader: 'style!css'
                },
                {
                    test: /\.(eot|ttf|woff|woff2)$/,
                    loader: 'file?name=fonts/[name].[ext]'
                },
                {
                    test: /\.(png|svg)$/,
                    loader: 'url?limit=5000'
                }
            ]
        },
        plugins: [
            new webpack.optimize.CommonsChunkPlugin({
                name: ['libs', 'manifest']
            }),
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
};

exports.ngAnnotate = function () {
    return {
        module: {
            loaders: [
                {
                    test: /src.*\.js$/,
                    loader: 'ng-annotate'
                }
            ]
        }
    };
};

exports.minify = function () {
    return {
        plugins: [
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            })
        ]
    };
};

exports.extractCSS = function () {
    return {
        module: {
            loaders: [
                {
                    test: /\.css$/,
                    loader: ExtractTextPlugin.extract('style', 'css')
                }
            ]
        },
        plugins: [
            new ExtractTextPlugin('[name].[contenthash].css')
        ]
    };
};

exports.setFreeVariables = function (hash) {
    hash = _.mapValues(hash, function (value) {
        return JSON.stringify(value);
    });

    return {
        plugins: [
            new webpack.DefinePlugin(hash)
        ]
    };
};

exports.setupAppCache = function (options) {
    options = _.extend({name: 'debt.appcache'}, options);

    return {
        plugins: [
            new AppCachePlugin({
                network: ['http://*', 'https://*', '*'],
                fallback: ['/offline.html'],
                settings: ['prefer-online'],
                output: options.name,
                exclude: [/\.map/]
            })
        ]
    };
};

exports.setupDevServer = function (options) {
    options = _.extend({
        host: 'localhost',
        port: 8080
    }, options);

    return {
        devServer: {
            historyApiFallback: true,
            hot: true,
            inline: true,
            stats: 'errors-only',
            host: options.host,
            port: options.port,
            watchOptions: {
                aggregateTimeout: 300,
                poll: 1000
            }
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin({
                multiStep: true
            })
        ]
    };
};