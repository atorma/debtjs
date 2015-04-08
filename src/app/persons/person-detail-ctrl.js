"use strict";

require("angular").module("debtApp")
	.controller("PersonDetailCtrl", PersonDetailCtrl);

function PersonDetailCtrl($scope, $stateParams, balanceSheet) {
	
	init();
	
	function init() {
		$scope.person = balanceSheet.getPerson($stateParams.id);
	}
	
}
