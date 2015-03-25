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
    
    expect($scope.isParticipant[participant1.id]).toBe(true);
    expect($scope.isParticipant[participant2.id]).toBe(true);
    expect($scope.isParticipant[nonParticipant.id]).toBe(false);
    
  });

  describe("shareCost", function() {
    
    beforeEach(function() {
      spyOn(expense, "shareCost");
      $scope.expense = expense;
    });
    
    it("shares cost of expense if sharing mode is 'equal'", function() {
      expense.sharing = 'equal';
      $scope.shareCost();
      
      expect(expense.shareCost).toHaveBeenCalled();
    });
    
    it("does not share cost of expense if sharing mode is 'custom'", function() {
      expense.sharing = 'custom';
      $scope.shareCost();
      
      expect(expense.shareCost).not.toHaveBeenCalled();
    });
    
  });
  
  describe("setParticipation", function() {
    
    var person;
    
    beforeEach(function() {
      person = balanceSheet.createPerson();
      spyOn(expense, "shareCost");
      $scope.expense = expense;
    });
    
    it("creates or removes participation", function() {      
      $scope.setParticipation(person, true);
      
      expect(expense.getParticipations().length).toBe(1);
      expect(expense.getParticipations()[0].person).toBe(person);
      
      $scope.setParticipation(person, false);
      
      expect(expense.getParticipations().length).toBe(0);
    });
    
    it("shares cost of expense if sharing mode is 'equal'", function() {
      expense.sharing = 'equal';
      $scope.setParticipation(person, true);
      
      expect(expense.shareCost).toHaveBeenCalled();
    });
    
    it("shares cost of expense if sharing mode is 'equal'", function() {
      expense.sharing = 'equal';
      $scope.setParticipation(person, false);
      
      expect(expense.shareCost).toHaveBeenCalled();
    });
    
    it("does not share cost of expense if sharing mode is 'custom'", function() {
      expense.sharing = 'custom';
      $scope.setParticipation(person, true);
      
      expect(expense.shareCost).not.toHaveBeenCalled();
    });
  });
  
  
  
  

});

