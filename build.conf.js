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
    jsSpecsMain: [p('src/app/spec-index.js')],
    indexHtml: p('src/app/index.html'),
    build: p('build')
  }
};