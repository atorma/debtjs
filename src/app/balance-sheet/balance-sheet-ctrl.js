"use strict";

require("angular").module("debtApp")
  .controller("BalanceSheetCtrl", BalanceSheetCtrl);

function BalanceSheetCtrl(balanceSheet, debtService, $scope) {
  
  this.init = init;
  
  $scope.refresh = refresh;
  
  init();
  
  /////////////////////////////////////////////////////////////
  
  function init() {
    $scope.balanceSheet = balanceSheet;
    refresh();
  };
  
  function refresh() {
    $scope.debtsByDebtor = computeDebts();
  }
  
  function computeDebts() {
    var debts = debtService.computeDebts(balanceSheet.participations);
    return debtService.organizeByDebtor(debts);
  }
}