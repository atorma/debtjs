"use strict";

var angular = require("angular");
require("angular-mocks/ngMock");
require("../debt");
var BalanceSheet = require("../balance-sheet/balance-sheet");
var Decimal = require("simple-decimal-money");

describe("Debt solver", function() {
  
  var solveDebts;
  
  beforeEach(angular.mock.module("debtApp"));

  beforeEach(angular.mock.inject(function(_solveDebts_) {
    solveDebts = _solveDebts_;
    
  }));
  
  
  describe("computes debts from participations", function() {
    
    it("when there are two free variables", function() {
      
      var p11 = {paid: 100, share: 26, person: {id: 1, name: "Anssi"}, expense: {id: 1, name: "Food"}};
      var p21 = {paid: 0, share: 26, person: {id: 2, name: "Tomi"}, expense: {id: 1, name: "Food"}};
      var p31 = {paid: 0, share: 26, person: {id: 3, name: "Antti"}, expense: {id: 1, name: "Food"}};
      var p41 = {paid: 0, share: 26, person: {id: 4, name: "Valtteri"}, expense: {id: 1, name: "Food"}};
      var p51 = {paid: 30, share: 26, person: {id: 5, name: "Johannes"}, expense: {id: 1, name: "Food"}};
      
      var p12 = {paid: 0, share: 20, person: {id: 1, name: "Anssi"}, expense: {id: 2, name: "Drinks"}};
      var p22 = {paid: 70, share: 20, person: {id: 2, name: "Tomi"}, expense: {id: 2, name: "Drinks"}};
      var p32 = {paid: 30, share: 20, person: {id: 3, name: "Antti"}, expense: {id: 2, name: "Drinks"}};
      var p42 = {paid: 0, share: 20, person: {id: 4, name: "Valtteri"}, expense: {id: 2, name: "Drinks"}};
      var p52 = {paid: 0, share: 20, person: {id: 5, name: "Johannes"}, expense: {id: 2, name: "Drinks"}};
      
      var p13 = {paid: 0, share: 10, person: {id: 1, name: "Anssi"}, expense: {id: 3, name: "Fuel"}};
      var p23 = {paid: 0, share: 10, person: {id: 2, name: "Tomi"}, expense: {id: 3, name: "Fuel"}};
      var p33 = {paid: 0, share: 10, person: {id: 3, name: "Antti"}, expense: {id: 3, name: "Fuel"}};
      var p43 = {paid: 50, share: 10, person: {id: 4, name: "Valtteri"}, expense: {id: 3, name: "Fuel"}};
      var p53 = {paid: 0, share: 10, person: {id: 5, name: "Johannes"}, expense: {id: 3, name: "Fuel"}};
      
      var p14 = {paid: 0, share: 40, person: {id: 1, name: "Anssi"}, expense: {id: 4, name: "Poker game"}};
      var p24 = {paid: 120, share: 40, person: {id: 2, name: "Tomi"}, expense: {id: 4, name: "Poker game"}};
      var p34 = {paid: 80, share: 40, person: {id: 3, name: "Antti"}, expense: {id: 4, name: "Poker game"}};
      var p44 = {paid: 0, share: 40, person: {id: 4, name: "Valtteri"}, expense: {id: 4, name: "Poker game"}};
      var p54 = {paid: 0, share: 40, person: {id: 5, name: "Johannes"}, expense: {id: 4, name: "Poker game"}};

      // Balances
      // 1 Anssi: -4
      // 2 Tomi: -94
      // 3 Antti: -14
      // 4 Valtteri: 46 (owes money)
      // 5 Johannes: 66 (owes money)
      
      var participations = [p11, p21, p31, p41, p51, 
                            p12, p22, p32, p42, p52,
                            p13, p23, p33, p43, p53,
                            p14, p24, p34, p44, p54];
      
      
      var debts = solveDebts(participations);
      
      // Creditors get in total what they are owed by
      expect(getSum(1, debts)).toBe(4);
      expect(getSum(2, debts)).toBe(94);
      expect(getSum(3, debts)).toBe(14);
      
      // Debtors pay in total what they owe 
      expect(getSum(4, debts)).toBe(-46);
      expect(getSum(5, debts)).toBe(-66);
      
      // All amounts are positive
      angular.forEach(debts, function(d) {
        expect(d.amount).toBeGreaterThan(0);
      });
      
    });
    
    it("of random balance sheets", function() {
      for (var i = 0; i < 10; i++) {
        var balanceSheet = createRandomBalanceSheet({
          numPersons: Math.floor(Math.random()*10) + 1, 
          numExpenses: Math.floor(Math.random()*10) + 1,
          participationProb: Math.random()
        });
        
        var debts = solveDebts(balanceSheet.participations);
        
        angular.forEach(debts, function(d) {
          expect(d.amount).toBeGreaterThan(0);
        });
      }
    });
    
  });

  
  function getSum(personId, debts) {
    var sum = 0;
    angular.forEach(debts, function(d) {
      if (d.debtor.id === personId) {
        sum = sum - d.amount;
      } else if (d.creditor.id === personId) {
        sum = sum + d.amount;
      }
    });
    return sum;
  }
  
  function createRandomBalanceSheet(options) {
    var balanceSheet = new BalanceSheet();
    
    for (var i = 0; i < options.numPersons; i++) {
      balanceSheet.createPerson();
    }
    
    for (var i = 0; i < options.numExpenses; i++) {
      balanceSheet.createExpense();
    }
    
    for (var i = 0; i < balanceSheet.persons.length; i++) {
      for (var j = 0; j < balanceSheet.expenses.length; j++) {
        var p = balanceSheet.persons[i];
        var e = balanceSheet.expenses[j];
        if (Math.random() <= options.participationProb) {
          var paid = (new Decimal(Math.random()*100)).toNumber();
          balanceSheet.createParticipation({person: p, expense: e, paid: paid});
        }
      }
    }
    
    for (var j = 0; j < balanceSheet.expenses.length; j++) {
      var e = balanceSheet.expenses[j];
      e.shareCost();
    }
    
    return balanceSheet;
  }
  
}); 