require("angular").module("debtApp")
	.controller("ExpenseListCtrl", ExpenseListCtrl);

function ExpenseListCtrl($scope, $state, state) {
	
	$scope.createNew = createNew;
	$scope.viewDetails = viewDetails;
	
	init();
	
	
	function init() {
		$scope.expenses = state.balanceSheet.expenses;
	}
	
	function createNew() {
		state.balanceSheet.createExpense();
	}
	
	function viewDetails(expense) {
		$state.transitionTo("expenseDetail", {id: expense.id});
	}
}
