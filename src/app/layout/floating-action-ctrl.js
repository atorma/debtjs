"use strict";


require("angular").module("debtApp")
  .controller("FloatingActionCtrl", FloatingActionCtrl);

function FloatingActionCtrl(balanceSheetService, openCreatePersonDialog) {
  
  var vm = this;
  
  vm.createPerson = createPerson;
  vm.createExpense = createExpense;
  
  function createPerson() {
    openCreatePersonDialog()
    .then(function(result) {
      console.log(angular.toJson(result));
    });
  }
  
  function createExpense() {
    balanceSheetService.balanceSheet.createExpense();
  }
}