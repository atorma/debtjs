require("angular").module("debtApp")
	.controller("ExpenseDetailCtrl", ExpenseDetailCtrl);

function ExpenseDetailCtrl($scope, $stateParams, balanceSheet) {
	
	init();
	
	function init() {
		$scope.balanceSheet = balanceSheet;
		$scope.expense = balanceSheet.getExpense($stateParams.id);
	}

}
