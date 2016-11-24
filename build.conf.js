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
    appDir: p('src/app'),
    jsMain: [p('src/app/debt.js')],
    jsAll: [p('src/app/**/*.js')],
    jsSpecs: [p('src/app/**/*.spec.js')],
    jsSpecsMain: [p('src/app/spec-index.js')],
    indexHtml: p('src/app/index.html'),
    html: [p('src/app/index.html'), p('src/app/offline.html')],
    resources: [p('src/resources/**/*.{svg,png}')],
    libResources: [],
    build: p('build'),
    manifestFiles: [p('build/**/*'), '!build/**/*.spec.*', '!build/**/*.map', '!build/**/*.manifest'],
    appDestName: 'debt.js',
    libDestName: 'libs.js',
    testDestName: 'debt.spec.js'
  }
};