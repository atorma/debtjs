"use strict";

var angular = require("angular");
require("angular-mocks/ngMock");
require("../debt");
var BalanceSheet = require("../balance-sheet/balance-sheet");
  
describe("PersonDetailCtrl", function() {
  
  var $scope;
  var $stateParams;
  var $state;
  var balanceSheet;
  var debtService;
  var person;
  var vm;
  
  beforeEach(function() {
    balanceSheet = new BalanceSheet();
    person = balanceSheet.createPerson();
    
    debtService = {
      computeDebts: function() {
        return [];
      },
      organizeByDebtor: function() {
        return [];
      }
    };
    
    $stateParams = {
        id: person.id
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
    
    vm = $controller("PersonDetailCtrl", {
      balanceSheet: balanceSheet,
      debtService: debtService,
      $stateParams: $stateParams,
      $state: $state,
      $mdDialog: $mdDialog
    });
    
  }));

  it("exposes balance sheet and person", function() {
    expect(vm.balanceSheet).toBe(balanceSheet);
    expect(vm.person).toBe(person);
  });
  

  it("deletes person", function() {
    vm.person = person;
    spyOn(balanceSheet, "removePerson");
    
    vm.removePerson();
    $scope.$digest();
    
    expect(balanceSheet.removePerson).toHaveBeenCalledWith(person);
    expect($state.go).toHaveBeenCalledWith("balanceSheet");
  });
  
  describe("refresh", function() {
    
    beforeEach(function() {
      spyOn(expense, "shareCost");
      vm.expense = expense;
    });
    
    xit("updates participation map", function() {
      var participant1 = balanceSheet.createPerson();
      var participant2 = balanceSheet.createPerson();
      var nonParticipant = balanceSheet.createPerson();
      
      balanceSheet.createParticipation({person: participant1, expense: expense});
      balanceSheet.createParticipation({person: participant2, expense: expense});
      
      vm.refresh();
      
      expect(vm.isParticipant[participant1.id]).toBe(true);
      expect(vm.isParticipant[participant2.id]).toBe(true);
      expect(vm.isParticipant[nonParticipant.id]).toBe(false);
    });
    
    xit("computes debts by debtor", function() {
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
      
      vm.refresh();
      
      expect(vm.debtsByDebtor).toBe(debtsByDebtor);
    });
    
    xit("puts expense cost into scope variable", function() {
      spyOn(expense, "getCost").and.returnValue(120);
      
      vm.refresh();
      
      expect(vm.cost).toBe(120);
    });
    
    xit("puts expense sum of shares cost into scope variable", function() {
      spyOn(expense, "getSumOfShares").and.returnValue(120);
      
      vm.refresh();
      
      expect(vm.sumOfShares).toBe(120);
    });
    
  });
  
  describe("setParticipation", function() {
    
    var expense;
    
    beforeEach(function() {
      expense = balanceSheet.createExpense();
      spyOn(expense, "shareCost");
      vm.person = expense;
    });
    
    xit("creates or removes participation", function() {      
      vm.setParticipation(person, true);
      
      expect(expense.getParticipations().length).toBe(1);
      expect(expense.getParticipations()[0].person).toBe(person);
      
      vm.setParticipation(person, false);
      
      expect(expense.getParticipations().length).toBe(0);
    });
    
    xit("shares cost of expense if sharing mode is 'equal'", function() {
      expense.sharing = 'equal';
      vm.setParticipation(person, true);
      
      expect(expense.shareCost).toHaveBeenCalled();
    });
    
    xit("shares cost of expense if sharing mode is 'equal'", function() {
      expense.sharing = 'equal';
      vm.setParticipation(person, false);
      
      expect(expense.shareCost).toHaveBeenCalled();
    });
    
    xit("does not share cost of expense if sharing mode is 'custom'", function() {
      expense.sharing = 'custom';
      vm.setParticipation(person, true);
      
      expect(expense.shareCost).not.toHaveBeenCalled();
    });
    
  });

});

