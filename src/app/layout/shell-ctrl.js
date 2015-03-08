require("angular").module("debtApp")
	.controller("ShellCtrl", ShellCtrl);

var BalanceSheet = require("../balance-sheet");

function ShellCtrl($scope) {
	$scope.balanceSheet = new BalanceSheet();
	
	$scope.balanceSheet.createPerson({name: "Anssi"});
	$scope.balanceSheet.createPerson({name: "Malla"});
	$scope.balanceSheet.createExpense({name: "Pesukone"});
	$scope.balanceSheet.createExpense({name: "TV"});
}
