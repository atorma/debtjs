"use strict";

require("./appcache-reload");

var angular = require("angular");
require("angular-material");
require("angular-route");
require("angular-ui-router");
require("angular-local-storage");
require("ng-file-upload");

var _ = require("lodash");

angular
  .module("debtApp", ["ngMaterial", "ui.router", "LocalStorageModule", "ngFileUpload"])
  .constant("events", {
    BALANCE_SHEET_UPDATED: "balance sheet updated",
    ERROR: "error"
  })
  .constant("debtCalculationInterval", 500)
  .config(configureLocalStorage)
  .config(configureIcons)
  .config(hrefSanitization)
  .config(decorateExceptionHandler)
  .run(makeStateAvailableInScope)
  .run(makeMdMediaAvailableInScope)
;

require("./debt-app-ctrl");
require("./route-config");
require("./debts");
require("./balance-sheet");
require("./persons");
require("./expenses");
require("./utils");
require("./currencies");

var CurrencyConversionError = require("./balance-sheet/currency-conversion-error");

function configureLocalStorage(localStorageServiceProvider) {
  localStorageServiceProvider.setPrefix("debtApp");
}

function configureIcons($mdIconProvider) {
  
  var spriteNames = ['action', 'alert', 'content', 'navigation', 'editor'];
  
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
  $compileProvider.aHrefSanitizationWhitelist(/^(blob||https?):/);
}

function decorateExceptionHandler($provide, events) {
  $provide.decorator('$exceptionHandler', function($delegate, $log, $injector) {
    return function(exception, cause) {
      $delegate(exception, cause);

      var $rootScope = $injector.get('$rootScope');
      $rootScope.$broadcast(events.ERROR, exception, cause);

      if (exception instanceof CurrencyConversionError) {
        var $state = $injector.get('$state');
        $state.go("currencies");
      }

    };
  });
}

// Injection of $state may trigger a GET, which can show as an 
// "Unexpected request" error in your test. Workaround is to 
// $provide a mock $state to Angular.
function makeStateAvailableInScope($rootScope, $state, $stateParams) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
}

function makeMdMediaAvailableInScope($rootScope, $mdMedia) {
  $rootScope.$mdMedia = $mdMedia;
}