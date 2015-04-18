var gulp = require('gulp');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var debowerify = require('debowerify');
var karma = require('karma').server;
var _ = require('lodash');

var paths = {
	main: 'src/app/debt.js',
	html: ['src/app/**/*.html', '!src/app/**/*.spec.html'],
	resources: ['src/resources/**'],
	lib: ['bower_components/ng-mfb/src/mfb-directive.js'],
	libResources: ['node_modules/angular-material-builds/angular-material.css', 'bower_components/ng-mfb/mfb/src/mfb.css*', 'src/lib/**/*.*', '!src/lib/**/*.js'],
	tests: 'src/app/test-index.js',
	testHtml: ['src/app/jasmine.spec.html'],
	build: 'build'
};

var materialDesignSprites = ['action', 'alert', 'content', 'navigation'];


var appBundler = watchify(browserify('./'+paths.main, watchify.args));
//appBundler.transform(debowerify);
appBundler.on('update', bundleApp);
appBundler.on('log', gutil.log);


var testBundler = watchify(browserify([paths.tests], watchify.args));
//testBundler.transform(debowerify);
testBundler.on('update', bundleTests); 
testBundler.on('log', gutil.log); 


gulp.task('build', ['js', 'html', 'watch:html', 'resources', 'watch:resources', 'lib', 'lib-resources']);

gulp.task('js', bundleApp);

gulp.task('html', function() {
	gulp.src(paths.html)
	.pipe(gulp.dest(paths.build));
});

gulp.task('watch:html', function() {
	gulp.watch(paths.html, ['html']);
});

gulp.task('resources', function() {
	gulp.src(paths.resources)
	.pipe(gulp.dest(paths.build + '/resources'));
});

gulp.task('watch:resources', function() {
	gulp.watch(paths.resources, ['resources']);
});

gulp.task('lib', function() {
  gulp.src(paths.lib)
  .pipe(gulp.dest(paths.build));
});

gulp.task('lib-resources', function() {
	gulp.src(paths.libResources)
	.pipe(gulp.dest(paths.build + '/resources'));
	
	var materialDesignSpritePaths = _.map(materialDesignSprites, function(name) {
	  var fileName = 'svg-sprite-' + name + '.svg';
	  return 'node_modules/material-design-icons/sprites/svg-sprite/' + fileName;
	});
	
	_.each(materialDesignSpritePaths, function(path) {
	  gulp.src(path)
	  .pipe(gulp.dest(paths.build + '/resources/icons/'));
	});
	
});


// Builds the application + Jasmine tests for running in browser
gulp.task('build:test', ['js:test', 'html:test']); 

gulp.task('js:test', bundleTests); 

gulp.task('html:test', function() {
	gulp.src(paths.testHtml)
	.pipe(gulp.dest(paths.build));
});


//Run tests once and exit
gulp.task('test', function(done) {
	karma.start({
		configFile : __dirname + '/karma.conf.js',
		singleRun : true
	}, done);
});

// Watch for file changes and re-run tests on each change
gulp.task('tdd', function(done) {
	karma.start({
		configFile : __dirname + '/karma.conf.js'
	}, done);
});



function bundleApp() {
	return appBundler.bundle()
	.on('error', gutil.log.bind(gutil, 'Browserify Error'))
	.pipe(source('debt.js'))
	// optional, remove if you don't want sourcemaps
	.pipe(buffer())
	.pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
	.pipe(sourcemaps.write('./')) // writes .map file
	//
	.pipe(gulp.dest(paths.build));
}

function bundleTests() {
	return testBundler.bundle()
	.on('error', gutil.log.bind(gutil, 'Browserify Error'))
	.pipe(source('debt.spec.js'))
	.pipe(buffer())
	.pipe(sourcemaps.init({loadMaps: true})) 
	.pipe(sourcemaps.write('./')) 
	.pipe(gulp.dest(paths.build));
}