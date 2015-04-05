"use strict";

var angular = require("angular");
require("angular-mocks/ngMock");
require("../debt");

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

  
  it("computeDebts uses injected debtSolver", function() {
    var participations = [{person: {id: 1}, expense: {id: 2}, paid: 10, share: 10}];
    solveDebts.and.returnValue(debts);
    
    var result = debtService.computeDebts(participations);
    
    expect(solveDebts).toHaveBeenCalledWith(participations);
    expect(result).toBe(debts);
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
