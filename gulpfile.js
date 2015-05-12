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

// Builds the app and tests once
gulp.task('build', function(cb) {
  runSequence([
      'js-libs',
      'js-app',
      'html', 
      'resources', 
      'lib', 
      'lib-resources',
      'js-test-libs',
      'js-tests'
      ], 
      'manifest', 
      cb);
  
});


gulp.task('clean', function(cb) {
  del(paths.build, cb);
});

gulp.task('clean-build', function(cb) {
  runSequence('clean', 'build', cb);
});

gulp.task('js-libs', function() {
  return browserify()
  .require(dependencies)
  .require('./node_modules/ng-material-floating-button/src/mfb-directive.js', {expose: 'ng-mfb'})
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


var appBundler = browserify('./'+paths.main, watchify.args)
.external(dependencies)
.external('ng-mfb')
.on('log', gutil.log);

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
  return bundleApp(appBundler);
});

gulp.task('watch:js-app', function() {
  var bundler = watchify(appBundler)
  .on('update', function() {
    return bundleApp(bundler);
  });
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

var testLibBundler = browserify()
.require('angular-mocks/ngMock');

gulp.task('js-test-libs', function() {
  return testLibBundler
  .bundle()
  .on('error', gutil.log.bind(gutil, 'Browserify Error'))
  .pipe(source('libs.spec.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest(paths.build));
});

// TODO why cannot separate app code into its own bundle without breaking tests?
// TODO why doesn't watchify work without executing bundling?
function bundleTests(options) {
  
  options = _.extend({}, options);
  
  // Based on Browserify + Globs
  // https://github.com/gulpjs/gulp/blob/4d35560d9e2e992037886897c671518cfe49fd7f/docs/recipes/browserify-with-globs.md
  
  // a stream with which to tell gulp about the first build 
  var bundledStream = through();

  globby('./' + paths.tests, function(err, entries) {
    
    var bundler = browserify(watchify.args)
    .add(entries)
    .external(testLibBundler)
    .external(dependencies)
    .external('ng-mfb')
    .on('log', gutil.log);
    
    if (options.watchify) {
      bundler = watchify(bundler)
      .on('update', reBundle);
    }
    
    return bundle(bundledStream);
    
    function reBundle() {
      return bundle(through());
    }

    function bundle(bundledStream) {
      if (err) {
        bundledStream.emit('error', err);
        return;
      }
      
      bundledStream
      .pipe(source('debt.spec.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: false}))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(paths.build));
      
      return bundler
      .bundle()
      .pipe(bundledStream)
      .on('error', gutil.log.bind(gutil, 'Browserify Error'));
    }

  });

  return bundledStream;
}

gulp.task('js-tests', function() {
  return bundleTests({watchify: false});
});

gulp.task('watch:js-tests', function() {
  return bundleTests({watchify: true});
});

gulp.task('test', function() {
	return karma.start({
		configFile : __dirname + '/karma.conf.js',
		singleRun : true
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
  runSequence([
               'build', 
               'watch:js-app', 
               'watch:html', 
               'watch:resources', 
               'watch:manifest', 
               'watch:js-tests'
               ], 
               [
                'tdd', 
                'webserver'
               ], 
               cb);
});
