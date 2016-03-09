var buildConfig = require('./build.conf');

module.exports = function(config) {
  config.set({
    basePath: buildConfig.paths.build,
    files: [
      buildConfig.paths.libDestName,
      buildConfig.paths.testDestName,
      {pattern: '**/*.js.map', included: false, served: true}
    ],
    exclude: [],
    frameworks: ['jasmine'],
    reporters: ['mocha'],
    browsers: ['PhantomJS'],
    preprocessors: {
      '**/*.js': ['sourcemap']
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO, // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    autoWatch: true,
    singleRun: false
  });
};

