require("angular").module("debtApp")
	.controller("ParticipantListCtrl", ParticipantListCtrl);

function ParticipantListCtrl($scope, $state, balanceSheet) {
	
	$scope.createNew = createNew;
	$scope.viewDetails = viewDetails;
	
	init();
	
	/////////////////////////////
	
	function init() {
		$scope.persons = balanceSheet.persons;
	}
	
	function createNew() {
	  balanceSheet.createPerson();
	}
	
	function viewDetails(person) {
		$state.transitionTo("participantDetail", {id: person.id});
	}
}
