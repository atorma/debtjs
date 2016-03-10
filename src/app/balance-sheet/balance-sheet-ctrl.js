"use strict";

var _ = require("lodash");
var angular = require("angular");

angular.module("debtApp")
  .controller("BalanceSheetCtrl", BalanceSheetCtrl);

function BalanceSheetCtrl(balanceSheetService, debtService, events, $scope) {
  var vm = this;
  
  vm.init = init;
  vm.refresh = refresh;
  vm.updateSheet = updateSheet;
  
  init();
  
  /////////////////////////////////////////////////////////////
  
  function init() {
    refresh();
    $scope.$on(events.BALANCE_SHEET_UPDATED, vm.refresh);
  }
  
  function refresh() {
    vm.balanceSheet = balanceSheetService.balanceSheet;
    vm.debtsByDebtor = computeDebts();
  }
  
  function computeDebts() {
    if (vm.balanceSheet.isBalanced()) {
      var participations = vm.balanceSheet.getNonSettledParticipations();
      var debts = debtService.computeDebts(participations, vm.balanceSheet.currency);
      return debtService.organizeByDebtor(debts);
    } else {
      return undefined;
    }
  }

  function updateSheet() {
    $scope.$emit(events.BALANCE_SHEET_UPDATED);
  }
}