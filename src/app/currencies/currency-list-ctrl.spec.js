"use strict";

var _ = require("lodash");
var angular = require("angular");
require("angular-mocks/ngMock");
require("../debt");
var BalanceSheet = require("../balance-sheet/balance-sheet");

describe("CurrencyListCtrl", function() {

  var $scope;
  var balanceSheet;
  var balanceSheetService;
  var vm;

  beforeEach(angular.mock.module("debtApp"));

  beforeEach(function() {
    balanceSheet = new BalanceSheet();
    balanceSheet.addOrUpdateExchangeRate({
      fixed: "USD",
      variable: "EUR",
      rate: 0.9105
    });

    balanceSheetService = jasmine.createSpyObj("balanceSheetService", ["dummy"]);
    balanceSheetService.balanceSheet = balanceSheet;
  });

  beforeEach(angular.mock.inject(function($rootScope, $controller) {

    $scope = $rootScope.$new();

    vm = $controller("CurrencyListCtrl", {
      balanceSheetService: balanceSheetService,
      $scope: $scope
    });

  }));

  it("exposes exchange rate list", function() {
    expect(vm.exchangeRates).toEqual(balanceSheetService.balanceSheet.getExchangeRates());
  });

  describe("addExchangeRate()", function() {

    it("adds empty exchange rate in list", function() {
      vm.addExchangeRate();

      expect(_.last(vm.exchangeRates)).toEqual({fixed: undefined, variable: undefined, rate: undefined});
    });

  });

  describe("updateExchangeRate()", function() {

    it("tries to update empty exchange rate in balance sheet", function() {
      spyOn(balanceSheet, 'addOrUpdateExchangeRate');
      var exchangeRate = {fixed: "EUR", variable: "USD", rate: 1.01};

      vm.updateExchangeRate(exchangeRate);

      expect(balanceSheet.addOrUpdateExchangeRate).toHaveBeenCalledWith(exchangeRate);
    });

  });

  describe("removeExchangeRate()", function() {

    it("removes exchange rate from balance sheet and exposed list", function() {
      spyOn(balanceSheet, 'removeExchangeRate');
      var exchangeRate = {fixed: "EUR", variable: "USD", rate: 1.01};
      vm.exchangeRates.push(exchangeRate);

      vm.removeExchangeRate(exchangeRate);

      expect(balanceSheet.removeExchangeRate).toHaveBeenCalledWith(exchangeRate);
      expect(vm.exchangeRates).not.toContain(exchangeRate);
    });

  });


});

