require("angular").module("debtApp")
	.controller("ExpenseListCtrl", ExpenseListCtrl);

function ExpenseListCtrl($scope) {
	alert($scope.balanceSheet.expenses.length);
}
