"use strict";

var BalanceSheet = require('./balance-sheet');

require("angular").module("debtApp")
.factory("balanceSheetService", balanceSheetService);

function balanceSheetService(localStorageService) {
  
  var balanceSheet;
  if (localStorageService.get("balanceSheetJson")) {
    var json = localStorageService.get("balanceSheetJson");
    balanceSheet = BalanceSheet.fromJson(json); 
  } else {
    balanceSheet = new BalanceSheet();
    balanceSheet.createPerson({name: "Anssi"});
    balanceSheet.createPerson({name: "Malla"});
    balanceSheet.createExpense({name: "Pesukone"});
    balanceSheet.createExpense({name: "TV"});
  }
  
  return {
    balanceSheet: balanceSheet,
    save: save
  };

  function save() {
    localStorageService.set("balanceSheetJson", balanceSheet.toJson());
  }
}


