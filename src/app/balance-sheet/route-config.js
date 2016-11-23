"use strict";

var angular = require("angular");
var balanceSheetTpl = require("./balance-sheet.html");
var floatingButtonTpl = require("./floating-button.html");

angular.module("debtApp")
  .config(config);

function config($stateProvider) {

  $stateProvider
    .state("balanceSheet", {
      url: "/",
      views: {
        "": {
          templateUrl : balanceSheetTpl,
          controller : "BalanceSheetCtrl as vm"
        },
        "floatingButton": {
          templateUrl : floatingButtonTpl
        }
      }
    });
  
}