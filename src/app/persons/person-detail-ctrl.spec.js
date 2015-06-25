"use strict";

var angular = require("angular");
require("angular-mocks/ngMock");
require("../debt");
var BalanceSheet = require("../balance-sheet/balance-sheet");
  
describe("PersonDetailCtrl", function() {

  var $timeout;
  var $scope;
  var $stateParams;
  var $state;
  var events;
  var balanceSheet;
  var balanceSheetService;
  var debtService;
  var person;
  var vm;
  
  beforeEach(function() {
    balanceSheet = new BalanceSheet();
    person = balanceSheet.createPerson();
    
    balanceSheetService = jasmine.createSpyObj("balanceSheetService", ["dummy"]);
    balanceSheetService.balanceSheet = balanceSheet;
      
    debtService = jasmine.createSpyObj("debtService", ["computeDebts", "organizeByDebtor", "organizeByCreditor"]);
    
    $stateParams = {
        id: person.id
    };
    $state = jasmine.createSpyObj("$state", ["go"]);

  });

  beforeEach(angular.mock.module("debtApp", function($provide) {
    $provide.value("$state", $state);
    $provide.value("$timeout", function(fun) {
      fun();
    });
    $provide.value("debounce", function(fun) {
      return fun;
    });
  }));
  
  beforeEach(angular.mock.inject(function(_events_, $rootScope, $controller, $q, $mdDialog) {
    events = _events_;

    $scope = $rootScope.$new();

    // Dialog always results in "OK"
    $mdDialog.show = function() {
      return $q.when();
    };

    // Debounce function that actually doesn't debounce (faster, simpler tests)
    var debounce = function(fun) {
      return fun;
    };
    
    vm = $controller("PersonDetailCtrl", {
      balanceSheetService: balanceSheetService,
      debtService: debtService,
      $stateParams: $stateParams,
      $state: $state,
      $mdDialog: $mdDialog,
      $scope: $scope
    });
    
  }));

  function expectEventEmitted(fun, eventName) {
    var eventEmitted = false;
    $scope.$parent.$on(eventName, function() {
      eventEmitted = true;
    });

    fun();
    $scope.$digest();

    expect(eventEmitted).toBe(true);
  }


  it("exposes balance sheet and person", function() {
    expect(vm.balanceSheet).toBe(balanceSheet);
    expect(vm.person).toBe(person);
  });
  

  describe("removePerson()", function() {

    beforeEach(function() {
      spyOn(balanceSheet, "removePerson");
    });

    it("deletes person and opens balance sheet view", function() {
      vm.removePerson();
      $scope.$digest();

      expect(balanceSheet.removePerson).toHaveBeenCalledWith(vm.person);
      expect($state.go).toHaveBeenCalledWith("balanceSheet");
    });

    it("emits 'balance sheet updated' event", function() {
      expectEventEmitted(vm.removePerson, events.BALANCE_SHEET_UPDATED);
    });

  });

  describe("updatePerson()", function() {

    it("emits 'balance sheet updated' event", function() {
      expectEventEmitted(vm.updatePerson, events.BALANCE_SHEET_UPDATED);
    });

  });

  
  describe("refresh()", function() {
    
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
    
    it("is done on 'balance sheet updated' event", function() {
      vm.refresh = jasmine.createSpy("refresh");
      vm.init();
      
      $scope.$root.$broadcast(events.BALANCE_SHEET_UPDATED);
      
      expect(vm.refresh).toHaveBeenCalled();
    });
    
    describe("debts", function() {

      var nonSettledParticipations;

      beforeEach(function() {
        balanceSheet.participations = "wrong participations to use";
        nonSettledParticipations = "dummy non-settled participations";
        spyOn(balanceSheet, "getNonSettledParticipations").and.returnValue(nonSettledParticipations);
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

        expect(debtService.computeDebts).toHaveBeenCalledWith(nonSettledParticipations);
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

        expect(debtService.computeDebts).toHaveBeenCalledWith(nonSettledParticipations);
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
  
  describe("updateExpense()", function() {
    
    var expense;
    
    beforeEach(function() {
      expense = balanceSheet.createExpense();
      spyOn(expense, "shareCost");
    });
        
    it("shares cost of expense", function() {
      vm.updateExpense(expense);
      
      expect(expense.shareCost).toHaveBeenCalled();
    });

    it("emits 'balance sheet updated' event", function() {
      expectEventEmitted(function() {
        vm.updateExpense(expense);
      }, events.BALANCE_SHEET_UPDATED);
    });

  });
  
  describe("setParticipation()", function() {
    
    var expense;
    
    beforeEach(function() {
      expense = balanceSheet.createExpense();
      spyOn(balanceSheet, "createParticipation");
      spyOn(balanceSheet, "removeParticipation");
    });
    
    it("creates or removes participation", function() {      
      vm.setParticipation(expense, true);
      expect(balanceSheet.createParticipation).toHaveBeenCalledWith({person: vm.person, expense: expense});

      vm.setParticipation(expense, false);
      expect(balanceSheet.removeParticipation).toHaveBeenCalledWith({person: vm.person, expense: expense});
    });

    it("emits 'balance sheet updated' event", function() {
      expectEventEmitted(function() {
        vm.setParticipation(expense, true);
      }, events.BALANCE_SHEET_UPDATED);
    });

  });

});

