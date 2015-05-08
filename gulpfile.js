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

var paths = {
	main: 'src/app/debt.js',
	html: ['src/app/**/*.html', '!src/app/**/*.spec.html'],
	resources: ['src/resources/**'],
	lib: [],
	libResources: ['node_modules/angular-material-builds/angular-material.css', 'node_modules/ng-material-floating-button/mfb/dist/mfb.css*', 'src/lib/**/*.*', '!src/lib/**/*.js'],
	tests: 'src/app/**/*.spec.js',
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

// Builds the app and tests and watches for changes
gulp.task('build', [
                    'js-lib', 
                    'js-app', 
                    'html', 
                    'watch:html', 
                    'resources', 
                    'watch:resources', 
                    'lib', 
                    'lib-resources',
                    'js-tests'
                    ]);


gulp.task('clean', function(cb) {
  del(paths.build, cb);
});

gulp.task('clean-build', function(cb) {
  runSequence('clean', 'build', cb);
});

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
  
  var bundler = watchify(browserify('./'+paths.main, watchify.args))
  .external(dependencies)
  .external('ng-mfb')
  .on('update', bundle)
  .on('log', gutil.log);
  
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
	return gulp.src(paths.html)
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


// TODO don't bundle app files into tests.js
// but don't break Karma tests, either
gulp.task('js-tests', function() {
  
  // Based on Browserify + Globs
  // https://github.com/gulpjs/gulp/blob/4d35560d9e2e992037886897c671518cfe49fd7f/docs/recipes/browserify-with-globs.md
  
  var bundledStream = through(); // a stream with which to tell gulp about the first build 

  globby('./' + paths.tests, function(err, entries) {

    var bundler = watchify(browserify(watchify.args))
    .add(entries)
    .external(dependencies)
    .external('ng-mfb')
    .on('update', reBundle)
    .on('log', gutil.log);
    
    return bundle(bundledStream);

    function bundle(bundledStream) {
      if (err) {
        bundledStream.emit('error', err);
        return;
      }
      
      bundledStream
      .pipe(source('debt.spec.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(paths.build));
      
      return bundler
      .bundle()
      .pipe(bundledStream)
      .on('error', gutil.log.bind(gutil, 'Browserify Error'));
    }
    
    function reBundle() {
      return bundle(through());
    }
    
  });
  
  return bundledStream;

});

//Run tests once and exit
gulp.task('test', function() {
	return karma.start({
		configFile : __dirname + '/karma.conf.js',
		singleRun : true
	});
});

// Watch for file changes and re-run tests on each change
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
  runSequence('build', ['tdd', 'webserver'], cb);
});
