"use strict";

var angular = require("angular");

angular
  .module("debtApp")
    .factory("debtService", debtService);


function debtService(solveDebts) {
  
  return {
    computeDebts: computeDebts,
    organizeByDebtor: organizeByDebtor
  };
  
  /////////////////////////////////////////
  
  function computeDebts(participations) {
    return solveDebts(participations);
  } 
  
  function organizeByDebtor(debts) {
    var debtorList = [];
    var debtorIndices = {};
    
    angular.forEach(debts, function(d) {
      var debtorIndex = debtorIndices[d.debtor.id];
      var debtor;
      if (debtorIndex === undefined) {
        debtorIndex = debtorList.length;
        debtor = {debtor: d.debtor, debts: []};
        debtorList.push(debtor);
        debtorIndices[d.debtor.id] = debtorIndex;
      }
      debtor = debtorList[debtorIndex];
      debtor.debts.push({creditor: d.creditor, amount: d.amount});
    });
    
    angular.forEach(debtorList, function(d) {
      d.debts.sort(function(d1, d2) {
        return d1.creditor.name.localeCompare(d2.creditor.name);
      });
    });
    debtorList.sort(function(d1, d2) {
      return d1.debtor.name.localeCompare(d2.debtor.name);
    });
    
    return debtorList;
  }
  
}