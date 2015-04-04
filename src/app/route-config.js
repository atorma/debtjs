"use strict";

require("angular").module("debtApp")
	.config(config);

function config($urlRouterProvider) {
  
  $urlRouterProvider.otherwise("/index.html");
  
}