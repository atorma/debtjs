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
                     fileService,
                     events,
                     $mdDialog,
                     $mdSidenav,
                     $state,
                     $scope,
                     $log) {

  var vm = this;

  vm.mainMenu = {
    toggle: toggleMenu
  };

  vm.init = init;
  vm.createPerson = createPerson;
  vm.createExpense = createExpense;
  vm.createNewSheet = createNewSheet;
  vm.loadSheet = loadSheet;
  vm.exportSheet = exportSheet;
  vm.save = save;
  vm.refresh = refresh;
  vm.showHelp = showHelp;

  var confirmCreateNewSheet = $mdDialog.confirm()
    .title("Create new sheet")
    .content("The current sheet will be discarded. Please consider exporting it first. Continue?")
    .ok("Ok").cancel("Cancel");

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

  function loadSheet(files) {
    if (!files || !files.length) return;

    if (!fileService.isSupported()) {
      vm.errorMessage = "File operations not supported in this browser. Please consider a more modern browser.";
      return;
    }

    var file = files[0];
    fileService.readAsText(file)
      .then(function(result) {
        loadSheetFromJson(result);
      })
      .catch(function() {
        vm.errorMessage = "Unable to read file";
      })
      .finally(function() {
        vm.mainMenu.toggle();
      });
  }

  function loadSheetFromJson(json) {
    balanceSheetService.loadFromJson(json);
    onBalanceSheetUpdated();
    $state.go("balanceSheet");
    $scope.$broadcast(events.BALANCE_SHEET_UPDATED);
  }

  function exportSheet() {
    if (!fileService.isSupported()) {
      vm.errorMessage = "File operations not supported in this browser. Please consider a more modern browser.";
      return;
    }

    var json = balanceSheetService.exportToJson();
    try {
      fileService.saveAsFile([json], balanceSheetService.balanceSheet.name + ".txt");
    } catch (e) {
      vm.errorMessage = "Error when saving file";
    }
    vm.mainMenu.toggle();
  }

  function showHelp() {
    $mdDialog.show({
      templateUrl: "help.html",
      controller: function($scope, $mdDialog) {
        $scope.close = function() {
          $mdDialog.hide();
        }
      }
    });
    vm.mainMenu.toggle();
  }
}