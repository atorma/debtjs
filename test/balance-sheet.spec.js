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
		
		describe("cost", function() {
			
			var expense, person1, person2;
			
			beforeEach(function() {
				expense = sheet.createExpense({});
				person1 = sheet.createPerson({});
				person2 = sheet.createPerson({});
			});
			
			it("is initially zero", function() {
				expect(expense.getCost()).toBe(0);
			});
			
			it("is updated when payment is created", function() {
				var payment1 = sheet.createPayment({person: person1, expense: expense, amount: 11});
				expect(expense.getCost()).toBe(11);
				
				var payment2 = sheet.createPayment({person: person2, expense: expense, amount: 22});
				expect(expense.getCost()).toBe(11 + 22);
			});
			
			it("is updated when payment is updated", function() {
				var payment1 = sheet.createPayment({person: person1, expense: expense, amount: 10});
				payment1.amount = 200;
				expect(expense.getCost()).toBe(200);
			});
			
			it("is updated when payment is deleted", function() {
				var payment1 = sheet.createPayment({person: person1, expense: expense, amount: 10});
				var payment2 = sheet.createPayment({person: person1, expense: expense, amount: 15});
				expect(expense.getCost()).toBe(25);
				sheet.removePayment(payment2);
				expect(expense.getCost()).toBe(10);
			});
			
			it("is computed over correct expenses", function() {
				var expense2 = sheet.createExpense({});
				sheet.createPayment({person: person1, expense: expense, amount: 10});
				expect(expense.getCost()).toBe(10);
				
				sheet.createPayment({person: person1, expense: expense2, amount: 999});
				expect(expense.getCost()).toBe(10);
			});
		});

		
		
	});


});
