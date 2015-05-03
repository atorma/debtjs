"use strict";

var angular = require("angular");

angular
  .module("debtApp")
    .controller("FloatingActionCtrl", FloatingActionCtrl);

function FloatingActionCtrl(balanceSheetService, openCreatePersonDialog, openCreateExpenseDialog) {
  
  var vm = this;
  
  vm.createPerson = createPerson;
  vm.createExpense = createExpense;
  
  function createPerson() {
    openCreatePersonDialog()
    .then(function(dialogResult) {
      balanceSheetService.createPerson(dialogResult.person, dialogResult.options);
    });
  }
  
  function createExpense() {
    openCreateExpenseDialog()
    .then(function(dialogResult) {
      balanceSheetService.createExpense(dialogResult.expense, dialogResult.options);
    });
  }
}