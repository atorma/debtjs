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
    .config(function(localStorageServiceProvider) {
      localStorageServiceProvider.setPrefix("debtApp");
    });

require("./route-config");
require("./debts");
require("./balance-sheet");
require("./participants");
require("./expenses");