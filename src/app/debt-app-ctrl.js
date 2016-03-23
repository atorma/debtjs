"use strict";

var angular = require("angular");
var _ = require("lodash");

angular.module("debtApp")
  .constant("balanceSheetSaveInterval", 500)
  .controller("DebtAppCtrl", DebtAppCtrl);

function DebtAppCtrl(balanceSheetService,
                     debounce,
                     balanceSheetSaveInterval,
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
  vm.balanceSheetUpdated = balanceSheetUpdated;
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
    $scope.$on(events.BALANCE_SHEET_UPDATED, debounce(function() {
      vm.balanceSheetUpdated();
    }), balanceSheetSaveInterval, $scope, true);
    $scope.$on(events.ERROR, handleErrorEvent);
    balanceSheetService.init();
    vm.balanceSheet = balanceSheetService.balanceSheet;
  }

  function balanceSheetUpdated() {
    vm.errorMessage = undefined;
    tryToSave();
    findExpensesWithInvalidCurrencies();
  }

  function tryToSave() {
    try {
      balanceSheetService.save();
    } catch (e) {
      $log.error(e);
      vm.errorMessage = "Cannot save: " + e.message;
    }
  }

  function findExpensesWithInvalidCurrencies() {
    var nonConvertible = vm.balanceSheet.getNonConvertibleCurrencies(vm.balanceSheet.getExpenseCurrencies(), vm.balanceSheet.currency());

    if (nonConvertible.length === 0 || vm.errorMessage) {
      return;
    }
    var messageTemplate = _.template("Cannot convert <%= currencyWord %> <%= currencyList %> to balance sheet's currency <%= balanceSheetCurrency %>");

    var data = {
      currencyWord: nonConvertible.length == 1 ? "currency" : "currencies",
      currencyList: "",
      balanceSheetCurrency: "'" + vm.balanceSheet.currency() + "'"
    };

    _.each(nonConvertible, function(c, index) {
      data.currencyList = data.currencyList + (index > 0 ? ", " : "") + "'" + c + "'";
    });

    vm.errorMessage = messageTemplate(data);
  }

  function handleErrorEvent(event, error) {
    vm.errorMessage = error.message;
  }

  function createPerson() {
    openCreatePersonDialog()
      .then(function(dialogResult) {
        balanceSheetService.balanceSheet.createPerson(dialogResult.person, dialogResult.options);
        vm.balanceSheetUpdated();
        $scope.$broadcast(events.BALANCE_SHEET_UPDATED);
      });
  }

  function createExpense() {
    openCreateExpenseDialog()
      .then(function(dialogResult) {
        balanceSheetService.balanceSheet.createExpense(dialogResult.expense, dialogResult.options);
        vm.balanceSheetUpdated();
        $scope.$broadcast(events.BALANCE_SHEET_UPDATED);
      });
  }

  function createNewSheet() {
    $mdDialog.show(confirmCreateNewSheet)
      .then(function() {
        balanceSheetService.createNew();
        vm.balanceSheetUpdated();
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
    vm.balanceSheetUpdated();
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
        };
      }
    });
    vm.mainMenu.toggle();
  }
}