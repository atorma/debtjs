var bundles = require('./browserify-bundles');

module.exports = function(config) {
	config.set({
	  basePath: '',
		files: [
		         'build/libs.js', 
		         'src/app/**/*.spec.js'
		         ],
		exclude: [],
		frameworks: ['browserify', 'jasmine'],
		reporters: ['mocha'],
		preprocessors: {
      'build/libs.js': ['sourcemap'],
      'src/app/**/*.spec.js': ['browserify']
    },
    browserify: {
      debug: true
    },
		port: 9876,
		colors: true,
		logLevel: config.LOG_INFO, // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		autoWatch: true,
		browsers: ['Chrome'],
		singleRun: false
	});
};

