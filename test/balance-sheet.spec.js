"use strict";

var BalanceSheet = require('../src/balance-sheet');

describe("Balance sheet", function () {
	
	var sheet = null;
	
	beforeEach(function() {
		sheet = new BalanceSheet();
	});
	
	describe("person", function() {
		
		it("gets distinct id when added", function() {
			var anssi = sheet.createPerson({name: "Anssi"});
			var malla = sheet.createPerson({name: "Malla"});

			expect(anssi.id).toBeDefined();
			expect(malla.id).toBeDefined();
			expect(anssi.id).not.toEqual(malla.id);
			expect(sheet.persons).toEqual([anssi, malla]);
		});
		
	});
	
	describe("expense", function() {
		
		it("gets distinct id when added", function() {
			var food = sheet.createExpense({name: "Food"});
			var gas = sheet.createExpense({name: "Gas"});
			
			expect(food.id).toBeDefined();
			expect(gas.id).toBeDefined();
			expect(food.id).not.toEqual(gas.id);
			expect(sheet.expenses).toEqual([food, gas]);
		});
		
		xit("cost is updated when payments are created", function() {
			var expense = sheet.createExpense({});
			var person = sheet.createPerson({});
			
			expect(expense.getCost()).toBe(0);
			
			/*
			var payment = {person: person, expense: expense, amount: 23};
			sheet.setPayment(payment);
			*/
			
		});
		
	});


});
