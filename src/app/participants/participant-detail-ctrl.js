require("angular").module("debtApp")
	.controller("ParticipantDetailCtrl", ParticipantDetailCtrl);

function ParticipantDetailCtrl($scope, state) {
	
	init();
	
	
	function init() {
		$scope.person = state.selectedPerson;
	}
	
}
