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
    
    $scope.$on("balanceSheetUpdated", $scope.refresh);
  }
  
  function refresh() {
    $scope.debtsByDebtor = computeDebts();
  }
  
  function computeDebts() {
    if (balanceSheet.isBalanced()) {
      var debts = debtService.computeDebts(balanceSheet.participations);
      return debtService.organizeByDebtor(debts);
    } else {
      return undefined;
    }
  }
}