"use strict";

var angular = require("angular");
require("angular-mocks/ngMock");
require("../debt");
var BalanceSheet = require("../domain/balance-sheet");
  
describe("ExpenseDetailCtrl", function() {

  var $scope;
  var $stateParams;
  var $state;
  var balanceSheet;
  var solveDebts;
  var expense;
  var controller;

  beforeEach(angular.mock.module("debtApp"));
  
  beforeEach(function() {
    balanceSheet = new BalanceSheet();
    expense = balanceSheet.createExpense();
    
    solveDebts = jasmine.createSpy("solveDebts");
    solveDebts.and.returnValue([]);
    
    $stateParams = {
        id: expense.id
    };
    $state = jasmine.createSpyObj("$state", ["go"]);

  });

  beforeEach(angular.mock.inject(function($rootScope, $controller, $q, $mdDialog) {
    $scope = $rootScope;
    
    // Dialog always results in "OK"
    $mdDialog.show = function() {
      return $q.when();
    };
    
    controller = $controller("ExpenseDetailCtrl", {
      balanceSheet: balanceSheet,
      solveDebts: solveDebts,
      $scope: $rootScope,
      $stateParams: $stateParams,
      $state: $state,
      $mdDialog: $mdDialog
    });
    
  }));

  it("adds balance sheet and expense into $scope", function() {
    expect($scope.balanceSheet).toBe(balanceSheet);
    expect($scope.expense).toBe(expense);
  });
  

  describe("refresh", function() {
    
    beforeEach(function() {
      spyOn(expense, "shareCost");
      $scope.expense = expense;
    });
    
    it("updates participation map", function() {
      var participant1 = balanceSheet.createPerson();
      var participant2 = balanceSheet.createPerson();
      var nonParticipant = balanceSheet.createPerson();
      
      balanceSheet.createParticipation({person: participant1, expense: expense});
      balanceSheet.createParticipation({person: participant2, expense: expense});
      
      $scope.refresh();
      
      expect($scope.isParticipant[participant1.id]).toBe(true);
      expect($scope.isParticipant[participant2.id]).toBe(true);
      expect($scope.isParticipant[nonParticipant.id]).toBe(false);
    });
    
    it("determines if every person participates in expense", function() {
      var person1 = balanceSheet.createPerson();
      var person2 = balanceSheet.createPerson();
      var person3 = balanceSheet.createPerson();
      
      $scope.setParticipation(person1, true);
      $scope.setParticipation(person2, true);
      $scope.setParticipation(person3, true);
      
      $scope.refresh();

      expect($scope.isEveryoneParticipant).toBe(true);
      
      $scope.setParticipation(person2, false);
      
      $scope.refresh();

      expect($scope.isEveryoneParticipant).toBe(false);
    });
    
    it("shares cost of expense if sharing mode is 'equal'", function() {
      expense.sharing = 'equal';
      $scope.refresh();
      
      expect(expense.shareCost).toHaveBeenCalled();
    });
    
    it("does not share cost of expense if sharing mode is 'custom'", function() {
      expense.sharing = 'custom';
      $scope.refresh();
      
      expect(expense.shareCost).not.toHaveBeenCalled();
    });
    
    it("computes debts by debtor into $scope", function() {
      var participations = [{person: "Dummy"}];
      spyOn(expense, "getParticipations").and.returnValue(participations);
      
      var debts = [
         {debtor: {id: 1, name: "Valtteri"}, creditor: {id: 9, name: "Anssi"}, amount: 10},
         {debtor: {id: 2, name: "Johannes"}, creditor: {id: 8, name: "Tomi"}, amount: 15},
         {debtor: {id: 2, name: "Johannes"}, creditor: {id: 9, name: "Anssi"}, amount: 27}
      ];
      solveDebts.and.returnValue(debts);
      
      $scope.refresh();
      
      expect($scope.debtsByDebtor.length).toBe(2);
      expect($scope.debtsByDebtor[0]).toEqual({
        debtor: {id: 2, name: "Johannes"},
        debts: [
                {creditor: {id: 9, name: "Anssi"}, amount: 27},
                {creditor: {id: 8, name: "Tomi"}, amount: 15} 
                ]
      });
      expect($scope.debtsByDebtor[1]).toEqual({
        debtor: {id: 1, name: "Valtteri"},
        debts: [
                {creditor: {id: 9, name: "Anssi"}, amount: 10}
                ]
      });
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
  
  it("deletes expense", function() {
    $scope.expense = expense;
    spyOn(balanceSheet, "removeExpense");
    
    $scope.removeExpense();
    $scope.$digest();
    
    expect(balanceSheet.removeExpense).toHaveBeenCalledWith(expense);
    expect($state.go).toHaveBeenCalledWith("expenseList");
  });
  
  
  it("can set everyone as participants", function() {
    var person1 = balanceSheet.createPerson();
    var person2 = balanceSheet.createPerson();
    var person3 = balanceSheet.createPerson();

    $scope.setAllParticipations(true);
    
    expect($scope.isParticipant[person1.id]).toBe(true);
    expect($scope.isParticipant[person2.id]).toBe(true);
    expect($scope.isParticipant[person3.id]).toBe(true);
    expect($scope.isEveryoneParticipant).toBe(true);
    expect(expense.getParticipations().length).toBe(3);
  });
});

