"use strict";

var angular = require("angular");
var expenseDetailTpl = require("./expense-detail.html");
var floatingButtonTpl = require("./floating-button.html");

angular.module("debtApp")
	.config(config);

function config($stateProvider) {

	$stateProvider
		.state("expense", {
			url: "/expenses/:id",
			views: {
				"": {
					templateUrl: expenseDetailTpl,
					controller: "ExpenseDetailCtrl as vm"
				},
				"floatingButton": {
					templateUrl: floatingButtonTpl
				}
			}
		})
		;
}