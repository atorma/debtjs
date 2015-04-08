"use strict";

require("angular").module("debtApp")
	.controller("PersonListCtrl", PersonListCtrl);

function PersonListCtrl($scope, $state, balanceSheet) {
	
	$scope.createNew = createNew;
	
	init();
	
	/////////////////////////////
	
	function init() {
		$scope.persons = balanceSheet.persons;
	}
	
	function createNew() {
	  balanceSheet.createPerson();
	}
}
