require("angular").module("debtApp")
	.controller("ExpenseDetailCtrl", ExpenseDetailCtrl);

function ExpenseDetailCtrl(balanceSheet, solveDebts, $scope, $mdDialog, $stateParams, $state) {
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
        balanceSheet.createParticipation({expense: $scope.expense, person: p});
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
      $state.go("expenseList");
    });
	}
	
	function computeDebts() {
	  if (!$scope.expense.isBalanced()) {
	    return [];
	  }
	  
	  var debtorList = [];
	  var debtorIndices = {};
	  var debts = solveDebts($scope.expense.getParticipations());
	  
	  angular.forEach(debts, function(d) {
	    var debtorIndex = debtorIndices[d.debtor.id];
	    var debtor;
	    if (debtorIndex === undefined) {
	      debtorIndex = debtorList.length;
	      debtor = {debtor: d.debtor, debts: []};
	      debtorList.push(debtor);
	      debtorIndices[d.debtor.id] = debtorIndex;
	    }
	    debtor = debtorList[debtorIndex];
	    debtor.debts.push({creditor: d.creditor, amount: d.amount});
	  });
	  
	  angular.forEach(debtorList, function(d) {
	    d.debts.sort(function(d1, d2) {
	      return d1.creditor.name.localeCompare(d2.creditor.name);
	    });
	  });
	  debtorList.sort(function(d1, d2) {
	    return d1.debtor.name.localeCompare(d2.debtor.name);
	  });
	  
	  return debtorList;
	}

	
	
	
}
