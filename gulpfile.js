var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var globby = require('globby');
var through = require('through2');
var watchify = require('watchify');
var browserify = require('browserify');
var karma = require('karma').server;
var webserver = require('gulp-webserver');
var _ = require('lodash');
var manifest = require('gulp-manifest');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var preprocess = require('gulp-preprocess');

var paths = {
	main: 'src/app/debt.js',
	html: ['src/app/**/*.html', '!src/app/**/*.spec.html'],
	resources: ['src/resources/**'],
	lib: [],
	libResources: ['node_modules/angular-material/angular-material.css', 'node_modules/ng-material-floating-button/mfb/dist/mfb.css*', 'src/lib/**/*.*', '!src/lib/**/*.js'],
	tests: 'src/app/**/*.spec.js',
	build: 'build',
	manifestFiles: ['build/**/*', '!build/**/*.spec.*', '!build/**/*.map', '!build/**/*.manifest']
};

var bundles = require('./browserify-bundles');

var materialDesignSprites = ['action', 'alert', 'content', 'navigation'];

var environment = "development";


gulp.task('build-dev', function(cb) {
  environment = "development";
  runSequence(
      [
       'js-libs',
       'js-app',
       'html', 
       'resources', 
       'lib', 
       'lib-resources'
      ], 
      cb);
});

gulp.task('build-prod', function(cb) {
  environment = "production";
  runSequence(
      'clean',
      [
       'js-libs',
       'js-app',
       'html', 
       'resources', 
       'lib', 
       'lib-resources'
      ],
      'manifest',
      cb);
});


gulp.task('clean', function(cb) {
  del(paths.build+'/**/*.*', cb);
});

gulp.task('js-libs', function() {
  return bundles.libBundle
  .bundle()
  .on('error', gutil.log.bind(gutil, 'Browserify Error'))
  .pipe(source('libs.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: false}))
  .pipe(uglify())
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest(paths.build));
});


gulp.task('jshint', function() {
  gulp.src('src/app/**/*.js')
  .pipe(jshint())
  .pipe(jshint.reporter('default'));
});


function bundleApp(bundler) {
  return bundler.bundle()
  .on('error', gutil.log.bind(gutil, 'Browserify Error'))
  .pipe(source('debt.js'))
  .pipe(buffer())
  .pipe(ngAnnotate())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(uglify())
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest(paths.build));
}

gulp.task('js-app', function() {
  return bundleApp(bundles.appBundle);
});

gulp.task('watch:js-app', function() {
  var bundler = watchify(bundles.appBundle)
  .on('update', function() {
    return bundleApp(bundler);
  });
});

gulp.task('html', function() {
	return gulp.src(paths.html)
	.pipe(preprocess({context: {environment: environment}}))
	.pipe(gulp.dest(paths.build));
});

gulp.task('watch:html', function() {
	gulp.watch(paths.html, ['html']);
});

gulp.task('resources', function() {
	return gulp.src(paths.resources)
	.pipe(gulp.dest(paths.build + '/resources'));
});

gulp.task('watch:resources', function() {
  gulp.watch(paths.resources, ['resources']);
});

gulp.task('lib', function() {
  return gulp.src(paths.lib)
  .pipe(gulp.dest(paths.build));
});

gulp.task('lib-resources', function(done) {
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
	
	done();
});

gulp.task('manifest', function() {
  return gulp.src(paths.manifestFiles)
  .pipe(manifest({
    timestamp: true,
    preferOnline: true,
    network: ['http://*', 'https://*', '*'],
    filename: 'debt.manifest',
    exclude: 'debt.manifest'
   }))
  .pipe(gulp.dest(paths.build));
});

gulp.task('watch:manifest', function() {
  gulp.watch(paths.manifestFiles, ['manifest']);
});


gulp.task('test', function() {
	return karma.start({
		configFile: __dirname + '/karma.conf.js',
		singleRun: true
	});
});

gulp.task('tdd', function(done) {
	karma.start({
		configFile : __dirname + '/karma.conf.js'
	}, done);
});

gulp.task('webserver', function() {
  gulp.src(paths.build)
  .pipe(webserver({
    port: 8080,
    livereload: true
  }));
});

gulp.task('develop', function(cb) {
  runSequence(
      'clean', 
      [
       'build-dev', 
       'watch:js-app',
       'watch:html', 
       'watch:resources', 
       'watch:manifest'
      ], 
      [
       'tdd', 
       'webserver'
      ], 
      cb);
});
