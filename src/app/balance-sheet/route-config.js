"use strict";

require("angular").module("debtApp")
  .config(config);

function config($stateProvider) {

  $stateProvider
    .state("balanceSheet", {
      url: "/",
      templateUrl : "balance-sheet/balance-sheet.html",
      controller : "BalanceSheetCtrl",
      resolve: {
        balanceSheet : function(balanceSheetService) {
          return balanceSheetService.balanceSheet;
        }
      }
    });
  
}