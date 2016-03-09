"use strict";

var angular = require("angular");
var _ = require("lodash");
require("angular-mocks/ngMock");
require("../debt");
var BalanceSheet = require('../balance-sheet/balance-sheet');

describe("debtService", function() {

  var debtService;

  var solveDebts;
  var debts;

  beforeEach(function() {
    debts = [
      {debtor: {id: 1, name: "Valtteri"}, creditor: {id: 9, name: "Anssi"}, amount: 10},
      {debtor: {id: 2, name: "Johannes"}, creditor: {id: 8, name: "Tomi"}, amount: 15},
      {debtor: {id: 2, name: "Johannes"}, creditor: {id: 9, name: "Anssi"}, amount: 27}
    ];

    solveDebts = jasmine.createSpy("solveDebts");
    solveDebts.and.returnValue(debts);
  });

  beforeEach(angular.mock.module("debtApp", function($provide) {
    $provide.value("solveDebts", solveDebts);
  }));

  beforeEach(angular.mock.inject(function(_debtService_) {
    debtService = _debtService_;
  }));


  describe("computeDebts", function() {
    var balanceSheet;

    beforeEach(function() {
      balanceSheet = new BalanceSheet();
    });

    it("uses injected debtSolver", function() {
      var participations = [{person: {id: 1}, expense: {id: 2}, paid: 10, share: 10}];
      solveDebts.and.returnValue(debts);

      var result = debtService.computeDebts(participations);

      expect(solveDebts).toHaveBeenCalledWith(participations);
      expect(result).toBe(debts);
    });

    it("converts participations to given currency if defined and the currency to computed debts", function() {
      var p1 = balanceSheet.createPerson();
      var p2 = balanceSheet.createPerson();
      var e1 = balanceSheet.createExpense({currency: "EUR"});
      var p1e1 = balanceSheet.createParticipation({person: p1, expense: e1, paid: 10, share: 5});
      var p2e1 = balanceSheet.createParticipation({person: p2, expense: e1, paid: 0, share: 5});
      balanceSheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "DKK", rate: 7.2313});

      var result = debtService.computeDebts([p1e1, p2e1], "DKK");

      expect(solveDebts).toHaveBeenCalledWith([
        jasmine.objectContaining({paid: 72.31, share: 36.16}),
        jasmine.objectContaining({paid: 0, share: 36.16})
      ]);

      _.each(result, function(debt) {
        expect(debt.currency).toBe("DKK");
      });

    });

  });




  it("organizeByDebtor organizes debts by debtor", function() {

    var debtsByDebtor = debtService.organizeByDebtor(debts);

    expect(debtsByDebtor.length).toBe(2);
    expect(debtsByDebtor[0]).toEqual({
      debtor: {id: 2, name: "Johannes"},
      debts: [
        {creditor: {id: 9, name: "Anssi"}, amount: 27},
        {creditor: {id: 8, name: "Tomi"}, amount: 15}
      ]
    });
    expect(debtsByDebtor[1]).toEqual({
      debtor: {id: 1, name: "Valtteri"},
      debts: [
        {creditor: {id: 9, name: "Anssi"}, amount: 10}
      ]
    });
  });


});
