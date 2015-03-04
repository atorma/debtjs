var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var browserify = require('browserify');
var karma = require('karma').server;

var bundler = watchify(browserify('./src/index.js', watchify.args));
// add any other browserify options or transforms here
// bundler.transform('brfs');

gulp.task('js', bundle); // so you can run `gulp js` to build the file
bundler.on('update', bundle); // on any dep update, runs the bundler
bundler.on('log', gutil.log); // output build logs to terminal

function bundle() {
  return bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('debt.js'))
    .pipe(gulp.dest('./app'));
}

// Run tests once and exit
gulp.task('test', function (done) {
	karma.start({
		configFile : __dirname + '/karma.conf.js',
		singleRun : true
	}, done);
});

// Watch for file changes and re-run tests on each change
gulp.task('tdd', function (done) {
	karma.start({
		configFile : __dirname + '/karma.conf.js'
	}, done);
});


gulp.task('default', ['tdd']);