var path = require('path');
var buildConfig = require('./build.conf');
var webpackConfig = require('./webpack-karma.config');

var specEntryFilename = 'spec-index.js';

var preprocessors = {};
preprocessors[specEntryFilename] = ['webpack', 'sourcemap'];

module.exports = function (config) {
    config.set({
        basePath: path.join(buildConfig.paths.src, 'app'),
        files: [
            {pattern: specEntryFilename, watch: false} // Webpack watches the file for us
        ],
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