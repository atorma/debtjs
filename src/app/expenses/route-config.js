"use strict";

var angular = require("angular");

angular.module("debtApp")
	.config(config);

function config($stateProvider) {

	$stateProvider
		.state("expense", {
			url: "/expenses/:id",
	    templateUrl: "expenses/expense-detail.html",
      controller: "ExpenseDetailCtrl as vm"
		})
		;
}