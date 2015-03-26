"use strict";

var angular = require("angular");
require("angular-mocks/ngMock");
require("../debt");

describe("Debt solver", function() {
  
  var debtSolver;
  
  beforeEach(angular.mock.module("debtApp"));

  beforeEach(angular.mock.inject(function($injector) {
    debtSolver = $injector.get("debtSolver");
    
  }));
  
  
  describe("computes debts", function() {
    
    it("from given participations", function() {
      
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
      
      
      var debts = debtSolver.solve(participations);
      console.log(angular.toJson(debts));
      
      // Creditors get in total what they are owed by
      expect(getSum(1, debts)).toBe(4);
      expect(getSum(2, debts)).toBe(94);
      expect(getSum(3, debts)).toBe(14);
      
      // Debtors pay in total what they owe 
      expect(getSum(4, debts)).toBe(-46);
      expect(getSum(5, debts)).toBe(-66);
      
      // All amounts are non-negative
      angular.forEach(debts, function(d) {
        expect(d.amount).not.toBeLessThan(0);
      });
      
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
  
});