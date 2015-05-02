"use strict";

var angular = require("angular");

angular
  .module("debtApp")
    .controller("FloatingActionCtrl", FloatingActionCtrl);

function FloatingActionCtrl(balanceSheetService, openCreatePersonDialog) {
  
  var vm = this;
  
  vm.createPerson = createPerson;
  vm.createExpense = createExpense;
  
  function createPerson() {
    openCreatePersonDialog()
    .then(function(options) {
      balanceSheetService.createPerson(options);
    });
  }
  
  function createExpense() {
    balanceSheetService.balanceSheet.createExpense();
  }
}