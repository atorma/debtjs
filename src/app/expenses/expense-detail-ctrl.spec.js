"use strict";

var angular = require("angular");
require("angular-mocks/ngMock");
require("../debt");
var BalanceSheet = require("../domain/balance-sheet");
  
describe("ExpenseDetailCtrl", function() {

  var $scope;
  var $stateParams;
  var balanceSheet;
  var expense;
  var controller;

  beforeEach(angular.mock.module("debtApp"));
  
  beforeEach(function() {
    balanceSheet = new BalanceSheet();
    expense = balanceSheet.createExpense();
    $stateParams = {
        id: expense.id
    };

  });

  beforeEach(angular.mock.inject(function($rootScope, $controller) {
    $scope = $rootScope;
    
    controller = $controller("ExpenseDetailCtrl", {
      balanceSheet: balanceSheet,
      $scope: $rootScope,
      $stateParams: $stateParams
    });
    
  }));

  it("should initialize scope properties", function() {
    expect($scope.balanceSheet).toBe(balanceSheet);
    expect($scope.expense).toBe(expense);
  });
  
  it("should initialize participation map", function() {
    
    var participant1 = balanceSheet.createPerson();
    var participant2 = balanceSheet.createPerson();
    var nonParticipant = balanceSheet.createPerson();
    
    balanceSheet.createParticipation({person: participant1, expense: expense});
    balanceSheet.createParticipation({person: participant2, expense: expense});
    
    controller.init();
    
    expect($scope.participationMap[participant1.id]).toBe(true);
    expect($scope.participationMap[participant2.id]).toBe(true);
    expect($scope.participationMap[nonParticipant.id]).toBe(false);
    
  });
  
  it("setParticipation creates or removes participation", function() {
    var person = balanceSheet.createPerson();
    
    $scope.setParticipation(person, true);
    
    expect(expense.getParticipations().length).toBe(1);
    expect(expense.getParticipations()[0].person).toBe(person);
    expect($scope.participationMap[person.id]).toBe(true);
    
    $scope.setParticipation(person, false);
    
    expect(expense.getParticipations().length).toBe(0);
  });

});

