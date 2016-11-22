'use strict';

var joinPath = require('path').join;

function p(relPath) {
  return joinPath(__dirname, relPath);
}

module.exports = {
  paths: {
    jsMain: [p('src/app/debt.js')],
    jsAll: [p('src/app/**/*.js')],
    jsSpecs: [p('src/app/**/*.spec.js')],
    html: [p('src/app/**/*.html'), '!src/app/**/*.spec.html'],
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