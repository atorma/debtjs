"use strict";

var solve = require('./lin-eq-solver');

require("angular").module("debtApp")
.factory("solveLinearSystem", solveLinearSystem);

function solveLinearSystem() {
  return solve;
}