"use strict";

var angular = require("angular");
require("angular-mocks/ngMock");
require("../debt");
var BalanceSheet = require("./balance-sheet");
  
describe("BalanceSheetCtrl", function() {

  var vm;
  var $scope;
  var balanceSheet;
  var debtService;
  

  beforeEach(angular.mock.module("debtApp"));
  
  beforeEach(function() {
    balanceSheet = new BalanceSheet();
    
    debtService = jasmine.createSpyObj("debtService", ["computeDebts", "organizeByDebtor"]);
    
  });

  beforeEach(angular.mock.inject(function($rootScope, $controller, $q) {
    $scope = $rootScope.$new();

    vm = $controller("BalanceSheetCtrl", {
      balanceSheet: balanceSheet,
      debtService: debtService,
      $scope: $scope
    });
    
  }));

  it("exposes balance sheet", function() {
    expect(vm.balanceSheet).toBe(balanceSheet);
  });
  
  describe("refresh", function() {
    
    it("computes debts by debtor", function() {
      
      balanceSheet.participations = "Dummy participations";

      var debts = "Dummy debts";
      debtService.computeDebts.and.returnValue(debts);
      
      var debtsByDebtor = "Dummy debts by debtor";
      debtService.organizeByDebtor.and.returnValue(debtsByDebtor);
      
      vm.refresh();
      
      expect(debtService.computeDebts).toHaveBeenCalledWith(balanceSheet.participations);
      expect(debtService.organizeByDebtor).toHaveBeenCalledWith(debts);
      expect(vm.debtsByDebtor).toBe(debtsByDebtor);
    });
    
    it("is done on balanceSheetUpdated event", function() {
      vm.refresh = jasmine.createSpy("refresh");
      vm.init();
      
      $scope.$root.$broadcast("balanceSheetUpdated");
      
      expect(vm.refresh).toHaveBeenCalled();
    });
    
  });
});

