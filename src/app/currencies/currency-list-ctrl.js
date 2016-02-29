"use strict";

var angular = require("angular");
var _ = require('lodash');

angular.module("debtApp")
  .controller("CurrencyListCtrl", CurrencyListCtrl);


function CurrencyListCtrl(balanceSheetService, events, $scope) {
  var vm = this;

  vm.init = init;
  vm.addExchangeRate = addExchangeRate;
  vm.updateExchangeRate = updateExchangeRate;
  vm.removeExchangeRate = removeExchangeRate;
  vm.updateDefaultCurrency = updateDefaultCurrency;

  init();

  function init() {
    vm.exchangeRates = balanceSheetService.balanceSheet.getExchangeRates();
    vm.currencies = balanceSheetService.balanceSheet.getCurrencies();
    vm.defaultCurrency = balanceSheetService.balanceSheet.getDefaultCurrency();
  }

  function addExchangeRate() {
    vm.exchangeRates.push({fixed: undefined, variable: undefined, rate: undefined});
    $scope.$emit(events.BALANCE_SHEET_UPDATED);
  }

  function updateExchangeRate(exchangeRate) {
    balanceSheetService.balanceSheet.addOrUpdateExchangeRate(exchangeRate);
    $scope.$emit(events.BALANCE_SHEET_UPDATED);
    vm.currencies = balanceSheetService.balanceSheet.getCurrencies();
    vm.defaultCurrency = balanceSheetService.balanceSheet.getDefaultCurrency();
  }

  function removeExchangeRate(exchangeRate) {
    balanceSheetService.balanceSheet.removeExchangeRate(exchangeRate);
    _.remove(vm.exchangeRates, exchangeRate);
    $scope.$emit(events.BALANCE_SHEET_UPDATED);
    vm.currencies = balanceSheetService.balanceSheet.getCurrencies();
    vm.defaultCurrency = balanceSheetService.balanceSheet.getDefaultCurrency();
  }

  function updateDefaultCurrency() {
    balanceSheetService.balanceSheet.setDefaultCurrency(vm.defaultCurrency);
    $scope.$emit(events.BALANCE_SHEET_UPDATED);
  }
}