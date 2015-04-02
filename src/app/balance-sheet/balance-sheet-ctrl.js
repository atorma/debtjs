"use strict";

require("angular").module("debtApp")
  .controller("BalanceSheetCtrl", BalanceSheetCtrl);

function BalanceSheetCtrl(balanceSheet, solveDebts, $scope) {
  
  this.init = init;
  
  init();
  
  /////////////////////////////////////////////////////////////
  
  function init() {
    $scope.balanceSheet = balanceSheet;
    refresh();
  };
  
  function refresh() {

  }
}