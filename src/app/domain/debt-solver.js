require("angular").module("debtApp")
.factory("debtSolver", debtSolver);

var Decimal = require("simple-decimal-money");


/**
 * Backbone of the solution algorithm.
 * 
 * We form a linear system Ax = b. When there are d debtors and c creditors, 
 * the size of solution x is (d*c)*1 and x[c*i + j] is the value of the debt owed 
 * by debtor i to creditor j.
 * <p>
 * Elements of b are balances of the debtors (positive) and creditors (negative)
 * with the following correspondence:
 * <p>
 * b[0]: first debtor <br>
 * ... <br>
 * b[d-1]: last debtor <br>
 * b[d] = first creditor <br>
 * ... <br>
 * b[d+c-1] = last creditor <br>
 * <p>
 * The coefficient matrix A is constructed so that for each debtor i, we have equation
 * where total value of debts to paid by i equals i's balance:<br>
 * x[c*i] + x[c*i + 1] + ... + x[c*i + c] = b[i] <br>
 * Coefficients for other elements of x are zero. <br>
 * For each creditor j, we must have equation where the total value of debts received by j
 * equals i's balance:<br>
 * -x[c*i] - x[c*i + 1] - ... -x[c*i + c] = b[i] <br>
 * Coefficients for other elements of x are zero. <br>
 * <p>
 * Thus, the size of the coefficient matrix A is (d+c)*(d*c).
 * Rows of A indexed between [0, d-1] represent the debtors in the order 
 * of <code>debtors</code> list. Rows of A indexed between [d, d+c-1] 
 * represent the creditor in the order of <code>creditors</code> 
 * list. Values of A are -1, 0, or 1: <br>
 *  -1: the person corresponding to the row is the creditor of the debt <br>
 *   0: = the person is neither the debtor nor the creditor in the debt <br>
 *   1: the person is the debtor of the debt <br>  
 * <p>
 * This linear system is solved by Gaussian elimination. It is possible that it has no
 * unique solution. 
 */
function debtSolver(linEqSolver) {
  
  return {
    solve: solve
  };
  
  function solve(participations) {
    var balances = computeBalances(participations);
    var roles = getDebtorsAndCreditors(balances);
    var linearSystem = createLinearSystem(roles);
    var linearSystemSolution = linEqSolver.solve(linearSystem.A, linearSystem.b);
    var debts = createDebts(linearSystemSolution, roles);
    
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
  
  // Creates a system where debts are solved in cents
  function createLinearSystem(roles) {
    var d = roles.debtors.length;
    var c = roles.creditors.length;
    
    // Right-hand side vector
    var b = []; 
    for (var i = 0; i < d; i++) {
      b[i] = (new Decimal(roles.debtors[i].balance)).multiply(100).toNumber();
    }
    for (var i = 0; i < c; i++) {
      b[d + i] = (new Decimal(roles.creditors[i].balance)).multiply(100).toNumber();
    }
    
    // Coefficient matrix
    var A = initMatrix(d + c, d*c); 
    
    // Coefficients of equations "sum of debts paid by debtor = sum debtor's balance"
    for (var i = 0; i < d; i++) {
      for (var j = i*c; j < (i+1)*c; j++) {
        A[i][j] = 1;
      }
    }
    
    // Coefficients of equations "negative sum debts received by creditor = sum creditor's credit"
    for (var i = d; i < c+d; ++i) {
      for (var j = (i-d); j < d*c; j += c) {
        A[i][j] = -1;
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
  
  function createDebts(linearSystemSolution, roles) {
    var x = linearSystemSolution.xVector;
    var debts = [];

    for (var i = 0; i < x.length; i++) {
      if (x[i] != 0) {
        var debtorIdx = Math.floor(i/roles.creditors.length);
        var creditorIdx = i - roles.creditors.length*debtorIdx;
        var amount = (new Decimal(x[i])).divideBy(100).toNumber();
        var debt = {debtor: roles.debtors[debtorIdx].person, creditor: roles.creditors[creditorIdx].person, amount: amount};
        debts.push(debt);
      }
    }
    
    return debts;
  }
} 