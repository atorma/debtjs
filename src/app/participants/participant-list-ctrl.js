require("angular").module("debtApp")
	.controller("ParticipantListCtrl", ParticipantListCtrl);

function ParticipantListCtrl($scope, state) {
	
	$scope.createNew = createNew;
	$scope.viewDetails = viewDetails;
	
	init();
	
	/////////////////////////////
	
	function init() {
		$scope.persons = state.balanceSheet.persons;
	}
	
	function createNew() {
		state.balanceSheet.createPerson();
	}
	
	function viewDetails(person) {
		state.selectedPerson = person;
		$scope.app.navi.pushPage("participants/participant-detail.html");
	}
}
