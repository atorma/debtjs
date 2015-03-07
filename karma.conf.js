module.exports = function(config) {
	config.set({
		basePath : '',
		frameworks : [ 'browserify', 'jasmine' ],
		files : [ {
			pattern : 'src/app/**/*.spec.js'
		} ],
		exclude : [],
		preprocessors : {
			'src/app/**/*.spec.js' : [ 'browserify' ]
		},
		browserify : {
			debug : true
		},
		reporters : [ 'progress' ],
		port : 9876,
		colors : true,
		logLevel : config.LOG_INFO, // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		autoWatch : true,
		browsers : [ 'PhantomJS' ],
		singleRun : false
	});
};
