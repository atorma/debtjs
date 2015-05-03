"use strict";

var angular = require("angular");
require("angular-mocks/ngMock");
require("../debt");
var BalanceSheet = require("../balance-sheet/balance-sheet");
  
describe("ExpenseDetailCtrl", function() {

  var $scope;
  var $stateParams;
  var $state;
  var balanceSheet;
  var debtService;
  var expense;
  var controller;
  
  beforeEach(function() {
    balanceSheet = new BalanceSheet();
    expense = balanceSheet.createExpense();
    
    debtService = {
      computeDebts: function() {
        return [];
      },
      organizeByDebtor: function() {
        return [];
      }
    };
    
    $stateParams = {
        id: expense.id
    };
    $state = jasmine.createSpyObj("$state", ["go"]);

  });

  beforeEach(angular.mock.module("debtApp", function($provide) {
    $provide.value("$state", $state);
  }));
  
  beforeEach(angular.mock.inject(function($rootScope, $controller, $q, $mdDialog) {
    $scope = $rootScope;
    
    // Dialog always results in "OK"
    $mdDialog.show = function() {
      return $q.when();
    };
    
    controller = $controller("ExpenseDetailCtrl", {
      balanceSheet: balanceSheet,
      debtService: debtService,
      $scope: $scope,
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
    
    it("shares cost of expense", function() {
      $scope.refresh();
      
      expect(expense.shareCost).toHaveBeenCalled();
    });

    it("computes debts by debtor into $scope", function() {
      var participations = [{person: "Dummy"}];
      spyOn(expense, "getParticipations").and.returnValue(participations);
      
      var debts = [{debtor: {id: 1, name: "Valtteri"}, creditor: {id: 9, name: "Anssi"}, amount: 10}];
      debtService.computeDebts = function(input) {
        expect(input).toBe(participations);
        return debts;
      };
      
      var debtsByDebtor = [{
          debtor: {id: 1, name: "Valtteri"},
          debts: [{creditor: {id: 9, name: "Anssi"}, amount: 10}]
        }];
      debtService.organizeByDebtor = function(input) {
        expect(input).toBe(debts);
        return debtsByDebtor;
      };
      
      $scope.refresh();
      
      expect($scope.debtsByDebtor).toBe(debtsByDebtor);
    });
    
    it("puts expense cost into scope variable", function() {
      spyOn(expense, "getCost").and.returnValue(120);
      
      $scope.refresh();
      
      expect($scope.cost).toBe(120);
    });
    
    it("puts expense sum of shares cost into scope variable", function() {
      spyOn(expense, "getSumOfShares").and.returnValue(120);
      
      $scope.refresh();
      
      expect($scope.sumOfShares).toBe(120);
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
    
    it("shares cost of expense", function() {
      $scope.setParticipation(person, true);
      expect(expense.shareCost.calls.count()).toBe(1);
      
      $scope.setParticipation(person, false);
      expect(expense.shareCost.calls.count()).toBe(2);
    });

  });
  
  it("deletes expense", function() {
    $scope.expense = expense;
    spyOn(balanceSheet, "removeExpense");
    
    $scope.removeExpense();
    $scope.$digest();
    
    expect(balanceSheet.removeExpense).toHaveBeenCalledWith(expense);
    expect($state.go).toHaveBeenCalledWith("balanceSheet");
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
    
    balanceSheet.removeParticipation({person: person2, expense: expense});
    $scope.refresh();
    expect($scope.isEveryoneParticipant).toBe(false);
    
    $scope.setAllParticipations(true);
    expect($scope.isEveryoneParticipant).toBe(true);
  });
});

