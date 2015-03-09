require("angular").module("debtApp")
	.controller("ParticipantListCtrl", ParticipantListCtrl);

function ParticipantListCtrl($scope) {

	$scope.createNew = createNew;
	
	function createNew() {
		var person = $scope.balanceSheet.createPerson();
	}
}
