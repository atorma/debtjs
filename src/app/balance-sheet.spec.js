"use strict";

var BalanceSheet = require('./balance-sheet');

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
		
		it("can return payments of it", function() {
			var expense1 = sheet.createExpense({});
			var expense2 = sheet.createExpense({});
			var person1 = sheet.createPerson({});
			var person2 = sheet.createPerson({});
			
			var p1To1 = sheet.createPayment({person: person1, expense: expense1, amount: 10});
			var p2To1 = sheet.createPayment({person: person2, expense: expense1, amount: 11});
			var p1To2 = sheet.createPayment({person: person1, expense: expense2, amount: 20});
			
			expect(expense1.getPayments().length).toBe(2);
			expect(expense1.getPayments()[0].equals(p1To1)).toBe(true);
			expect(expense1.getPayments()[1].equals(p2To1)).toBe(true);
			expect(expense2.getPayments().length).toBe(1);
			expect(expense2.getPayments()[0].equals(p1To2)).toBe(true);
		});

		
		it("removing removes all payments of it", function() {
			var expense1 = sheet.createExpense({});
			var expense2 = sheet.createExpense({});
			var person1 = sheet.createPerson({});
			var person2 = sheet.createPerson({});
			
			sheet.createPayment({person: person1, expense: expense1, amount: 10});
			sheet.createPayment({person: person2, expense: expense1, amount: 11});
			var p1To2 = sheet.createPayment({person: person1, expense: expense2, amount: 20});
			var p2To2 = sheet.createPayment({person: person2, expense: expense2, amount: 21});
			
			sheet.removeExpense(expense1);
			expect(sheet.expenses.length).toBe(1);
			expect(sheet.expenses[0].equals(expense2)).toBe(true);
			expect(sheet.payments.length).toBe(2);
			expect(sheet.payments[0].equals(p1To2)).toBe(true);
			expect(sheet.payments[1].equals(p2To2)).toBe(true);
			
		});
		
	});


});
