'use strict';

var makeWebpackConfig = require('./webpack.config.factory.js');
var AppCachePlugin = require('appcache-webpack-plugin');

var webpackConfig = makeWebpackConfig(
    {
        uglify: true,
        makeCssBundles: true,
        addFileHashes: true,
        appcache: 'debt.appcache',
        ngStrictDi: 'ng-strict-di'
    },
    {
        devtool: 'source-map'
    }
);
webpackConfig.plugins.push(new AppCachePlugin({
    network: ['http://*', 'https://*', '*'],
    fallback: ['/offline.html'],
    settings: ['prefer-online'],
    output: 'debt.appcache',
    exclude: [/\.map/]
}));

module.exports = webpackConfig;