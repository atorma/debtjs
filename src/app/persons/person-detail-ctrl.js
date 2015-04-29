"use strict";

var _ = require('lodash');

require("angular").module("debtApp")
	.controller("PersonDetailCtrl", PersonDetailCtrl);

function PersonDetailCtrl(balanceSheet, debtService, $state, $stateParams, $mdDialog, $log) {
  
  var vm = this;
  var confirmRemovePerson;
  
  vm.init = init;
  vm.refresh = refresh;
  vm.updateExpense = updateExpense;
  vm.setParticipation = setParticipation;
  vm.removePerson = removePerson;
	
	init();
	
	function init() {
		vm.person = balanceSheet.getPerson($stateParams.id);
		vm.balanceSheet = balanceSheet;
		refresh();
		
		confirmRemovePerson = $mdDialog.confirm()
    .content("Deleting removes this person from all expenses and can change their costs and balances. Go ahead with deleting?")
    .ok("Ok").cancel("Cancel");
	}
	
	function refresh() {
    vm.isParticipant = getParticipationMap();
    vm.cost = vm.person.getCost();
    vm.sumOfShares = vm.person.getSumOfShares();
    vm.balance = vm.person.getBalance();
    var debtResult = computeDebts();
    vm.debtRole = debtResult.role;
    vm.debts = debtResult.debts;
  }
	
	function getParticipationMap() {
    var map = {};
    
    _.forEach(balanceSheet.expenses, function(expense) {
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
	  if (expense.sharing === 'equal') {
      expense.shareCost();
    }
    refresh();
	}
	
	function setParticipation(expense, isParticipant) {
    if (isParticipant) {
      balanceSheet.createParticipation({expense: expense, person: vm.person});
    } else {
      balanceSheet.removeParticipation({expense: expense, person: vm.person});
    }
    vm.updateExpense(expense);
  }
	
	function computeDebts() {
	  var result = {
	      role: undefined,
	      debts: undefined
	  };
	  
	  if (!balanceSheet.isBalanced()) {
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
        
    var debts = debtService.computeDebts(balanceSheet.participations);
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
    .then(function() {
      var participations = vm.person.getParticipations();
      balanceSheet.removePerson(vm.person);
      _.each(participations, function(pt) {
          vm.updateExpense(pt.expense);
      });
      $state.go("balanceSheet");
    });
	}
}
