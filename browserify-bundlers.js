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
  return createBundler(browserifyOpts)
    .add(buildConfig.paths.jsMain)
    .external(appDependencies);
}


function createTestBundler(browserifyOpts) {
  // Specs currently require the code they test. This means that app source code
  // gets included into the spec bundle. For some reason, externalizing the
  // app source files causes tests to fail because the can't find the required app code.
  var testFiles = glob.sync(buildConfig.paths.jsSpecs); // Browserify can't handle glob patterns

  return createBundler(browserifyOpts)
    .add(testFiles)
    .external(appDependencies);
}

function createBundler(additionalOpts) {
  var opts = _.extend({}, additionalOpts, watchify.args);
  return browserify(opts);
}