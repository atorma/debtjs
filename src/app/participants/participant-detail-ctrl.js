"use strict";

require("angular").module("debtApp")
	.controller("ParticipantDetailCtrl", ParticipantDetailCtrl);

function ParticipantDetailCtrl($scope, $stateParams, balanceSheet) {
	
	init();
	
	function init() {
		$scope.person = balanceSheet.getPerson($stateParams.id);
	}
	
}
