var buildConfig = require('./build.conf');
var webpackConfig = require('./webpack-dev.config');

// Including ONLY those files that affect tests seems to be the key to get test watching to work in IntelliJ.
module.exports = function(config) {
  config.set({
    files: buildConfig.paths.jsSpecsMain,
    exclude: [],
    frameworks: ['jasmine'],
    reporters: ['mocha'],
    browsers: ['Chrome'],
    phantomjsLauncher: {
      exitOnResourceError: true
    },
    preprocessors: {
      'src/app/index.spec.js': ['webpack']
    },
    webpack: {
      cache: true,
      output: {
        path: buildConfig.paths.build,
        publicPath: '/',
        filename: buildConfig.paths.appDestName
      },
      module: {
        loaders: [
          {
            test: /\.html$/,
            loader: 'ngtemplate?relativeTo=/src/app/!html'
          },
          {
            test: /\.css/,
            loader: 'style!css'
          },
          {
            test: /\.(eot|ttf|woff|woff2)$/,
            loader: 'file?name=fonts/[name].[ext]'
          }
        ]
      }
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO, // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    autoWatch: true,
    singleRun: true,
    usePolling: true
  });
};

