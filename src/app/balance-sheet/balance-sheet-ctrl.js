"use strict";

var angular = require("angular");

angular.module("debtApp")
  .controller("BalanceSheetCtrl", BalanceSheetCtrl);

function BalanceSheetCtrl(balanceSheetService, debtService, events, $scope, $log, $state) {
  var vm = this;
  
  vm.init = init;
  vm.refresh = refresh;
  vm.updateSheet = updateSheet;
  
  init();
  
  /////////////////////////////////////////////////////////////
  
  function init() {
    refresh();
    $scope.$on(events.BALANCE_SHEET_UPDATED, vm.refresh);
    $scope.$on(events.EXPENSE_CREATED, function (event, expense) {
      $state.go('expense', {id: expense.id});
    });
  }
  
  function refresh() {
    vm.balanceSheet = balanceSheetService.balanceSheet;
    try {
      vm.debtsByDebtor = computeDebts();
      vm.debtComputationError = undefined;
    } catch (e) {
      $log.error(e);
      vm.debtsByDebtor = undefined;
      vm.debtComputationError = "Cannot compute debts";
    }
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