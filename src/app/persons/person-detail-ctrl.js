"use strict";

require("angular").module("debtApp")
	.controller("PersonDetailCtrl", PersonDetailCtrl);

function PersonDetailCtrl(balanceSheet, debtService, $state, $stateParams, $mdDialog) {
  
  var vm = this;
  var confirmRemovePerson;
  
  vm.init = init;
  vm.removePerson = removePerson;
	
	init();
	
	function init() {
		vm.person = balanceSheet.getPerson($stateParams.id);
		vm.balanceSheet = balanceSheet;
		
		confirmRemovePerson = $mdDialog.confirm()
    .content("Deleting removes this person from all expenses and can change their costs and balances. Go ahead with deleting?")
    .ok("Ok").cancel("Cancel");
	}
	
	function removePerson() {
	  $mdDialog.show(confirmRemovePerson)
    .then(function() {
      balanceSheet.removePerson(vm.person);
      $state.go("balanceSheet");
    });
	}
}
