"use strict";

var angular = require("angular");
var _ = require('lodash');

angular.module("debtApp")
  .controller("CurrencyListCtrl", CurrencyListCtrl)
  .controller("ExchangeRateDialogCtrl", ExchangeRateDialogCtrl);


function CurrencyListCtrl(balanceSheetService, events, $scope, $mdDialog) {
  var vm = this;

  vm.init = init;
  vm.openExchangeRateDialog = openExchangeRateDialog;
  vm.updateExchangeRate = updateExchangeRate;
  vm.removeExchangeRate = removeExchangeRate;
  vm.updateDefaultCurrency = updateDefaultCurrency;

  init();

  function init() {
    vm.exchangeRates = balanceSheetService.balanceSheet.getExchangeRates();
    vm.currencies = balanceSheetService.balanceSheet.getCurrencies();
    vm.defaultCurrency = balanceSheetService.balanceSheet.getDefaultCurrency();
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
    balanceSheetService.balanceSheet.addOrUpdateExchangeRate(exchangeRate);
    $scope.$emit(events.BALANCE_SHEET_UPDATED);
    init();
  }

  function removeExchangeRate(exchangeRate) {
    balanceSheetService.balanceSheet.removeExchangeRate(exchangeRate);
    _.remove(vm.exchangeRates, exchangeRate);
    $scope.$emit(events.BALANCE_SHEET_UPDATED);
    init();
  }

  function updateDefaultCurrency() {
    balanceSheetService.balanceSheet.setDefaultCurrency(vm.defaultCurrency);
    $scope.$emit(events.BALANCE_SHEET_UPDATED);
    init();
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