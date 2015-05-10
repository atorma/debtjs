"use strict";

var _ = require("lodash"); 

require("angular").module("debtApp")
  .value("balanceSheetSaveCtrlConfig", {wait: 500})
  .controller("DebtAppCtrl", DebtAppCtrl);

function DebtAppCtrl(balanceSheetService, balanceSheetSaveCtrlConfig, openCreatePersonDialog, openCreateExpenseDialog, $scope, $log) {
  
  var vm = this;
  
  vm.createPerson = createPerson;
  vm.createExpense = createExpense;
  
  vm.init = init;
  init();
  
  /////////////////////////////////////////////////////////////
  
  function init() {
    
    var debouncedSave = _.debounce(tryToSave, balanceSheetSaveCtrlConfig.wait);
    $scope.$watch(debouncedSave);
    
  }

  function tryToSave() {
    try {
      balanceSheetService.save();
      vm.errorMessage = undefined;
      $log.debug("Balance sheet saved");
    } catch (e) {
      vm.errorMessage = "Cannot save: " + e.message;
      $log.error("Error when saving balance sheet: " + e.message);
    }
  }
  
  function createPerson() {
    openCreatePersonDialog()
    .then(function(dialogResult) {
      balanceSheetService.balanceSheet.createPerson(dialogResult.person, dialogResult.options);
      $scope.$broadcast("balanceSheetUpdated");
    });
  }
  
  function createExpense() {
    openCreateExpenseDialog()
    .then(function(dialogResult) {
      balanceSheetService.balanceSheet.createExpense(dialogResult.expense, dialogResult.options);
      $scope.$broadcast("balanceSheetUpdated");
    });
  }
 
}