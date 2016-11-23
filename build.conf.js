'use strict';

var path = require('path');
var globalBackslash = /\\/g;

function p(relPath) {
  var absPath = path.join(__dirname, relPath);
  var retval = absPath.replace(globalBackslash, '/');
  return retval;
}

module.exports = {
  paths: {
    jsMain: [p('src/app/debt.js')],
    jsAll: [p('src/app/**/*.js')],
    jsSpecs: [p('src/app/**/*.spec.js')],
    indexHtml: p('src/app/index.html'),
    html: [p('src/app/index.html'), p('src/app/offline.html')],
    css: [p('src/resources/**/*.css')],
    libCss: [p('node_modules/angular-material/angular-material.css')],
    resources: [p('src/resources/**'), '!src/resources/**/*.css'],
    libResources: [],
    build: p('build'),
    manifestFiles: [p('build/**/*'), '!build/**/*.spec.*', '!build/**/*.map', '!build/**/*.manifest'],
    appDestName: 'debt.js',
    libDestName: 'libs.js',
    testDestName: 'debt.spec.js'
  }
};