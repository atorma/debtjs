"use strict";


function solve(A, b) {
	// Internal copies of the linear system and its dimensions
	var coefMatrix, constVector, xVector;
	var m, n, rank, numberOfSolutions;
	
	// With these we can "virtually" rearrange the rows and columns
	// for better numerical stability in the variable elimination phases.
	// At step i, row index pivotToEquationMap[i] is the pivot equation and
	// it is used for eliminating variable index pivotToVariableMap[i] from all the
	// other equations.
	var pivotToEquationMap, pivotToVariableMap, equationScale;
	
	validate();
	initialize();
	transformToRowEchelonForm();
	reduceRowEchelonForm();
	determineRank();
	determineNumberOfSolutions();
	determineSolution();

	return {
		xVector: xVector,
		numberOfEquations: m,
		numberOfVariables: n,
		rank: rank,
		numberOfFreeVariables: n - rank,
		numberOfSolutions: numberOfSolutions
	};
	
	/////////////////////////////////////////////////////////////
	
	function validate() {
    	if (!A || !b) {
    		throw "Null matrix A or vector b in system Ax = b";
    	}
    	
    	if (A.length < 1 || A[0].length < 1) {
    		throw "Matrix A in Ax = b has no rows or no columns";
    	}
		
    	if (A.length != b.length) {
    		throw "The dimensions of the matrix and the constant vector are incompatible"; 
    	}
	}

	function initialize() {
		coefMatrix = copyMatrix(A);
		constVector = copyArray(b);
		
		m = coefMatrix.length;
		n = coefMatrix[0].length;

		pivotToEquationMap = [];
		for (var i = 0; i < m; i++) {
			pivotToEquationMap[i] = i;
		}
		
		equationScale = [];
		for (var i = 0; i < m; i++) {
			equationScale[i] = 0;
			for (var j = 0; j < n; j++) {
				var abscoef = Math.abs(coefMatrix[i][j]);
				if (abscoef > equationScale[i]) {
					equationScale[i] = abscoef;
				}
			}
		}

		pivotToVariableMap = [];
		for (var j = 0; j < n; j++) {
			pivotToVariableMap[j] = j;
		}
	}

	function transformToRowEchelonForm() {
		var pivotIdx = 0; 
		var knownFreeVariables = [];
		
		while (pivotIdx < m-1) { 

			// Choose the best pivot-equation for eliminating variable pivotToVariableMap[pivotIdx] 
			// from equations equations not yet used as pivot equations.
			var maxRatio = 0;
			var bestPivotEquationIndex = pivotIdx;
			for (var i = pivotIdx; i < m; ++i) {
				var rowIdx = pivotToEquationMap[i];
				var colIdx = pivotToVariableMap[pivotIdx];
				var ratio = Math.abs(coefMatrix[rowIdx][colIdx]/equationScale[rowIdx]);
	
				if (ratio > maxRatio) {
					maxRatio = ratio;
					bestPivotEquationIndex = i;	
				}
			}

			// If maxRatio == 0, the coefficient of variable pivotToVariableMap[pivotIdx] is 0 in all the rest of the equations. 
			// That is pivotToVariableMap[pivotIdx] is a free variable. Find the next suitable variable.
			if (maxRatio == 0) {
				var currPivotVaribleIdx = pivotToVariableMap[pivotIdx];
				knownFreeVariables[currPivotVaribleIdx] = true;     
				
				// The next one must not be a free variable.
				var i = pivotIdx;
				var newPivotVariableIdx = currPivotVaribleIdx;
				while (newPivotVariableIdx == currPivotVaribleIdx && i < n-1) {
					++i;
					if (!knownFreeVariables[pivotToVariableMap[i]]) {
						newPivotVariableIdx = pivotToVariableMap[i];
					}
				}

				if (newPivotVariableIdx != currPivotVaribleIdx) {
					pivotToVariableMap[pivotIdx] = newPivotVariableIdx;
					pivotToVariableMap[i] = currPivotVaribleIdx;
					continue;
				} else { 
					// Could not find a suitable variable. This means the row echelon form is ready.
					return;
				}
			}
		
			var temp = pivotToEquationMap[pivotIdx];
			pivotToEquationMap[pivotIdx] = pivotToEquationMap[bestPivotEquationIndex];
			pivotToEquationMap[bestPivotEquationIndex] = temp;     
			
			// Elimination phase
			var pivotRowIdx = pivotToEquationMap[pivotIdx];
			var pivotColIdx = pivotToVariableMap[pivotIdx];
			for (i = pivotIdx + 1; i < m; ++i) {
				var rowIdx = pivotToEquationMap[i];
				var mult = coefMatrix[rowIdx][pivotColIdx] / coefMatrix[pivotRowIdx][pivotColIdx];

				for (var j = pivotIdx + 1; j < n; ++j) {
					var colIndex = pivotToVariableMap[j];
					coefMatrix[rowIdx][colIndex] = coefMatrix[rowIdx][colIndex] - mult * coefMatrix[pivotRowIdx][colIndex];
				}

				coefMatrix[rowIdx][pivotColIdx] = 0;
				constVector[rowIdx] = constVector[rowIdx] - mult * constVector[pivotRowIdx];
			}

			pivotIdx++;
			
		}
	}

	function reduceRowEchelonForm() {
		// Eliminate pivot variables from previous pivot equations by going through the pivot steps in reverse order.
		var pivotIndex;
		for (pivotIndex = Math.min(m, n) - 1; pivotIndex > 0; --pivotIndex) {
			var pivotRowIdx = pivotToEquationMap[pivotIndex];
			var pivotColIdx = pivotToVariableMap[pivotIndex];
			
			if (coefMatrix[pivotRowIdx][pivotColIdx] == 0) {
				continue;
			}
			
			for (var i = pivotIndex - 1; i > -1; --i) {
				
				var mult = coefMatrix[pivotToEquationMap[i]][pivotToVariableMap[pivotIndex]]/coefMatrix[pivotToEquationMap[pivotIndex]][pivotToVariableMap[pivotIndex]];
				for (var j = 0; j < n; ++j) {
					coefMatrix[pivotToEquationMap[i]][pivotToVariableMap[j]] -= mult*coefMatrix[pivotToEquationMap[pivotIndex]][pivotToVariableMap[j]];
				}
				
				constVector[pivotToEquationMap[i]] -= mult*constVector[pivotToEquationMap[pivotIndex]];
			}            		
		}
		
		// Normalize the coeffients in each row and the rhs value by the coeffient of the pivot variable in the row
		for (pivotIndex = 0; pivotIndex < Math.min(m, n); ++pivotIndex) {
			
			if (coefMatrix[pivotToEquationMap[pivotIndex]][pivotToVariableMap[pivotIndex]] == 0) {
				continue; 
			}

			var div = coefMatrix[pivotToEquationMap[pivotIndex]][pivotToVariableMap[pivotIndex]];
			for (var j = 0; j < n; ++j) {
				coefMatrix[pivotToEquationMap[pivotIndex]][j] = coefMatrix[pivotToEquationMap[pivotIndex]][j]/div;
			}
			constVector[pivotToEquationMap[pivotIndex]] = constVector[pivotToEquationMap[pivotIndex]]/div;
		}
		
	}

	function determineRank() {
		rank = 0;
		var i,j;
		
		columns: 
		for (j=0; j<n; ++j) {
			rows:
			for (i=0; i<m; ++i) { 
				if (i != j && coefMatrix[pivotToEquationMap[i]][pivotToVariableMap[j]] != 0) {
					break columns;
				}
				else if (i == j && coefMatrix[pivotToEquationMap[i]][pivotToVariableMap[j]] != 1) {
					break columns;
				}
			}
			++rank;
		}
	}

	function determineNumberOfSolutions() {
		
		var b2IsZero = true;

		for (var i = rank; i < m; ++i) {
			if (constVector[pivotToEquationMap[i]] != 0) {
				b2IsZero = false;
				break;
			}
		}
		
		if (rank < m && !b2IsZero) {
			numberOfSolutions = 0;
		} else if (rank == n && (rank == m || b2IsZero)) {
			numberOfSolutions = 1;
		} else if (rank < n && (rank == m || b2IsZero)) {
			numberOfSolutions = Number.MAX_VALUE;
		}
	}

	function determineSolution() {
		if (numberOfSolutions == 0) {
			xVector = undefined;
		} else {
			xVector = initArray(n);
			for (var i = 0; i < rank; ++i) {
				xVector[pivotToVariableMap[i]] = constVector[pivotToEquationMap[i]];
			}
		}
	}
}

function initArray(size) {
		var array = [];
		for (var i = 0; i < size; i++) {
			array[i] = 0;
		}
		return array;
	}
	
function copyArray(input) {
	return input.slice();
}

function copyMatrix(input) {
	var copy = [];
	for (var i = 0; i < input.length; i++) {
		copy[i] = input[i].slice();
	}
	return copy;
}
	

module.exports = {
	solve: solve
};