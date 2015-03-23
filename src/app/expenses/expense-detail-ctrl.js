require("angular").module("debtApp")
	.controller("ExpenseDetailCtrl", ExpenseDetailCtrl);

function ExpenseDetailCtrl($scope, $stateParams, balanceSheet) {
	  
  this.init = init;
  $scope.setParticipation = setParticipation;
  
	init();
	
	function init() {
		$scope.balanceSheet = balanceSheet;
		$scope.expense = balanceSheet.getExpense($stateParams.id);
		$scope.participationMap = getParticipationMap();
	};

	function getParticipationMap() {
	  var map = {};
	  var participations = $scope.expense.getParticipations();
	  
	  angular.forEach($scope.balanceSheet.persons, function(person) {
	    map[person.id] = false;
	    angular.forEach(participations, function(p) {
	      if (p.person.equals(person)) {
	        map[person.id] = true;
	      }
	    });
	  });
	  
	  return map;
	}
	
	function setParticipation(person, participates) {
	  if (participates) {
	    balanceSheet.createParticipation({expense: $scope.expense, person: person});
	  } else {
	    balanceSheet.removeParticipation({expense: $scope.expense, person: person});
	  }
	  
	  $scope.participationMap = getParticipationMap();
	}
}
