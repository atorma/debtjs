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
    spyOn(balanceSheet, "removePerson");
    
    vm.removePerson();
    $scope.$digest();
    
    expect(vm.balanceSheet.removePerson).toHaveBeenCalledWith(vm.person);
    expect($state.go).toHaveBeenCalledWith("balanceSheet");
  });
  
  describe("refresh", function() {
    
    it("updates participation map", function() {
      var expense1 = vm.balanceSheet.createExpense();
      var expense2 = vm.balanceSheet.createExpense();
      var otherExpense = vm.balanceSheet.createExpense();
      
      vm.balanceSheet.createParticipation({person: vm.person, expense: expense1});
      vm.balanceSheet.createParticipation({person: vm.person, expense: expense2});
      
      vm.refresh();
      
      expect(vm.isParticipant[expense1.id]).toBe(true);
      expect(vm.isParticipant[expense2.id]).toBe(true);
      expect(vm.isParticipant[otherExpense.id]).toBe(false);
    });
    
    xit("computes who owns money and how much to the person when person is creditor", function() {
      
    });
    
    xit("computes to whom the person owns money and how much when the person is debtor", function() {
      
    });
    
    it("puts person's total costs into scope variable", function() {
      spyOn(vm.person, "getCost").and.returnValue(120);
      
      vm.refresh();
      
      expect(vm.cost).toBe(120);
    });
    
    it("puts person's sum of shares cost into scope variable", function() {
      spyOn(vm.person, "getSumOfShares").and.returnValue(120);
      
      vm.refresh();
      
      expect(vm.sumOfShares).toBe(120);
    });
    
  });
  
  describe("setParticipation", function() {
    
    var expense;
    
    beforeEach(function() {
      expense = vm.balanceSheet.createExpense();
      spyOn(expense, "shareCost");
    });
    
    it("creates or removes participation", function() {      
      vm.setParticipation(expense, true);
      
      expect(vm.person.getParticipations().length).toBe(1);
      expect(vm.person.getParticipations()[0].expense).toBe(expense);
      
      vm.setParticipation(expense, false);
      
      expect(vm.person.getParticipations().length).toBe(0);
    });
    
    it("shares cost of expense if sharing mode is 'equal'", function() {
      expense.sharing = 'equal';
      vm.setParticipation(expense, true);
      
      expect(expense.shareCost).toHaveBeenCalled();
    });
    
    it("shares cost of expense if sharing mode is 'equal'", function() {
      expense.sharing = 'equal';
      vm.setParticipation(expense, false);
      
      expect(expense.shareCost).toHaveBeenCalled();
    });
    
    it("does not share cost of expense if sharing mode is 'custom'", function() {
      expense.sharing = 'custom';
      vm.setParticipation(expense, true);
      
      expect(expense.shareCost).not.toHaveBeenCalled();
    });
    
  });

});

