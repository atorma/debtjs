"use strict";

require("angular").module("debtApp")
	.config(config);

function config($stateProvider) {

	$stateProvider
		.state("expense", {
			url: "/expenses/:id",
	    templateUrl: "expenses/expense-detail.html",
      controller: "ExpenseDetailCtrl",
      resolve: {
        balanceSheet: function(balanceSheetService) {
          return balanceSheetService.balanceSheet;
        }
      }
		})
		;
}