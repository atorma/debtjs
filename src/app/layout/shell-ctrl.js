"use strict";

require("angular").module("debtApp")
	.controller("ShellCtrl", ShellCtrl);

function ShellCtrl($mdSidenav, $state, $scope) {
  $scope.showBalanceSheet = showBalanceSheet;
	$scope.showParticipantList = showParticipantList;
	$scope.showExpenseList = showExpenseList;
	
	function showBalanceSheet() {
    $state.transitionTo("balanceSheet");
  }
	
	function showParticipantList() {
		$state.transitionTo("participantList");
	}
		
	function showExpenseList() {
		$state.transitionTo("expenseList");
	}
}