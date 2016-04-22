"use strict";

var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var karma = require('karma');
var webserver = require('gulp-webserver');
var _ = require('lodash');
var manifest = require('gulp-manifest');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var preprocess = require('gulp-preprocess');
var gulpIf = require('gulp-if');


var buildConfig = require('./build.conf');

var browserifyBundlers = require('./browserify-bundlers');

var materialDesignSprites = ['action', 'alert', 'content', 'navigation', 'editor'];

var DEV = "development";
var PROD = "production";
var context = {
  env: DEV,
  version: require('./package.json').version
};


gulp.task('build-dev', function(cb) {
  context.env = DEV;
  runSequence(
    'clean',
    [
      'js-libs',
      'js-app',
      'js-tests',
      'html',
      'resources',
      'lib-resources'
    ],
    cb);
});

gulp.task('build-prod', function(cb) {
  context.env = PROD;
  runSequence(
    'clean',
    [
      'js-libs',
      'js-app',
      'js-tests',
      'html',
      'resources',
      'lib-resources'
    ],
    'manifest',
    cb);
});

gulp.task('watch', function(cb) {
  runSequence(['watch:js-app', 'watch:js-tests', 'watch:html', 'watch:resources'], cb);
});


gulp.task('test', function(done) {
  var server = new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true,
    autoWatch: false
  }, done);
  server.start();
});

gulp.task('develop', function(cb) {
  runSequence(['build-dev', 'watch'], ['webserver'], cb);
});

gulp.task('tdd', ['develop'], function(done) {
  var server = new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: false,
    autoWatch: true
  }, done);
  server.start();
});

gulp.task('clean', function() {
  return del(buildConfig.paths.build + '/**');
});


function browserifyBuild(params) {
  var bundler = params.bundler({
    debug: context.env === DEV
  });

  return bundler.bundle()
    .on('error', function(err) {
      gutil.log('Browserify error:', err);
      this.emit('end');
    })
    .pipe(source(params.outputFileName))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(gulpIf(params.ngAnnotate, ngAnnotate()))
    .pipe(gulpIf(params.uglify, uglify()))
    .pipe(sourcemaps.write('./', {sourceRoot: '..'}))
    .pipe(gulp.dest(buildConfig.paths.build));
}

gulp.task('js-libs', function() {
  return browserifyBuild({
    bundler: browserifyBundlers.createLibBundler,
    ngAnnotate: false,
    uglify: context.env === PROD,
    outputFileName: buildConfig.paths.libDestName
  });
});

gulp.task('js-app', function() {
  return browserifyBuild({
    bundler: browserifyBundlers.createAppBundler,
    ngAnnotate: context.env === PROD,
    uglify: context.env === PROD,
    outputFileName: buildConfig.paths.appDestName
  });
});

gulp.task('watch:js-app', function() {

  var bundler = function(opts) {
    return watchify(browserifyBundlers.createAppBundler(opts))
      .on('log', gutil.log.bind(gutil.log, "Watchify (app):"))
      .on('update', build);
  };

  return build();

  function build() {
    return browserifyBuild({
      bundler: bundler,
      ngAnnotate: context.env === PROD,
      uglify: context.env === PROD,
      outputFileName: buildConfig.paths.appDestName
    });
  }
});

gulp.task('js-tests', function() {
  return browserifyBuild({
    bundler: browserifyBundlers.createTestBundler,
    ngAnnotate: false,
    uglify: false,
    outputFileName: buildConfig.paths.testDestName
  });
});

gulp.task('watch:js-tests', function () {
  var watchifier = function(opts) {
    return watchify(browserifyBundlers.createTestBundler(opts))
      .on('log', gutil.log.bind(gutil.log, "Watchify (tests):"))
      .on('update', build);
  };

  return build();

  function build() {
    return browserifyBuild({
      bundler: watchifier,
      ngAnnotate: false,
      uglify: false,
      outputFileName: buildConfig.paths.testDestName
    });
  }
});

gulp.task('html', function() {
  return gulp.src(buildConfig.paths.html)
    .pipe(preprocess({context: context}))
    .pipe(gulp.dest(buildConfig.paths.build));
});

gulp.task('watch:html', function() {
  gulp.watch(buildConfig.paths.html, ['html']);
});

gulp.task('resources', function() {
  return gulp.src(buildConfig.paths.resources)
    .pipe(gulp.dest(buildConfig.paths.build + '/resources'));
});

gulp.task('watch:resources', function() {
  gulp.watch(buildConfig.paths.resources, ['resources']);
});


gulp.task('lib-resources', function(done) {
  gulp.src(buildConfig.paths.libResources)
    .pipe(gulp.dest(buildConfig.paths.build + '/resources'));

  var materialDesignSpritePaths = _.map(materialDesignSprites, function(name) {
    var fileName = 'svg-sprite-' + name + '.svg';
    return 'node_modules/material-design-icons/sprites/svg-sprite/' + fileName;
  });

  _.each(materialDesignSpritePaths, function(path) {
    gulp.src(path)
      .pipe(gulp.dest(buildConfig.paths.build + '/resources/icons/'));
  });

  done();
});

gulp.task('manifest', function() {
  return gulp.src(buildConfig.paths.manifestFiles)
    .pipe(manifest({
      timestamp: true,
      preferOnline: true,
      network: ['http://*', 'https://*', '*'],
      filename: 'debt.appcache',
      exclude: 'debt.appcache',
      fallback: ['/ offline.html']
    }))
    .pipe(gulp.dest(buildConfig.paths.build));
});

gulp.task('watch:manifest', function() {
  gulp.watch(buildConfig.paths.manifestFiles, ['manifest']);
});


gulp.task('webserver', function() {
  gulp.src(buildConfig.paths.build)
    .pipe(webserver({
      host: '0.0.0.0',
      port: 8080,
      livereload: {
        enable: true,
        filter: function(fileName) {
          if (fileName.match(/.map$/)) { // exclude all source maps from livereload
            return false;
          } else if (fileName.match(/.spec.js$/)) { // exclude test bundles
            return false;
          } else {
            return true;
          }
        }
      }
    }));
});

