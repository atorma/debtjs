"use strict";

var angular = require("angular");
require("angular-material");
require("angular-animate");
require("angular-aria");
require("angular-route");
require("angular-ui-router");
require("angular-local-storage");

angular
  .module("debtApp", ["ngMaterial", "ui.router", "LocalStorageModule"])
    .config(configureLocalStorage)
    .run(makeStateAvailableInScope)
    ;

require("./route-config");
require("./debts");
require("./balance-sheet");
require("./persons");
require("./expenses");


function configureLocalStorage(localStorageServiceProvider) {
  localStorageServiceProvider.setPrefix("debtApp");
}

// Injection of $state may trigger a GET, which can show as an 
// "Unexpected request" error in your test. Workaround is to 
// $provide a mock $state to Angular.
function makeStateAvailableInScope($rootScope, $state, $stateParams) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
}
