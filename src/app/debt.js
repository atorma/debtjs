"use strict";

require("./appcache-reload");

var angular = require("angular");
require("angular-material");
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

  var iconFiles = [
    'ic_add_24px.svg',
    'ic_attach_money_24px.svg',
    'ic_chevron_right_24px.svg',
    'ic_close_24px.svg',
    'ic_delete_24px.svg',
    'ic_face_24px.svg',
    'ic_home_24px.svg',
    'ic_more_vert_24px.svg',
    'ic_shopping_basket_24px.svg',
    'ic_warning_24px.svg'
  ];
  
  var iconProps = _.map(iconFiles, function(fileName) {
    var iconName = fileName.substr(0, fileName.indexOf('.'));
    return {
      filePath: 'resources/icons/' + fileName,
      iconName: iconName
    };
  });

  _.each(iconProps, function(prop) {
    $mdIconProvider.icon(prop.iconName, prop.filePath);
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