"use strict";

var angular = require("angular");
require("angular-mocks/ngMock");
require("../debt");
var BalanceSheet = require("./balance-sheet");
  
describe("BalanceSheetCtrl", function() {

  var $scope;
  var balanceSheet;
  var debtService;
  var controller;

  beforeEach(angular.mock.module("debtApp"));
  
  beforeEach(function() {
    balanceSheet = new BalanceSheet();
    
    debtService = jasmine.createSpyObj("debtService", ["computeDebts", "organizeByDebtor"]);
    
  });

  beforeEach(angular.mock.inject(function($rootScope, $controller, $q) {
    $scope = $rootScope.$new();

    controller = $controller("BalanceSheetCtrl", {
      balanceSheet: balanceSheet,
      debtService: debtService,
      $scope: $scope
    });
    
  }));

  it("adds balance sheet into $scope", function() {
    expect($scope.balanceSheet).toBe(balanceSheet);
  });
  
  describe("refresh", function() {
    
    it("computes debts by debtor into $scope", function() {
      
      balanceSheet.participations = "Dummy participations";

      var debts = "Dummy debts";
      debtService.computeDebts.and.returnValue(debts);
      
      var debtsByDebtor = "Dummy debts by debtor";
      debtService.organizeByDebtor.and.returnValue(debtsByDebtor);
      
      $scope.refresh();
      
      expect(debtService.computeDebts).toHaveBeenCalledWith(balanceSheet.participations);
      expect(debtService.organizeByDebtor).toHaveBeenCalledWith(debts);
      expect($scope.debtsByDebtor).toBe(debtsByDebtor);
    });
    
    it("is done on balanceSheetUpdated event", function() {
      balanceSheet.participations = "Updated";
      
      $scope.$root.$broadcast("balanceSheetUpdated");
      
      expect(debtService.computeDebts).toHaveBeenCalledWith(balanceSheet.participations);
    });
    
  });
});

