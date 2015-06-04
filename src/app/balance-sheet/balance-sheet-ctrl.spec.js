"use strict";

var angular = require("angular");
require("angular-mocks/ngMock");
require("../debt");
var BalanceSheet = require("./balance-sheet");
  
describe("BalanceSheetCtrl", function() {

  var vm;
  var events;
  var $scope;
  var balanceSheetService;
  var balanceSheet;
  var debtService;
  

  beforeEach(angular.mock.module("debtApp"));
  
  beforeEach(function() {
    balanceSheet = new BalanceSheet();
    
    balanceSheetService = jasmine.createSpyObj("balanceSheetService", ["save", "loadFromJson", "exportToJson", "init"]);
    balanceSheetService.balanceSheet = balanceSheet;
    
    debtService = jasmine.createSpyObj("debtService", ["computeDebts", "organizeByDebtor"]);
    
  });

  beforeEach(angular.mock.inject(function(_events_, $rootScope, $controller) {
    events = _events_;
    $scope = $rootScope.$new();

    vm = $controller("BalanceSheetCtrl", {
      balanceSheetService: balanceSheetService,
      debtService: debtService,
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


  it("exposes balance sheet", function() {
    expect(vm.balanceSheet).toBe(balanceSheet);
  });
  
  describe("refresh", function() {

    it("updates balance sheet reference", function() {
      var newSheet = jasmine.createSpyObj("new sheet", ["isBalanced"]);
      balanceSheetService.balanceSheet = newSheet;
      vm.refresh();
      expect(vm.balanceSheet).toEqual(newSheet);
    });
    
    it("computes debts by debtor using non-settled participatins", function() {
      balanceSheet.participations = "all participations";
      var nonSettledParticipations = "non-settled participations";
      spyOn(balanceSheet, "getNonSettledParticipations").and.returnValue(nonSettledParticipations);

      var debts = "Dummy debts";
      debtService.computeDebts.and.returnValue(debts);
      
      var debtsByDebtor = "Dummy debts by debtor";
      debtService.organizeByDebtor.and.returnValue(debtsByDebtor);
      
      vm.refresh();
      
      expect(debtService.computeDebts).toHaveBeenCalledWith(nonSettledParticipations);
      expect(debtService.organizeByDebtor).toHaveBeenCalledWith(debts);
      expect(vm.debtsByDebtor).toBe(debtsByDebtor);
    });
    
    it("is done on 'balance sheet updated' event", function() {
      vm.refresh = jasmine.createSpy("refresh");
      vm.init();
      
      $scope.$root.$broadcast(events.BALANCE_SHEET_UPDATED);
      
      expect(vm.refresh).toHaveBeenCalled();
    });
    
  });

  describe("updateSheet()", function() {

    it("emits 'balance sheet updated' event", function() {
      expectEventEmitted(vm.updateSheet, events.BALANCE_SHEET_UPDATED);
    });


  });

});

