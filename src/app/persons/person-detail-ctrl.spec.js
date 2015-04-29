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
    
    debtService = jasmine.createSpyObj("debtService", ["computeDebts", "organizeByDebtor", "organizeByCreditor"]);
    
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
  

  it("delete method deletes person and updates all expenses the person participates in", function() {
    spyOn(balanceSheet, "removePerson");
    spyOn(vm, "updateExpense");
    
    var expense1 = vm.balanceSheet.createExpense({name: "Expense 1"});
    vm.balanceSheet.createParticipation({person: person, expense: expense1});
    var expense2 = vm.balanceSheet.createExpense({name: "Expense 2"});
    vm.balanceSheet.createParticipation({person: person, expense: expense2});
    var otherExpense = vm.balanceSheet.createExpense({name: "Other expense"});
    
    vm.removePerson();
    $scope.$digest();
    
    expect(vm.balanceSheet.removePerson).toHaveBeenCalledWith(vm.person);
    expect(vm.updateExpense).toHaveBeenCalledWith(expense1);
    expect(vm.updateExpense).toHaveBeenCalledWith(expense2);
    expect(vm.updateExpense).not.toHaveBeenCalledWith(otherExpense);
    expect($state.go).toHaveBeenCalledWith("balanceSheet");
  });
  
  describe("refresh method", function() {
    
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
    
    it("puts person's balance into scope variable", function() {
      spyOn(vm.person, "getBalance").and.returnValue(120);
      
      vm.refresh();
      
      expect(vm.balance).toBe(120);
    });
    
    describe("debts", function() {
            
      beforeEach(function() {
        balanceSheet.participations = [{person: "Dummy participation"}];
      });
      
      it("computed with role creditor when person's balance is negative", function() {
        spyOn(balanceSheet, "isBalanced").and.returnValue(true);
        spyOn(person, "getBalance").and.returnValue(-100);

        var debtor1 = balanceSheet.createPerson({name: "Debtor 1"});
        var debtor2 = balanceSheet.createPerson({name: "Debtor 2"});
        var otherCreditor = balanceSheet.createPerson({name: "Other creditor"});
        
        var debts = [
                     {debtor: debtor1, creditor: otherCreditor, amount: 10},
                     {debtor: debtor2, creditor: person, amount: 50}
                    ];
        debtService.computeDebts.and.returnValue(debts);
        
        vm.refresh();
        
        expect(debtService.computeDebts).toHaveBeenCalledWith(balanceSheet.participations);
        expect(vm.debtRole).toEqual("creditor");
        expect(vm.debts).toEqual([{person: debtor2, amount: 50}]);
      });
      
      it("computed with role debtor when person's balance is positive", function() {
        spyOn(balanceSheet, "isBalanced").and.returnValue(true);
        spyOn(person, "getBalance").and.returnValue(100);
        
        var creditor1 = balanceSheet.createPerson({name: "Creditor 1"});
        var creditor2 = balanceSheet.createPerson({name: "Creditor 2"});
        var otherDebtor = balanceSheet.createPerson({name: "Other debtor"});
        
        var debts = [
                     {debtor: person, creditor: creditor1, amount: 10},
                     {debtor: otherDebtor, creditor: creditor2, amount: 50}
                    ];
        debtService.computeDebts.and.returnValue(debts);
        
        vm.refresh();
        
        
        expect(debtService.computeDebts).toHaveBeenCalledWith(balanceSheet.participations);
        expect(vm.debtRole).toEqual("debtor");
        expect(vm.debts).toEqual([{person: creditor1, amount: 10}]);
      });
      
      it("not computed and role is settled when person's balance is zero", function() {
        spyOn(balanceSheet, "isBalanced").and.returnValue(true);
        spyOn(person, "getBalance").and.returnValue(0); 
        
        vm.refresh();
        
        expect(debtService.computeDebts).not.toHaveBeenCalled();
        expect(vm.debtRole).toEqual("settled");
        expect(vm.debts).not.toBeDefined();
      });
      
      it("not computed and role is unbalanced", function() {
        spyOn(balanceSheet, "isBalanced").and.returnValue(false);
        spyOn(person, "getBalance").and.returnValue(10); 
        
        vm.refresh();
        
        expect(debtService.computeDebts).not.toHaveBeenCalled();
        expect(vm.debtRole).toEqual("unbalanced");
        expect(vm.debts).not.toBeDefined();
      });
      
    });

  });
  
  describe("updateExpense", function() {
    
    var expense;
    
    beforeEach(function() {
      expense = balanceSheet.createExpense();
      spyOn(expense, "shareCost");
    });
        
    it("shares cost of expense if sharing mode is 'equal'", function() {
      expense.sharing = 'equal';
      
      vm.updateExpense(expense);
      
      expect(expense.shareCost).toHaveBeenCalled();
    });
    
    it("shares cost of expense if sharing mode is 'equal'", function() {
      expense.sharing = 'equal';
      
      vm.updateExpense(expense);
      
      expect(expense.shareCost).toHaveBeenCalled();
    });
    
    it("does not share cost of expense if sharing mode is 'custom'", function() {
      expense.sharing = 'custom';
      
      vm.updateExpense(expense, true);
      
      expect(expense.shareCost).not.toHaveBeenCalled();
    });
    
  });
  
  describe("setParticipation", function() {
    
    var expense;
    
    beforeEach(function() {
      expense = balanceSheet.createExpense();
      spyOn(expense, "shareCost");
    });
    
    it("creates or removes participation", function() {      
      vm.setParticipation(expense, true);
      
      expect(vm.person.getParticipations().length).toBe(1);
      expect(vm.person.getParticipations()[0].expense).toBe(expense);
      
      vm.setParticipation(expense, false);
      
      expect(vm.person.getParticipations().length).toBe(0);
    });
    
    it("updates expense", function() {
      spyOn(vm, "updateExpense").and.callThrough();
      
      vm.setParticipation(expense, true);
      
      expect(vm.updateExpense).toHaveBeenCalledWith(expense);
    });

  });

});

