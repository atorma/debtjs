"use strict";

require("angular").module("debtApp")
	.controller("ExpenseDetailCtrl", ExpenseDetailCtrl);

function ExpenseDetailCtrl(balanceSheet, debtService, $scope, $mdDialog, $stateParams, $state) {
  var confirmRemoveExpense;
  
  this.init = init;
  
  $scope.setParticipation = setParticipation;
  $scope.refresh = refresh;
  $scope.removeExpense = removeExpense;
  $scope.setAllParticipations = setAllParticipations;
  
	init();
	
	/////////////////////////////////////////////////////////////
	
	function init() {
		$scope.balanceSheet = balanceSheet;
		$scope.expense = balanceSheet.getExpense($stateParams.id);
		$scope.isParticipant = {};
		$scope.everyoneParticipates = true;
		refresh();

		confirmRemoveExpense = $mdDialog.confirm()
    .content("Really delete this expense?")
    .ok("Ok").cancel("Cancel");
	};
	
	function refresh() {
    if ($scope.expense.sharing === 'equal') {
      $scope.expense.shareCost();
    }
    $scope.isParticipant = getParticipationMap();
    $scope.isEveryoneParticipant = isEveryoneParticipant();
    $scope.debtsByDebtor = computeDebts();
    $scope.cost = $scope.expense.getCost();
    $scope.sumOfShares = $scope.expense.getSumOfShares();
  }

	function getParticipationMap() {
	  var map = {};
	  
	  angular.forEach($scope.balanceSheet.persons, function(person) {
	    map[person.id] = false;
	    angular.forEach($scope.expense.getParticipations(), function(p) {
	      if (p.person.equals(person)) {
	        map[person.id] = true;
	      }
	    });
	  });
	  
	  return map;
	}
	
	function isEveryoneParticipant() {
	  var result = true;
    angular.forEach($scope.isParticipant, function(value) {
      if (value === false) {
        result = false;
      }
    });
    return result;
	}
	
	function setParticipation(person, isParticipant) {
	  if (isParticipant) {
	    balanceSheet.createParticipation({expense: $scope.expense, person: person});
	  } else {
	    balanceSheet.removeParticipation({expense: $scope.expense, person: person});
	  }
	  refresh();
	}
	
	function setAllParticipations(value) {
    angular.forEach(balanceSheet.persons, function(p) {
      if (value === true) {
        var data = {expense: $scope.expense, person: p};
        if (!balanceSheet.getParticipation(data)) {
          balanceSheet.createParticipation(data);
        }
      } else {
        balanceSheet.removeParticipation({expense: $scope.expense, person: p});
      }
    });
    refresh();
  }

	function removeExpense() {
	  $mdDialog.show(confirmRemoveExpense)
	  .then(function() {
      balanceSheet.removeExpense($scope.expense);
      $state.go("balanceSheet");
    });
	}
	
	function computeDebts() {
	  if (!$scope.expense.isBalanced()) {
	    return [];
	  }
	 
	  var debts = debtService.computeDebts($scope.expense.getParticipations());
	  return debtService.organizeByDebtor(debts);
	}

	
	
	
}
