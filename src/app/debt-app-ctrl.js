"use strict";

var angular = require("angular");
var _ = require("lodash");

angular.module("debtApp")
  .value("balanceSheetSaveCtrlConfig", {wait: 500})
  .controller("DebtAppCtrl", DebtAppCtrl);

function DebtAppCtrl(balanceSheetService,
                     balanceSheetSaveCtrlConfig,
                     openCreatePersonDialog,
                     openCreateExpenseDialog,
                     events,
                     $mdDialog,
                     $state,
                     $scope,
                     $log) {

  var vm = this;

  var confirmCreateNewSheet;

  vm.createPerson = createPerson;
  vm.createExpense = createExpense;
  vm.createNewSheet = createNewSheet;

  vm.init = init;
  init();

  /////////////////////////////////////////////////////////////

  function init() {

    var debouncedSave = _.debounce(tryToSave, balanceSheetSaveCtrlConfig.wait);
    $scope.$watch(debouncedSave);

    confirmCreateNewSheet = $mdDialog.confirm()
      .title("Create new sheet")
      .content("The current sheet will be discarded. Please consider exporting it first. Continue?")
      .ok("Ok").cancel("Cancel");
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
        $scope.$broadcast(events.BALANCE_SHEET_UPDATED);
      });
  }

  function createExpense() {
    openCreateExpenseDialog()
      .then(function(dialogResult) {
        balanceSheetService.balanceSheet.createExpense(dialogResult.expense, dialogResult.options);
        $scope.$broadcast(events.BALANCE_SHEET_UPDATED);
      });
  }

  function createNewSheet() {
    $mdDialog.show(confirmCreateNewSheet)
      .then(function() {
        balanceSheetService.createNew();
        $state.go("balanceSheet");
        $scope.$broadcast(events.BALANCE_SHEET_UPDATED);
      });
  }

}