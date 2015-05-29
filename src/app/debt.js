"use strict";

var angular = require("angular");
require("angular-material");
require("angular-animate");
require("angular-aria");
require("angular-route");
require("angular-ui-router");
require("angular-local-storage");
require("ng-mfb");

var _ = require("lodash");

angular
  .module("debtApp", ["ngMaterial", "ui.router", "LocalStorageModule", "ng-mfb"])
  .constant("events", {
    BALANCE_SHEET_UPDATED: "balance sheet updated"
  })
  .config(configureLocalStorage)
  .config(configureIcons)
  .config(hrefSanitization)
  .run(makeStateAvailableInScope);

require("./debt-app-ctrl");
require("./route-config");
require("./debts");
require("./balance-sheet");
require("./persons");
require("./expenses");
require("./layout");


function configureLocalStorage(localStorageServiceProvider) {
  localStorageServiceProvider.setPrefix("debtApp");
}

function configureIcons($mdIconProvider) {
  
  var spriteNames = ['action', 'alert', 'content', 'navigation'];
  
  var spriteProps = _.map(spriteNames, function(name) {
    var fileName = 'svg-sprite-' + name + '.svg';
    return {
      filePath: 'resources/icons/' + fileName,
      spriteName: name
    };
  });

  _.each(spriteProps, function(prop) {
    $mdIconProvider.iconSet(prop.spriteName, prop.filePath);
  });

}

function hrefSanitization($compileProvider) {
  $compileProvider.aHrefSanitizationWhitelist(/^(blob||https?||mailto):/);
}

// Injection of $state may trigger a GET, which can show as an 
// "Unexpected request" error in your test. Workaround is to 
// $provide a mock $state to Angular.
function makeStateAvailableInScope($rootScope, $state, $stateParams) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
}
