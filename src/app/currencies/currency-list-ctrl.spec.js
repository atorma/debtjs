"use strict";

var _ = require("lodash");
var angular = require("angular");
require("angular-mocks/ngMock");
require("../debt");
var BalanceSheet = require("../balance-sheet/balance-sheet");

describe("CurrencyListCtrl", function() {

  var vm;

  var $scope;
  var balanceSheet;
  var balanceSheetService;
  var events;


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

  beforeEach(angular.mock.inject(function($rootScope, $controller, _events_) {
    events = _events_;
    $scope = $rootScope.$new();

    vm = $controller("CurrencyListCtrl", {
      balanceSheetService: balanceSheetService,
      events: events,
      $scope: $scope
    });

  }));

  function expectEventEmitted(fun, eventName) {
    var eventEmitted = false;
    $scope.$parent.$on(eventName, function() {
      eventEmitted = true;
    });

    fun();
    $scope.$digest();

    expect(eventEmitted).toBe(true);
  }


  it("exposes exchange rate list", function() {
    expect(vm.exchangeRates).toEqual(balanceSheetService.balanceSheet.getExchangeRates());
  });

  it("exposes list of currencies", function() {
    expect(vm.currencies).toEqual(balanceSheetService.balanceSheet.getCurrencies());
  });


  describe("updateExchangeRate()", function() {

    it("tries to update empty exchange rate in balance sheet", function() {
      spyOn(balanceSheet, 'addOrUpdateExchangeRate');
      var exchangeRate = {fixed: "EUR", variable: "USD", rate: 1.01};

      vm.updateExchangeRate(exchangeRate);

      expect(balanceSheet.addOrUpdateExchangeRate).toHaveBeenCalledWith(exchangeRate);
    });

    it("emits 'balance sheet updated' event", function() {
      expectEventEmitted(function() {
        vm.updateExchangeRate({fixed: "EUR", variable: "USD", rate: 1.01});
      }, events.BALANCE_SHEET_UPDATED);
    });

    it("updates list of currencies", function() {
      vm.updateExchangeRate({fixed: "EUR", variable: "DKK", rate: 7.31});

      expect(vm.currencies).toEqual(balanceSheetService.balanceSheet.getCurrencies());
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

    it("emits 'balance sheet updated' event", function() {
      expectEventEmitted(vm.removeExchangeRate, events.BALANCE_SHEET_UPDATED);
    });

    it("updates list of currencies", function() {
      _.each(vm.exchangeRates, function(er) {
        vm.removeExchangeRate(er);
      });

      expect(vm.currencies.length).toEqual(0);
    });

  });


});

