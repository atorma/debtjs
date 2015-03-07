var gulp = require('gulp');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var karma = require('karma').server;
var del = require('del');


var paths = {
	main: './src/app/debt.js',
	resources: ['./src/app/**/*.html', '!/src/app/**/*.spec.*', '!/src/app/test-index.js'],
	tests: './src/app/test-index.js',
	testresources: ['./src/app/jasmine.spec.html'],
	build: './build'
};

var appBundler = watchify(browserify(paths.main, watchify.args));
appBundler.on('update', bundleApp);
appBundler.on('log', gutil.log);


var testBundler = watchify(browserify([paths.tests], watchify.args));
testBundler.on('update', bundleTests); 
testBundler.on('log', gutil.log); 


// Builds the application
gulp.task('build', ['js', 'resources', 'watch:resources']);

gulp.task('js', bundleApp);

gulp.task('resources', function() {
	gulp.src(paths.resources)
	.pipe(gulp.dest(paths.build));
});

gulp.task('watch:resources', function() {
	gulp.watch(paths.resources, ['resources']);
});

gulp.task('clean', function(cb) {
	del([paths.build], cb);
});

// Builds the application + Jasmine tests for running in browser
gulp.task('build:test', ['js:test', 'resources', 'resources:test', 'watch:resources', 'watch:resources:test']); 

gulp.task('js:test', bundleTests); 

gulp.task('resources:test', function() {
	gulp.src(paths.testresources)
	.pipe(gulp.dest(paths.build));
});

gulp.task('watch:resources:test', function() {
	gulp.watch(paths.testresources, ['resources:test']);
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

function bundleApp2() {
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