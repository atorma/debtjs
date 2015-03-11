require("angular").module("debtApp")
	.controller("ParticipantDetailCtrl", ParticipantDetailCtrl);

function ParticipantDetailCtrl($scope, $stateParams, state) {
	
	init();
	
	function init() {
		$scope.person = state.balanceSheet.getPerson($stateParams.id);
	}
	
}
