"use strict";

var browserify = require('browserify');
var watchify = require('watchify');
var _ = require('lodash');

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


var libBundle = browserify()
.require(dependencies)
.require('./node_modules/ng-material-floating-button/src/mfb-directive.js', {expose: 'ng-mfb'});

var appDependencies = dependencies.concat(['ng-mfb']);

var appBundle = browserify(watchify.args)
.add('./src/app/debt.js')
.external(appDependencies);


module.exports = {
    libBundle: libBundle,
    appBundle: appBundle,
    appDependencies: appDependencies
};