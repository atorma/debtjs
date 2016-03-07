"use strict";

var _ = require('lodash');
var angular = require("angular");

angular
  .module("debtApp")
  .controller("ExpenseDetailCtrl", ExpenseDetailCtrl);

function ExpenseDetailCtrl(balanceSheetService,
                           debtService,
                           events,
                           debounce,
                           debtCalculationInterval,
                           $mdDialog,
                           $stateParams,
                           $state,
                           $scope,
                           $timeout)
{
  var vm = this;

  var confirmRemoveExpense = $mdDialog.confirm()
    .content("Really delete this expense?")
    .ok("Ok").cancel("Cancel");

  var computeDebtsDebounced = debounce(function() {
    $timeout(function() {
      vm.debtsByDebtor = computeDebts();
    });
  }, debtCalculationInterval);

  vm.init = init;
  vm.setParticipation = setParticipation;
  vm.updateExpense = updateExpense;
  vm.removeExpense = removeExpense;
  vm.updateExpenseCurrency = updateExpenseCurrency;

  init();

  /////////////////////////////////////////////////////////////

  function init() {
    vm.balanceSheet = balanceSheetService.balanceSheet;
    vm.expense = vm.balanceSheet.getExpense($stateParams.id);
    vm.isParticipant = {};
    vm.everyoneParticipates = true;
    updateExpense();

    $scope.$on(events.BALANCE_SHEET_UPDATED, function(event) {
      if (event.targetScope != $scope) {
        vm.updateExpense();
      }
    });
  }

  function updateExpense() {
    vm.expense.shareCost();
    vm.isParticipant = getParticipationMap();
    vm.cost = vm.expense.getCost();
    vm.sumOfShares = vm.expense.getSumOfShares();
    $scope.$emit(events.BALANCE_SHEET_UPDATED);
    computeDebtsDebounced();
  }

  function getParticipationMap() {
    var map = {};

    angular.forEach(vm.balanceSheet.persons, function(person) {
      map[person.id] = false;
      angular.forEach(vm.expense.getParticipations(), function(p) {
        if (p.person.equals(person)) {
          map[person.id] = true;
        }
      });
    });

    return map;
  }

  function setParticipation(person, isParticipant) {
    if (isParticipant) {
      vm.balanceSheet.createParticipation({expense: vm.expense, person: person});
    } else {
      vm.balanceSheet.removeParticipation({expense: vm.expense, person: person});
    }
    updateExpense();
  }

  function removeExpense() {
    $mdDialog.show(confirmRemoveExpense)
      .then(doRemoveExpense);
  }

  function doRemoveExpense() {
    vm.balanceSheet.removeExpense(vm.expense);
    $scope.$emit(events.BALANCE_SHEET_UPDATED);
    $state.go("balanceSheet");
  }

  function computeDebts() {
    if (vm.expense.isBalanced()) {
      var debts = debtService.computeDebts(vm.expense.getParticipations());
      return debtService.organizeByDebtor(debts);
    }
  }

  function updateExpenseCurrency(currency) {
    vm.expense.currency = currency;
    updateExpense();
  }


}
