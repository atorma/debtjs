require("angular").module("debtApp")
	.factory("state", stateFactory);

var BalanceSheet = require("../domain/balance-sheet");

function stateFactory() {
	var balanceSheet = new BalanceSheet();
	balanceSheet.createPerson({name: "Anssi"});
	balanceSheet.createPerson({name: "Malla"});
	balanceSheet.createExpense({name: "Pesukone"});
	balanceSheet.createExpense({name: "TV"});
	
	return {
		balanceSheet: balanceSheet
	};
}
