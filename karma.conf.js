module.exports = function(config) {
	config.set({
		basePath : 'build',
		files : ['libs.js', 'debt.spec.js'],
		exclude : [],
		frameworks : ['jasmine'],
		reporters : ['mocha'],
		port : 9876,
		colors : true,
		logLevel : config.LOG_INFO, // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		autoWatch : true,
		browsers: ['Chrome'],
		singleRun : false
	});
};

