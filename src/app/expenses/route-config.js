"use strict";

require("angular").module("debtApp")
	.config(config);

function config($stateProvider) {

	$stateProvider
		.state("expenses", {
			url: "/expenses",
			views: {
			  "main": {
			    templateUrl: "expenses/expense-list.html",
		      controller: "ExpenseListCtrl"
			  }
			},
			resolve: {
        balanceSheet: function(balanceSheetService) {
          return balanceSheetService.balanceSheet;
        }
      }
		})
		.state("expenses.detail", {
			url: "/:id",
			views: {
			  "main@": {
			    templateUrl: "expenses/expense-detail.html",
		      controller: "ExpenseDetailCtrl"
			  }
			}
		})
		;
}