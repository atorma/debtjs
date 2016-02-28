"use strict";

var angular = require("angular");
var _ = require('lodash');

angular.module("debtApp")
  .controller("CurrencyListCtrl", CurrencyListCtrl);


function CurrencyListCtrl(balanceSheetService) {
  var vm = this;

  vm.init = init;
  vm.addExchangeRate = addExchangeRate;
  vm.updateExchangeRate = updateExchangeRate;
  vm.removeExchangeRate = removeExchangeRate;

  init();

  function init() {
    vm.exchangeRates = balanceSheetService.balanceSheet.getExchangeRates();
  }

  function addExchangeRate() {
    vm.exchangeRates.push({fixed: undefined, variable: undefined, rate: undefined});
  }

  function updateExchangeRate(exchangeRate) {
    balanceSheetService.balanceSheet.addOrUpdateExchangeRate(exchangeRate);
  }

  function removeExchangeRate(exchangeRate) {
    balanceSheetService.balanceSheet.removeExchangeRate(exchangeRate);
    _.remove(vm.exchangeRates, exchangeRate);
  }
}