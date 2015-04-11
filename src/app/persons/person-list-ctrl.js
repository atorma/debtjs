"use strict";

require("angular").module("debtApp")
	.controller("PersonListCtrl", PersonListCtrl);

function PersonListCtrl($scope, $state, balanceSheet) {
		
	init();
	
	/////////////////////////////
	
	function init() {
		$scope.persons = balanceSheet.persons;
	}
	
}
