require("angular").module("debtApp")
	.controller("ExpenseListCtrl", ExpenseListCtrl);

function ExpenseListCtrl($scope, state) {
	
	init();
	
	
	function init() {
		$scope.expenses = state.balanceSheet.expenses;
	}
}
