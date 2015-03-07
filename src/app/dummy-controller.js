require("angular").module("debtApp")
	.controller("DummyCtrl", DummyCtrl);

function DummyCtrl(dummyService, $scope) {
	$scope.greeting = "Hello";
	
}
