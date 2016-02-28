"use strict";

var angular = require("angular");

angular.module("debtApp")
  .config(config);

function config($stateProvider) {

  $stateProvider
    .state("currencies", {
      url: "/currencies",
      views: {
        "": {
          controller: "CurrencyListCtrl as vm",
          templateUrl: "currencies/currencies.html"
        }
      }
    })
  ;
  
}