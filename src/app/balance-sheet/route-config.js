"use strict";

var angular = require("angular");

angular.module("debtApp")
  .config(config);

function config($stateProvider) {

  $stateProvider
    .state("balanceSheet", {
      url: "/",
      templateUrl : "balance-sheet/balance-sheet.html",
      controller : "BalanceSheetCtrl as vm"
    });
  
}