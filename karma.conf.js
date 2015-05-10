module.exports = function(config) {
	config.set({
		basePath : './build',
		files : ['libs.js', 'debt.js', 'debt.spec.js', {pattern: '**/*.js.map', included: false}],
		exclude : [],
		frameworks : ['jasmine'],
		reporters : ['mocha'],
		preprocessors: {
      '**/*.js': ['sourcemap']
    },
		port : 9876,
		colors : true,
		logLevel : config.LOG_INFO, // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		autoWatch : true,
		browsers: ['Chrome'],
		singleRun : false
	});
};

