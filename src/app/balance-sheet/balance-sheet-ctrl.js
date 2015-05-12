"use strict";

var angular = require("angular");

angular.module("debtApp")
  .controller("BalanceSheetCtrl", BalanceSheetCtrl);

function BalanceSheetCtrl(balanceSheetService, debtService, $scope) {
  var vm = this;
  
  vm.init = init;
  vm.refresh = refresh;
  
  init();
  
  /////////////////////////////////////////////////////////////
  
  function init() {
    vm.balanceSheet = balanceSheetService.balanceSheet;
    refresh();
    
    $scope.$on("balanceSheetUpdated", vm.refresh);
  }
  
  function refresh() {
    vm.debtsByDebtor = computeDebts();
  }
  
  function computeDebts() {
    if (vm.balanceSheet.isBalanced()) {
      var debts = debtService.computeDebts(vm.balanceSheet.participations);
      return debtService.organizeByDebtor(debts);
    } else {
      return undefined;
    }
  }
}