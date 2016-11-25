"use strict";

var gulp = require('gulp');
var gutil = require('gulp-util');
var manifest = require('gulp-manifest');
var preprocess = require('gulp-preprocess');
var webserver = require('gulp-webserver');
var transform = require('gulp-transform');
var rename = require('gulp-rename');
var del = require('del');
var runSequence = require('run-sequence');
var karma = require('karma');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

var buildConfig = require('./build.conf');


var DEV = "development";
var PROD = "production";
var context = {
    env: DEV,
    version: require('./package.json').version
};


gulp.task('build-dev', function (cb) {
    context.env = DEV;
    runSequence(
        'clean',
        [
            'webpack',
            'html',
            'resources',
            'lib-resources'
        ],
        cb);
});

gulp.task('build-prod', function (cb) {
    context.env = PROD;
    runSequence(
        'clean',
        [
            'webpack',
            'html',
            'resources',
            'lib-resources'
        ],
        'manifest',
        cb);
});

gulp.task('watch', function (cb) {
    runSequence([
            'watch:html'
        ],
        cb);
});


gulp.task('test', function (done) {
    var server = new karma.Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true,
        autoWatch: false
    }, done);
    server.start();
});

gulp.task('develop', ['html', 'resources', 'lib-resources', 'watch'], function (cb) {
    var webpackConfig = require('./webpack-dev.config');
    new WebpackDevServer(webpack(webpackConfig), {
        hot: false,
        contentBase: buildConfig.paths.build
    }).listen(8080, "localhost", function (err) {
        if (err) {
            throw new gutil.PluginError("webpack-dev-server", err);
        }
        gutil.log("[webpack-dev-server]", "http://localhost:8080/webpack-dev-server/index.html");
        cb();
    });
});

gulp.task('tdd', function (cb) {
    var server = new karma.Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: false,
        autoWatch: true
    }, cb);
    server.start();
});

gulp.task('clean', function () {
    return del(buildConfig.paths.build + '/**');
});

gulp.task('webpack', function (cb) {
    var webpackConfig;
    if (context.env === DEV) {
        webpackConfig = require('./webpack-dev.config');
    } else if (context.env === PROD) {
        webpackConfig = require('./webpack-prod.config');
    }

    webpack(webpackConfig, function (err, stats) {
        if (err) {
            throw new gutil.PluginError("webpack", err);
        }
        gutil.log("[webpack]", stats.toString({
            // output options
        }));
        cb();
    });
});

gulp.task('html', function () {
    return gulp.src(buildConfig.paths.html)
        .pipe(preprocess({context: context}))
        .pipe(gulp.dest(buildConfig.paths.build));
});

gulp.task('watch:html', function () {
    gulp.watch(buildConfig.paths.html, ['html']);
});

gulp.task('resources', function () {
    return gulp.src(buildConfig.paths.resources)
        .pipe(gulp.dest(buildConfig.paths.build + '/resources'));
});

gulp.task('lib-resources', function () {
    return gulp.src(buildConfig.paths.libResources)
        .pipe(gulp.dest(buildConfig.paths.build + '/resources'));
});

gulp.task('manifest', function () {
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

gulp.task('watch:manifest', function () {
    gulp.watch(buildConfig.paths.manifestFiles, ['manifest']);
});


gulp.task('webserver', function () {
    gulp.src(buildConfig.paths.build)
        .pipe(webserver({
            host: '0.0.0.0',
            port: 8080,
            livereload: {
                enable: true,
                filter: function (fileName) {
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

