"use strict";

var angular = require("angular");
require("angular-mocks/ngMock");
require("../debt");
var BalanceSheet = require("../balance-sheet/balance-sheet");
  
describe("ExpenseDetailCtrl", function() {

  var vm;
  var events;
  var $scope;
  var $stateParams;
  var $state;
  var balanceSheet;
  var balanceSheetService;
  var debtService;
  var expense;
  
  beforeEach(function() {
    balanceSheet = new BalanceSheet();
    expense = balanceSheet.createExpense();
    
    balanceSheetService = jasmine.createSpyObj("balanceSheetService", ["removeExpense"]);
    balanceSheetService.balanceSheet = balanceSheet;
    
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

  
  beforeEach(angular.mock.inject(function(_events_, $rootScope, $controller, $q, $mdDialog) {
    events = _events_;
    $scope = $rootScope.$new();
    
    // Dialog always results in "OK"
    $mdDialog.show = function() {
      return $q.when();
    };
    
    vm = $controller("ExpenseDetailCtrl", {
      balanceSheetService: balanceSheetService,
      debtCalculationInterval: 0,
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

  function afterTimeout(fun) {
    setTimeout(fun, 0);
  }


  it("exposes balance sheet and expense", function() {
    expect(vm.balanceSheet).toBe(balanceSheet);
    expect(vm.expense).toBe(expense);
  });
  

  describe("updateExpense()", function() {
    
    beforeEach(function() {
      spyOn(expense, "shareCost");
      vm.expense = expense;
    });

    it("updates participation map", function() {
      var participant1 = balanceSheet.createPerson();
      var participant2 = balanceSheet.createPerson();
      var nonParticipant = balanceSheet.createPerson();
      
      balanceSheet.createParticipation({person: participant1, expense: expense});
      balanceSheet.createParticipation({person: participant2, expense: expense});
      
      vm.updateExpense();
      
      expect(vm.isParticipant[participant1.id]).toBe(true);
      expect(vm.isParticipant[participant2.id]).toBe(true);
      expect(vm.isParticipant[nonParticipant.id]).toBe(false);
    });

    it("shares cost of expense", function() {
      vm.updateExpense();
      
      expect(expense.shareCost).toHaveBeenCalled();
    });

    it("computes debts by debtor", function(done) {
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
      
      vm.updateExpense();

      afterTimeout(function() {
        expect(vm.debtsByDebtor).toBe(debtsByDebtor);
        done();
      })

    });

    it("does not compute debts if expense is unbalanced", function(done) {
      spyOn(expense, "isBalanced").and.returnValue(false);

      vm.updateExpense();

      afterTimeout(function() {
        expect(vm.debtsByDebtor).not.toBeDefined();
        done();
      })

    });
    
    it("puts expense cost into scope variable", function() {
      spyOn(expense, "getCost").and.returnValue(120);
      
      vm.updateExpense();
      
      expect(vm.cost).toBe(120);
    });
    
    it("puts expense sum of shares cost into scope variable", function() {
      spyOn(expense, "getSumOfShares").and.returnValue(120);
      
      vm.updateExpense();
      
      expect(vm.sumOfShares).toBe(120);
    });
    
    it("is done on 'balance sheet updated' event", function() {
      vm.updateExpense = jasmine.createSpy("updateExpense");
      vm.init();
      
      $scope.$root.$broadcast(events.BALANCE_SHEET_UPDATED);
      
      expect(vm.updateExpense).toHaveBeenCalled();
    });

    it("emits 'balance sheet updated' event", function() {
      expectEventEmitted(vm.updateExpense, events.BALANCE_SHEET_UPDATED);
    });
    
  });
  
  describe("setParticipation()", function() {
    
    var person;
    
    beforeEach(function() {
      person = balanceSheet.createPerson();
      spyOn(balanceSheet, "createParticipation");
      spyOn(balanceSheet, "removeParticipation");
      vm.expense = expense;
    });
    
    it("creates or removes participation", function() {      
      vm.setParticipation(person, true);
      expect(balanceSheet.createParticipation).toHaveBeenCalledWith({person: person, expense: vm.expense});
      
      vm.setParticipation(person, false);
      expect(balanceSheet.createParticipation).toHaveBeenCalledWith({person: person, expense: vm.expense});
    });

    it("emits 'balance sheet updated' event", function() {
      expectEventEmitted(function() {
        vm.setParticipation(person, true);
      }, events.BALANCE_SHEET_UPDATED);
    });

  });

  describe("removeExpense()", function() {

    beforeEach(function() {
      spyOn(balanceSheet, "removeExpense");
    });

    it("deletes expense", function() {
      vm.expense = expense;

      vm.removeExpense();
      $scope.$digest();

      expect(balanceSheet.removeExpense).toHaveBeenCalledWith(expense);
      expect($state.go).toHaveBeenCalledWith("balanceSheet");
    });

    it("emits 'balance sheet updated' event", function() {
      expectEventEmitted(vm.removeExpense, events.BALANCE_SHEET_UPDATED);
    });

  });

});

