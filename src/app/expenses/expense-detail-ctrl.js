require("angular").module("debtApp")
	.controller("ExpenseDetailCtrl", ExpenseDetailCtrl);

function ExpenseDetailCtrl($scope, $stateParams, state) {
	
	init();
	
	function init() {
		$scope.expense = state.balanceSheet.getExpense($stateParams.id);
		$scope.participants = state.balanceSheet.persons;
	}

}
