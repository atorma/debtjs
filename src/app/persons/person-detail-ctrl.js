"use strict";

var _ = require('lodash');

require("angular").module("debtApp")
	.controller("PersonDetailCtrl", PersonDetailCtrl);

function PersonDetailCtrl(balanceSheet, debtService, $state, $stateParams, $mdDialog, $log) {
  
  var vm = this;
  var confirmRemovePerson;
  
  vm.init = init;
  vm.refresh = refresh;
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
	
	function setParticipation(expense, isParticipant) {
    if (isParticipant) {
      balanceSheet.createParticipation({expense: expense, person: vm.person});
    } else {
      balanceSheet.removeParticipation({expense: expense, person: vm.person});
    }
    if (expense.sharing === 'equal') {
      expense.shareCost();
    }
    refresh();
  }
	
	function removePerson() {
	  $mdDialog.show(confirmRemovePerson)
    .then(function() {
      balanceSheet.removePerson(vm.person);
      $state.go("balanceSheet");
    });
	}
}
