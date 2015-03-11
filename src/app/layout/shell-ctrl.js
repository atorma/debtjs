require("angular").module("debtApp")
	.controller("ShellCtrl", ShellCtrl);

function ShellCtrl($mdSidenav, $state, $scope) {
	$scope.showParticipantList = showParticipantList;
	$scope.showExpenseList = showExpenseList;
	
	function showParticipantList() {
		$state.transitionTo("participantList");
	}
		
	function showExpenseList() {
		$state.transitionTo("expenseList");
	}
}