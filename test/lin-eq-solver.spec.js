(function () {

"use strict";

describe("Linear equation solver", function () {

	it("solves a square system with a unique solution", function () {
		var coefMatrix = [
			[1, -1, -2],
			[-3, 5, 8],
			[2, -1, -5]
		];
		var rhsVector = [-1, 7, 4];
		var expectedResult = [-1, 4, -2];
		
		var solution = linEqSolver.solve(coefMatrix, rhsVector);
		
		expect(solution.xVector).toEqual(expectedResult);
	});

	it("solves a square system with non-unique solution", function () {
		var coefMatrix = [
			[1, -1, -2, 1],
			[-3, 5, 8, 3],
			[2, -1, -5, 5],
			[0, 1, 1, 3]
		];
		var rhsVector = [-1, 7, 4, 2];
		var expectedResult = [-1, 4, -2, 0];
		
		var solution = linEqSolver.solve(coefMatrix, rhsVector);
		
		expect(solution.xVector).toEqual(expectedResult);
		expect(solution.rank).toBe(3);
		expect(solution.numberOfSolutions).toBe(Number.MAX_VALUE);
	});
	
	it("solves a system with no solutions", function () {
		var coefMatrix = [
			[1, -1, -2],
			[-3, 5, 8],
			[2, -1, -5],
			[2, -1, -5]
		];
		var rhsVector = [-1, 7, 4, 8];
		
		var solution = linEqSolver.solve(coefMatrix, rhsVector);
		
		expect(solution.xVector).toBe(undefined);
		expect(solution.rank).toBe(3);
		expect(solution.numberOfSolutions).toBe(0);
	});
	
	it("solves a system with a parameterized solution (m x n system with m < n)", function () {
		var coefMatrix = [
			[1, -1, -2, 1],
			[-3, 5, 8, 3],
			[2, -1, -5, 5],
			[0, 1, 1, 3],
			[-1, 4, 5, 8]
		];
		var rhsVector = [-1, 7, 4, 2, 7];
		var expectedResult = [-1, 4, -2, 0];
		
		var solution = linEqSolver.solve(coefMatrix, rhsVector);
		
		expect(solution.xVector).toEqual(expectedResult);
		expect(solution.rank).toBe(3);
		expect(solution.numberOfSolutions).toBe(Number.MAX_VALUE);
	});
	
	it("solves a specific system 1", function () {
		var coefMatrix = [
			[-1, 0, 0, 0],
			[0, -1, 0, 0],
			[0, 0, -1, 0],
			[0, 0, 0, -1],
			[1, 1, 1, 1]
		];
		var rhsVector = [-30, -30, -30, -30, 120];
		var expectedResult = [30, 30, 30, 30];
		
		var solution = linEqSolver.solve(coefMatrix, rhsVector);
		
		expect(solution.xVector).toEqual(expectedResult);
		expect(solution.rank).toBe(4);
		expect(solution.numberOfSolutions).toBe(1);
	});
	
	it("solves a specific system 2", function () {
		var coefMatrix = [
			[-1, -1, -1, 0],
			[0, 0, 0, -1],
			[1, 0, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 1, 1]
		];
		var rhsVector = [-66, -46, 4, 14, 94];
		var expectedResult = [4, 14, 48, 46];
		
		var solution = linEqSolver.solve(coefMatrix, rhsVector);
		
		expect(solution.xVector).toEqual(expectedResult);
		expect(solution.rank).toBe(4);
		expect(solution.numberOfSolutions).toBe(1);
	});

});

})();
