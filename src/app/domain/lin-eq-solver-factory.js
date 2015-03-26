var linEqSolver = require('./lin-eq-solver');

require("angular").module("debtApp")
.factory("linEqSolver", linEqSolverFactory);

function linEqSolverFactory() {
  return linEqSolver;
}