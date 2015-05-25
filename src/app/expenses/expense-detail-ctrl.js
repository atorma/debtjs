"use strict";

var _ = require('lodash');
var angular = require("angular");

angular
  .module("debtApp")
    .controller("ExpenseDetailCtrl", ExpenseDetailCtrl);

function ExpenseDetailCtrl(balanceSheetService, debtService, events, $mdDialog, $stateParams, $state, $scope) {
  var vm = this;
  var confirmRemoveExpense;
  
  vm.init = init;
  vm.setParticipation = setParticipation;
  vm.refresh = refresh;
  vm.removeExpense = removeExpense;
  
	init();
	
	/////////////////////////////////////////////////////////////
	
	function init() {
		vm.balanceSheet = balanceSheetService.balanceSheet;
		vm.expense = vm.balanceSheet.getExpense($stateParams.id);
		vm.isParticipant = {};
		vm.everyoneParticipates = true;
		refresh();

		confirmRemoveExpense = $mdDialog.confirm()
    .content("Really delete this expense?")
    .ok("Ok").cancel("Cancel");
		
		$scope.$on(events.BALANCE_SHEET_UPDATED, vm.refresh);
	}
	
	function refresh() {
    vm.expense.shareCost();
    vm.isParticipant = getParticipationMap();
    vm.debtsByDebtor = computeDebts();
    vm.cost = vm.expense.getCost();
    vm.sumOfShares = vm.expense.getSumOfShares();
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
	  refresh();
	}
	
	function removeExpense() {
	  $mdDialog.show(confirmRemoveExpense)
	  .then(function() {
      vm.balanceSheet.removeExpense(vm.expense);
      $state.go("balanceSheet");
    });
	}
	
	function computeDebts() {
	  if (!vm.expense.isBalanced()) {
	    return [];
	  }
	 
	  var debts = debtService.computeDebts(vm.expense.getParticipations());
	  return debtService.organizeByDebtor(debts);
	}

	
	
	
}
