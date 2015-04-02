"use strict";

var angular = require("angular");
require("angular-mocks/ngMock");
require("../debt");
var BalanceSheet = require("./balance-sheet");
  
describe("BalanceSheetCtrl", function() {

  var $scope;
  var $stateParams;
  var $state;
  var balanceSheet;
  var debtService;
  var controller;

  beforeEach(angular.mock.module("debtApp"));
  
  beforeEach(function() {
    balanceSheet = new BalanceSheet();
    
    debtService = {
      computeDebts: function() {
        return [];
      },
      organizeByDebtor: function() {
        return [];
      }
    };
    
    $state = jasmine.createSpyObj("$state", ["go"]);

  });

  beforeEach(angular.mock.inject(function($rootScope, $controller, $q, $mdDialog) {
    $scope = $rootScope;
    
    // Dialog always results in "OK"
    $mdDialog.show = function() {
      return $q.when();
    };
    
    controller = $controller("BalanceSheetCtrl", {
      balanceSheet: balanceSheet,
      debtService: debtService,
      $scope: $rootScope
    });
    
  }));

  it("adds balance sheet into $scope", function() {
    expect($scope.balanceSheet).toBe(balanceSheet);
  });
  
  describe("refresh", function() {
    
    it("computes debts by debtor into $scope", function() {
      
      balanceSheet.participations = "Dummy participations";

      var debts = "Dummy debts";
      debtService.computeDebts = function(input) {
        expect(input).toBe(balanceSheet.participations);
        return debts;
      };
      
      var debtsByDebtor = "Dummy debts by debtor";
      debtService.organizeByDebtor = function(input) {
        expect(input).toBe(debts);
        return debtsByDebtor;
      };
      
      $scope.refresh();
      
      expect($scope.debtsByDebtor).toBe(debtsByDebtor);
    });
    
  });
});

