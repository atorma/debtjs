var webpack = require('webpack');
var buildConfig = require('./build.conf');

var preprocessors = {};
preprocessors['src/app/spec-index.js'] = ['webpack'];
var webpackOpts = {
    entry: undefined,
    output: {
        filename: '[name].js'
    },
    plugins: []
};
if (process.env.debug) {
    webpackOpts.devtool = 'inline-source-map';
    preprocessors['src/app/spec-index.js'].push('sourcemap');
}

var webpackConfig = require('./webpack.config.factory.js')(webpackOpts);

module.exports = function(config) {
    config.set({
        files: buildConfig.paths.jsSpecsMain,
        exclude: [],
        frameworks: ['jasmine'],
        reporters: ['dots'],
        browsers: ['Chrome'],
        phantomjsLauncher: {
            exitOnResourceError: true
        },
        preprocessors: preprocessors,
        webpack: webpackConfig,
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO, // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        autoWatch: true,
        singleRun: true
    });
};