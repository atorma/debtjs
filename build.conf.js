module.exports = {
  paths: {
    jsMain: 'src/app/debt.js',
    jsSrc: 'src/app/**/*.js',
    jsSpecs: 'src/app/**/*.spec.js',
    html: ['src/app/**/*.html', '!src/app/**/*.spec.html'],
    resources: ['src/resources/**'],
    libResources: ['node_modules/angular-material/angular-material.css', 'node_modules/ng-material-floating-button/mfb/dist/mfb.css*', 'src/lib/**/*.*', '!src/lib/**/*.js'],
    build: 'build',
    manifestFiles: ['build/**/*', '!build/**/*.spec.*', '!build/**/*.map', '!build/**/*.manifest'],
    appDestName: 'debt.js',
    libDestName: 'libs.js',
    testDestName: 'debt.spec.js'
  }
};