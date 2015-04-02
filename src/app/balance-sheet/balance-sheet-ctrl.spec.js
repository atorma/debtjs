"use strict";

var angular = require("angular");
require("angular-mocks/ngMock");
require("../debt");
var BalanceSheet = require("../domain/balance-sheet");
  
describe("BalanceSheetCtrl", function() {

  var $scope;
  var $stateParams;
  var $state;
  var balanceSheet;
  var solveDebts;
  var controller;

  beforeEach(angular.mock.module("debtApp"));
  
  beforeEach(function() {
    balanceSheet = new BalanceSheet();
    
    solveDebts = jasmine.createSpy("solveDebts");
    solveDebts.and.returnValue([]);
    
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
      solveDebts: solveDebts,
      $scope: $rootScope
    });
    
  }));

  it("adds balance sheet into $scope", function() {
    expect($scope.balanceSheet).toBe(balanceSheet);
  });
  
});

