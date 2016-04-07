"use strict";

var angular = require("angular");
var _ = require('lodash');

angular.module("debtApp")
  .controller("CurrencyListCtrl", CurrencyListCtrl)
  .controller("ExchangeRateDialogCtrl", ExchangeRateDialogCtrl);


function CurrencyListCtrl(balanceSheetService, events, $scope, $mdDialog, debounce, $log) {
  var vm = this;

  vm.init = init;
  vm.openExchangeRateDialog = openExchangeRateDialog;
  vm.updateExchangeRate = updateExchangeRate;
  vm.removeExchangeRate = removeExchangeRate;

  init();

  function init() {
    vm.balanceSheet = balanceSheetService.balanceSheet;
    
    refresh();

    // Workaround to allow FAB for creating an exchange rate to reside
    // in a different scope (for layout).
    $scope.$watch(function() {
      return balanceSheetService.balanceSheet.getExchangeRates();
    }, debounce(refresh, 50), true);
  }

  function refresh() {
    vm.exchangeRates = balanceSheetService.balanceSheet.getExchangeRates();
  }

  function openExchangeRateDialog() {

    return $mdDialog.show({
      templateUrl: "currencies/exchange-rate-dialog.html",
      controller: "ExchangeRateDialogCtrl as vm"
    }).then(function(quotation) {
      updateExchangeRate(quotation);
    });

  }

  function updateExchangeRate(exchangeRate) {
    try {
      balanceSheetService.balanceSheet.addOrUpdateExchangeRate(exchangeRate);
      $scope.$emit(events.BALANCE_SHEET_UPDATED);
      refresh();
    } catch (e) {
      $log.error(e);
    }
  }

  function removeExchangeRate(exchangeRate) {
    balanceSheetService.balanceSheet.removeExchangeRate(exchangeRate);
    _.remove(vm.exchangeRates, exchangeRate);
    $scope.$emit(events.BALANCE_SHEET_UPDATED);
    refresh();
  }

}

function ExchangeRateDialogCtrl($mdDialog) {
  var vm = this;

  vm.ok = ok;
  vm.cancel = cancel;
  vm.init = init;

  init();

  function init() {
    vm.quotation = {};
  }

  function ok() {
    $mdDialog.hide(vm.quotation);
  }

  function cancel() {
    $mdDialog.cancel();
  }

}