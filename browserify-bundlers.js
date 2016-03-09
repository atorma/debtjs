"use strict";

var browserify = require('browserify');
var watchify = require('watchify');
var _ = require('lodash');
var glob = require('glob');

var buildConfig = require('./build.conf');

var packageJson = require('./package.json');
var dependencies = _(packageJson && packageJson.dependencies || {})
  .keys()
  .without('material-design-icons') //  Breaks browserify. This is an icon package and does not have package.json main or index.js
  .without('ng-material-floating-button') // Breaks browserify. It has an array in package.json main (problem as such) and one of them refers to a css file. Handled separately as "ng-mfb".
  .value();


var appDependencies = dependencies.concat([
  'ng-mfb'
]);


module.exports = {
  createLibBundler: createLibBunder,
  createAppBundler: createAppBundler,
  createTestBundler: createTestBundler
};


function createLibBunder(browserifyOpts) {
  return createBundler(browserifyOpts)
    .require(dependencies)
    .require('./node_modules/ng-material-floating-button/src/mfb-directive.js', {expose: 'ng-mfb'});
}

function createAppBundler(browserifyOpts) {
  // Make sure watchified app bundle is build if any app file is changed.
  // It used to work by just adding the main js file, but seems like after
  // test bundle was set to include all files it stopped working. This is a workaround.
  var allJsFiles = glob.sync(buildConfig.paths.jsAll);
  var specJsFiles = glob.sync(buildConfig.paths.jsSpecs);
  var appJsFiles = _.without(allJsFiles, specJsFiles);

  return createBundler(browserifyOpts)
    .add(buildConfig.paths.jsMain)
    .add(appJsFiles)
    .external(appDependencies);
}

// Specs currently require the code they test. This means that app source code
// gets included into the spec bundle. For some reason, externalizing the
// app source files causes tests to fail because the can't find the required app code.
// We add all the source files to the bundle so that rebuild of the app + test bundle
// happens when either app files or test files are updated.
function createTestBundler(browserifyOpts) {
  var allJsFiles = glob.sync(buildConfig.paths.jsAll);
  return createBundler(browserifyOpts)
    .add(buildConfig.paths.jsMain)
    .add(allJsFiles)
    .external(appDependencies);
}

function createBundler(additionalOpts) {
  var opts = _.extend({}, additionalOpts, watchify.args);
  return browserify(opts);
}