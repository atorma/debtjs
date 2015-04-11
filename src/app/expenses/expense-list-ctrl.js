"use strict";

require("angular").module("debtApp")
	.controller("ExpenseListCtrl", ExpenseListCtrl);

function ExpenseListCtrl($scope, balanceSheet) {

	init();
	
	function init() {
		$scope.expenses = balanceSheet.expenses;
	}

}
