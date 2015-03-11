require("angular").module("debtApp")
	.controller("ParticipantListCtrl", ParticipantListCtrl);

function ParticipantListCtrl($scope, $state, state, $q) {
	
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
		$state.transitionTo("participantDetail", {id: person.id});
	}
}
