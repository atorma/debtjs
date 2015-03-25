require("angular").module("debtApp")
	.controller("ExpenseDetailCtrl", ExpenseDetailCtrl);

function ExpenseDetailCtrl(balanceSheet, $scope, $mdDialog, $stateParams, $state) {
  var confirmRemoveExpense;
  
  this.init = init;
  
  $scope.setParticipation = setParticipation;
  $scope.shareCost = shareCost;
  $scope.removeExpense = removeExpense;
  
	init();
	
	/////////////////////////////////////////////////////////////
	
	function init() {
		$scope.balanceSheet = balanceSheet;
		$scope.expense = balanceSheet.getExpense($stateParams.id);
		$scope.isParticipant = getParticipationMap();
		
		confirmRemoveExpense = $mdDialog.confirm()
    .content("Really delete this expense?")
    .ok("Ok").cancel("Cancel");
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
	
	function setParticipation(person, isParticipant) {
	  if (isParticipant) {
	    balanceSheet.createParticipation({expense: $scope.expense, person: person});
	  } else {
	    balanceSheet.removeParticipation({expense: $scope.expense, person: person});
	  }
	  shareCost();
	}
	
	function shareCost() {
	  if ($scope.expense.sharing === 'equal') {
	    $scope.expense.shareCost();
	  }
	}
	
	function removeExpense() {
	  $mdDialog.show(confirmRemoveExpense)
	  .then(function() {
      balanceSheet.removeExpense($scope.expense);
      $state.go("expenseList");
    });
	}
}
