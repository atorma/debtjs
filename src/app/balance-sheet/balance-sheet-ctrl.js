"use strict";

require("angular").module("debtApp")
  .controller("BalanceSheetCtrl", BalanceSheetCtrl);

function BalanceSheetCtrl(balanceSheet, debtService, $scope) {
  var vm = this;
  
  vm.init = init;
  vm.refresh = refresh;
  
  init();
  
  /////////////////////////////////////////////////////////////
  
  function init() {
    vm.balanceSheet = balanceSheet;
    refresh();
    
    $scope.$on("balanceSheetUpdated", vm.refresh);
  }
  
  function refresh() {
    vm.debtsByDebtor = computeDebts();
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