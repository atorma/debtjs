require("angular").module("debtApp")
	.config(config);

function config($stateProvider) {

	$stateProvider
		.state("expenseList", {
			url: "/expenses",
			templateUrl: "expenses/expense-list.html",
			controller: "ExpenseListCtrl",
			resolve: {
        balanceSheet: function(balanceSheetService) {
          return balanceSheetService.balanceSheet;
        }
      }
		})
		.state("expenseDetail", {
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