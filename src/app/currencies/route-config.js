"use strict";

var angular = require("angular");
var currenciesTpl = require("./currencies.html");
var floatingButtonTpl = require("./floating-button.html");

angular.module("debtApp")
  .config(config);

function config($stateProvider) {

  $stateProvider
    .state("currencies", {
      url: "/currencies",
      views: {
        "": {
          controller: "CurrencyListCtrl as vm",
          templateUrl: currenciesTpl
        },
        "floatingButton": {
          controller: "CurrencyListCtrl as vm",
          templateUrl: floatingButtonTpl
        }
      }
    })
  ;
  
}