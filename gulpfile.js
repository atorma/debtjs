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
	lib: [],
	libResources: ['node_modules/angular-material-builds/angular-material.css', 'node_modules/ng-material-floating-button/mfb/dist/mfb.css*', 'src/lib/**/*.*', '!src/lib/**/*.js'],
	build: 'build'
};

var materialDesignSprites = ['action', 'alert', 'content', 'navigation'];

/*
 * Dependencies
 * material-design-icons: 
 *  Breaks browserify. This is an icon package and does not have package.json main or index.js
 * ng-material-floating-button: 
 *  Breaks browserify. It has an array in package.json main (problem as such) and one of them refers to a css file. 
 *  Handled separately as "ng-mfb".
 */
var packageJson = require('./package.json');
var dependencies = _(packageJson && packageJson.dependencies || {})
  .keys()
  .without('material-design-icons', 'ng-material-floating-button')
  .value();

// Builds the app and watches for changes
gulp.task('build', ['js-lib', 'js-app', 'html', 'watch:html', 'resources', 'watch:resources', 'lib', 'lib-resources']);


gulp.task('js-lib', function() {
  
  return browserify()
  .require(dependencies)
  .require('./node_modules/ng-material-floating-button/src/mfb-directive.js', {expose: 'ng-mfb'})
  .bundle()
  .on('error', gutil.log.bind(gutil, 'Browserify Error'))
  .pipe(source('libs.js'))
  .pipe(gulp.dest(paths.build));
  
});

gulp.task('js-app', function() {
  
  var bundler = watchify(browserify('./'+paths.main, watchify.args));
  //bundler.transform(debowerify);
  bundler.external(dependencies);
  bundler.external('ng-mfb');
  bundler.on('update', bundle);
  bundler.on('log', gutil.log);
  
  return bundle();

  function bundle() {
    return bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('debt.js'))
      // optional, remove if you don't want sourcemaps
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
    .pipe(sourcemaps.write('./')) // writes .map file
    //
    .pipe(gulp.dest(paths.build));
  }
  
});

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



