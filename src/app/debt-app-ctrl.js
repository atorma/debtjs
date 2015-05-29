"use strict";

var angular = require("angular");
var _ = require("lodash");
var BalanceSheet = require('./balance-sheet/balance-sheet');

angular.module("debtApp")
  .value("balanceSheetSaveCtrlConfig", {wait: 500})
  .controller("DebtAppCtrl", DebtAppCtrl);

function DebtAppCtrl(balanceSheetService,
                     balanceSheetSaveCtrlConfig,
                     openCreatePersonDialog,
                     openCreateExpenseDialog,
                     events,
                     $mdDialog,
                     $mdSidenav,
                     $state,
                     $scope,
                     $window,
                     $log) {

  var vm = this;

  vm.mainMenu = {
    toggle: toggleMenu
  };

  vm.init = init;
  vm.createPerson = createPerson;
  vm.createExpense = createExpense;
  vm.createNewSheet = createNewSheet;
  vm.save = save;
  vm.refresh = refresh;

  var confirmCreateNewSheet = $mdDialog.confirm()
    .title("Create new sheet")
    .content("The current sheet will be discarded. Please consider exporting it first. Continue?")
    .ok("Ok").cancel("Cancel");

  var createObjectURL = ($window.URL || $window.webkitURL || {}).createObjectURL || angular.noop;
  var revokeObjectURL = ($window.URL || $window.webkitURL || {}).revokeObjectURL || angular.noop;
  var Blob = $window.Blob || angular.noop;


  init();

  /////////////////////////////////////////////////////////////

  function toggleMenu() {
    $mdSidenav("main-menu").toggle();
  }

  function init() {
    $scope.$on(events.BALANCE_SHEET_UPDATED, _.debounce(onBalanceSheetUpdated, balanceSheetSaveCtrlConfig.wait));
    vm.refresh();
  }

  function onBalanceSheetUpdated() {
    vm.refresh();
    if (!vm.errorMessage) {
      vm.save();
    }
  }

  function save() {
    try {
      balanceSheetService.save();
      vm.errorMessage = undefined;
      $log.debug("Balance sheet saved");
    } catch (e) {
      vm.errorMessage = "Cannot save: " + e.message;
      $log.error("Error when saving balance sheet: " + e.message);
    }
  }

  function refresh() {
    vm.balanceSheet = balanceSheetService.balanceSheet;
    if (balanceSheetService.error) {
      vm.errorMessage = "Invalid sheet: " + balanceSheetService.error.message;
    } else {
      vm.errorMessage = undefined;
    }
    updateJsonExportUrl();
  }

  function updateJsonExportUrl() {
    var json = balanceSheetService.exportToJson();
    var blob = new Blob([json], {type: "application/json"});
    revokeObjectURL(vm.jsonExportUrl);
    vm.jsonExportUrl = createObjectURL(blob);
  }


  function createPerson() {
    openCreatePersonDialog()
      .then(function(dialogResult) {
        balanceSheetService.balanceSheet.createPerson(dialogResult.person, dialogResult.options);
        onBalanceSheetUpdated();
        $scope.$broadcast(events.BALANCE_SHEET_UPDATED);
      });
  }

  function createExpense() {
    openCreateExpenseDialog()
      .then(function(dialogResult) {
        balanceSheetService.balanceSheet.createExpense(dialogResult.expense, dialogResult.options);
        onBalanceSheetUpdated();
        $scope.$broadcast(events.BALANCE_SHEET_UPDATED);
      });
  }

  function createNewSheet() {
    $mdDialog.show(confirmCreateNewSheet)
      .then(function() {
        balanceSheetService.createNew();
        onBalanceSheetUpdated();
        $state.go("balanceSheet");
        $scope.$broadcast(events.BALANCE_SHEET_UPDATED);
        vm.mainMenu.toggle();
      }, function() {
        vm.mainMenu.toggle();
      });
  }
}