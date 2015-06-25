"use strict";

var angular = require("angular");
var _ = require('lodash');

angular.module("debtApp")
  .controller("PersonDetailCtrl", PersonDetailCtrl);

function PersonDetailCtrl(balanceSheetService,
                          debtService,
                          events,
                          debtCalculationInterval,
                          $state,
                          $stateParams,
                          $mdDialog,
                          $scope)
{

  var vm = this;
  var confirmRemovePerson;

  var computeDebtsDebounced = _.debounce(function() {
    var debtResult = computeDebts();
    vm.debtRole = debtResult.role;
    vm.debts = debtResult.debts;
    $scope.$digest();
  }, debtCalculationInterval);

  vm.init = init;
  vm.refresh = refresh;
  vm.updateExpense = updateExpense;
  vm.setParticipation = setParticipation;
  vm.removePerson = removePerson;
  vm.updatePerson = updatePerson;

  init();

  function init() {
    vm.balanceSheet = balanceSheetService.balanceSheet;
    vm.person = vm.balanceSheet.getPerson($stateParams.id);

    refresh();

    confirmRemovePerson = $mdDialog.confirm()
      .content("Really delete this person?")
      .ok("Ok").cancel("Cancel");

    $scope.$on(events.BALANCE_SHEET_UPDATED, vm.refresh);
  }

  function refresh() {
    vm.isParticipant = getParticipationMap();
    vm.cost = vm.person.getCost();
    vm.sumOfShares = vm.person.getSumOfShares();
    vm.balance = vm.person.getBalance();
    computeDebtsDebounced();
  }

  function getParticipationMap() {
    var map = {};

    _.forEach(vm.balanceSheet.expenses, function(expense) {
      map[expense.id] = false;
      _.forEach(vm.person.getParticipations(), function(pt) {
        if (pt.expense.equals(expense)) {
          map[expense.id] = true;
        }
      });
    });

    return map;
  }

  function updateExpense(expense) {
    expense.shareCost();
    refresh();
    $scope.$emit(events.BALANCE_SHEET_UPDATED);
  }

  function setParticipation(expense, isParticipant) {
    if (isParticipant) {
      vm.balanceSheet.createParticipation({expense: expense, person: vm.person});
    } else {
      vm.balanceSheet.removeParticipation({expense: expense, person: vm.person});
    }
    vm.updateExpense(expense);
  }

  function computeDebts() {
    var result = {
      role: undefined,
      debts: undefined
    };

    if (!vm.balanceSheet.isBalanced()) {
      result.role = "unbalanced";
      return result;
    }

    if (vm.balance > 0) {
      result.role = "debtor";
    } else if (vm.balance < 0) {
      result.role = "creditor";
    } else {
      result.role = "settled";
      return result;
    }

    var counterRole = {
      "debtor": "creditor",
      "creditor": "debtor"
    };

    var debts = debtService.computeDebts(vm.balanceSheet.getNonSettledParticipations());
    result.debts = _.chain(debts)
      .filter(function(d) {
        return d[result.role].equals(vm.person);
      })
      .map(function(d) {
        return {person: d[counterRole[result.role]], amount: d.amount};
      })
      .value();

    return result;
  }

  function removePerson() {
    $mdDialog.show(confirmRemovePerson)
      .then(doRemovePerson);
  }

  function doRemovePerson() {
    vm.balanceSheet.removePerson(vm.person);
    $scope.$emit(events.BALANCE_SHEET_UPDATED);
    $state.go("balanceSheet");
  }

  function updatePerson() {
    $scope.$emit(events.BALANCE_SHEET_UPDATED);
  }
}
