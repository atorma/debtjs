var BalanceSheet = require('./balance-sheet');

require("angular").module("debtApp")
.factory("balanceSheetService", balanceSheetService);

function balanceSheetService() {
  
  var balanceSheet = new BalanceSheet();
  balanceSheet.createPerson({name: "Anssi"});
  balanceSheet.createPerson({name: "Malla"});
  balanceSheet.createExpense({name: "Pesukone"});
  balanceSheet.createExpense({name: "TV"});
  
  return {
    balanceSheet: balanceSheet
  };
  
}