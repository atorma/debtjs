"use strict";

var angular = require("angular");

angular.module("debtApp")
	.config(config);

function config($urlRouterProvider) {
  
  $urlRouterProvider.otherwise("/");
  
}