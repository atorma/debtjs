var buildConfig = require('./build.conf');

// Including ONLY those files that affect tests seems to be the key to get test watching to work in IntelliJ.
module.exports = function(config) {
  config.set({
    basePath: buildConfig.paths.build,
    files: [
      buildConfig.paths.libDestName, {pattern: buildConfig.paths.libDestName + '.map', included: false, served: true, watched: false},
      buildConfig.paths.testDestName, {pattern: buildConfig.paths.testDestName + '.map', included: false, served: true, watched: false}
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
    singleRun: true
  });
};

