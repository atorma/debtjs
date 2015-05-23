"use strict";

var _ = require("lodash");
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
      var participations = vm.balanceSheet.getNonSettledParticipations();
      var debts = debtService.computeDebts(participations);
      return debtService.organizeByDebtor(debts);
    } else {
      return undefined;
    }
  }
}