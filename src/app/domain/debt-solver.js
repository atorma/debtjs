require("angular").module("debtApp")
.factory("debtSolver", debtSolver);

var Decimal = require("simple-decimal-money");


/**
 * We form a linear system Ax = b. A is a binary matrix with size (d+c)*(d*c),
 * where d is the number of debtors and c is the number of creditors. Columns of A 
 * are ordered so that x[c*i + j] is the value of the debt owed by debtor i to creditor j.
 * 
 * Elements of b are balances - converted to non-negative - of the debtors and the creditors 
 * with the following correspondence:
 * 
 * b[0]: first debtor
 * ... 
 * b[d-1]: last debtor
 * b[d] = first creditor
 * ... 
 * b[d+c-1] = last creditor
 * 
 * The coefficient matrix A is constructed so that for each person i, we have equation
 * where total value of debts to paid by i (if i is a debtor) or to i (if i is a creditor) equals i's 
 * non-negative balance.
 * 
 * Rows of A indexed between [0, d-1] represent the debtors in the order 
 * of debtors> list. Rows of A indexed between [d, d+c-1] represent the 
 * creditors in the order of creditors list.
 * 
 * Ideally, we would like to find the sparsest (most 0's) solution x to Ax = b
 * in case the system is underdetermined and has an infinite number of solutions.
 * 
 * This problem, posed as min ||x||_0  s.t. Ax = b, x >= 0, where ||x||_0 is the number
 * of non-zero elements, is in general an NP-hard problem. There is some amount of literature
 * about the problem (keywords: sparse nonnegative solution of underdetermined linear equations).
 * The problem is usually approximated as convex optimization problem by minimizing L1-norm (sum of 
 * absolute value) instead. One option could be to use the cassowary javascript library.
 * 
 * In this function find a non-negative x using Gaussian elimination and setting random combinations 
 * of free variables to zero until we find a non-negative solution.
 */
function debtSolver(linEqSolver) {
  
  return {
    solve: solve
  };
  
  function solve(participations) {
    if (!participations || participations.length === 0) {
      return [];
    }
    var balances = computeBalances(participations);
    if (!hasNonZeroBalance(balances)) {
      return [];
    }
    var roles = getDebtorsAndCreditors(balances);
    var linearSystem = createLinearSystem(roles);
    var debtVector = solveLinearSystem(linearSystem);
    var debts = createDebts(debtVector, roles);
    return debts;
  }
  
  function computeBalances(participations) {
    var balances = {};
    angular.forEach(participations, function(p) {
      var b = balances[p.person.id];
      if (b === undefined) {
        b = {person: p.person, balance: new Decimal(0)};
        balances[p.person.id] = b;
      }
      var paid = new Decimal(p.paid);
      var share = new Decimal(p.share);
      b.balance = b.balance.add(share.subtract(paid));
    });

    angular.forEach(balances, function(b) {
      b.balance = b.balance.toNumber();
    });
    
    return balances;
  }
  
  function hasNonZeroBalance(balances) {
    var result = false;
    angular.forEach(balances, function(b) {
      if (b.balance !== 0) {
        result = true;
      }
    });
    return result;
  }
  
  function getDebtorsAndCreditors(balances) {
    var debtors = [];
    var creditors = [];
    
    angular.forEach(balances, function(b) {
      if (b.balance <= 0) {
        creditors.push(b);
      } else {
        debtors.push(b);
      }
    });
    
    return {
      debtors: debtors,
      creditors: creditors
    };
  }
  
  function createLinearSystem(roles) {
    var d = roles.debtors.length;
    var c = roles.creditors.length;
    
    // Right-hand side vector, creditor balances converted to non-negative to allow binary coefficients
    var b = []; 
    for (var i = 0; i < d; i++) {
      b[i] = (new Decimal(roles.debtors[i].balance)).multiply(100).toNumber();
    }
    for (var i = 0; i < c; i++) {
      b[d + i] = (new Decimal(roles.creditors[i].balance)).multiply(-100).toNumber();
    }
    
    // Coefficient matrix
    var A = initMatrix(d + c, d*c); 
    
    // Coefficients of equations "sum of debts paid by debtor = debtor's balance"
    for (var i = 0; i < d; i++) {
      for (var j = i*c; j < (i+1)*c; j++) {
        A[i][j] = 1;
      }
    }
    
    // Coefficients of equations "sum debts received by creditor = creditor's balance"
    for (var i = d; i < c+d; ++i) {
      for (var j = (i-d); j < d*c; j += c) {
        A[i][j] = 1;
      }
    } 
    
    return {
      A: A,
      b: b
    };
  }
  
  function initMatrix(rows, cols) {
    var A = [];
    for (var i = 0; i < rows; i++) {
      A[i] = [];
      for (var j = 0; j < cols; j++) {
        A[i][j] = 0;
      }
    }
    return A;
  }
  
  // Solve debts, ensuring a non-negative solution 
  function solveLinearSystem(linearSystem) {
    var solution = linEqSolver.solve(linearSystem.A, linearSystem.b);
    var numVars = solution.numberOfVariables;
    var numFreeVars = solution.numberOfFreeVariables;
    
    if (numFreeVars === 0) {
      return solution.xVector;
    }

    var toEliminate;
    do {
      
      var A = angular.copy(linearSystem.A);
      var b = linearSystem.b;
      
      // Pick random numFreeVars variables for elimination
      
      var candidates = [];
      for (var i = 0; i < numVars; i++) {
        candidates[i] = i;
      }
      
      toEliminate = [];
      for (var i = 0; i < numFreeVars; i++) {
        var candidateIdx = Math.floor(Math.random()*candidates.length);
        toEliminate.push(candidates[candidateIdx]);
        candidates.splice(candidateIdx, 1);
      }
      
      // Eliminate the chosen variables by setting their coefficients to zero
      
      for (var i = 0; i < A.length; i++) {
        for (var j = 0; j < toEliminate.length; j++) {
          A[i][toEliminate[j]] = 0;
        }
      }

      // Solve the updated system
      
      solution = linEqSolver.solve(A, b);
      
    } while (!isNonNegative(solution.xVector));

    
    return solution.xVector;
  }
  
  function isNonNegative(vector) {
    if (!vector) {
      return false;
    }
    for (var i = 0; i < vector.length; i++) {
      if (vector[i] < 0) {
        return false;
      }
    }
    return true;
  }
  
  function createDebts(debtVector, roles) {
    var debts = [];

    for (var i = 0; i < debtVector.length; i++) {
      if (debtVector[i] != 0) {
        var debtorIdx = Math.floor(i/roles.creditors.length);
        var creditorIdx = i - roles.creditors.length*debtorIdx;
        var amount = (new Decimal(debtVector[i])).divideBy(100).toNumber();
        var debt = {debtor: roles.debtors[debtorIdx].person, creditor: roles.creditors[creditorIdx].person, amount: amount};
        debts.push(debt);
      }
    }
    
    return debts;
  }
}  