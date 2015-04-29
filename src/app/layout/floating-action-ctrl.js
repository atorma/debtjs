"use strict";

require("angular").module("debtApp")
  .controller("FloatingActionCtrl", FloatingActionCtrl);

function FloatingActionCtrl(balanceSheetService) {
  
  var vm = this;
  
  vm.createPerson = createPerson;
  vm.createExpense = createExpense;
  
  function createPerson() {
    balanceSheetService.balanceSheet.createPerson();
  }
  
  function createExpense() {
    balanceSheetService.balanceSheet.createExpense();
  }
}