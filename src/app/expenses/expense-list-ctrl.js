"use strict";

require("angular").module("debtApp")
	.controller("ExpenseListCtrl", ExpenseListCtrl);

function ExpenseListCtrl($scope, balanceSheet) {
	
	$scope.createNew = createNew;
	
	init();
	
	
	function init() {
		$scope.expenses = balanceSheet.expenses;
	}
	
	function createNew() {
	  balanceSheet.createExpense();
	}
}
