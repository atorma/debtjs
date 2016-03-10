"use strict";

var angular = require("angular");
var _ = require("lodash");

angular
  .module("debtApp")
    .factory("debtService", debtService);


function debtService(solveDebts) {
  
  return {
    computeDebts: computeDebts,
    organizeByDebtor: organizeByDebtor
  };
  
  /////////////////////////////////////////

  function computeDebts(participations, currency) {
    if (currency !== undefined) {
      participations = _.map(participations, function(p) {
        return {
          person: p.person,
          expense: p.expense,
          paid: p.getPaid(currency),
          share: p.getShare(currency)
        };
      });
    }

    var debts = solveDebts(participations);

    if (currency !== undefined) {
      debts = _.map(debts, function(debt) {
        return _.extend(debt, {currency: currency});
      });
    }

    return debts;
  } 
  
  function organizeByDebtor(debts) {
    var debtorList = [];
    var debtorIndices = {};
    
    _.each(debts, function(d) {
      var debtorIndex = debtorIndices[d.debtor.id];
      var debtor;
      if (debtorIndex === undefined) {
        debtorIndex = debtorList.length;
        debtor = {debtor: d.debtor, debts: []};
        debtorList.push(debtor);
        debtorIndices[d.debtor.id] = debtorIndex;
      }
      debtor = debtorList[debtorIndex];
      debtor.debts.push(_.omit(d, "debtor")) ;
    });

    _.each(debtorList, function(d) {
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