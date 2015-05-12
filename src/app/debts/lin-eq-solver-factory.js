"use strict";

var solve = require("./lin-eq-solver");
var angular = require("angular");

angular.module("debtApp")
.factory("solveLinearSystem", solveLinearSystem);

function solveLinearSystem() {
  return solve;
}