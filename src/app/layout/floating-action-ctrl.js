"use strict";

require("angular").module("debtApp")
  .controller("FloatingActionCtrl", FloatingActionCtrl);

function FloatingActionCtrl($scope, balanceSheetService) {
  
  $scope.createPerson = createPerson;
  $scope.createExpense = createExpense;
  
  function createPerson() {
    balanceSheetService.balanceSheet.createPerson();
  }
  
  function createExpense() {
    balanceSheetService.balanceSheet.createExpense();
  }
}