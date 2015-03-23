require("angular").module("debtApp")
	.controller("ExpenseListCtrl", ExpenseListCtrl);

function ExpenseListCtrl($scope, $state, balanceSheet) {
	
	$scope.createNew = createNew;
	$scope.viewDetails = viewDetails;
	
	init();
	
	
	function init() {
		$scope.expenses = balanceSheet.expenses;
	}
	
	function createNew() {
	  balanceSheet.createExpense();
	}
	
	function viewDetails(expense) {
		$state.transitionTo("expenseDetail", {id: expense.id});
	}
}
