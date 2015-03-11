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
			expect(anssi.name).toBe("Anssi");
			expect(malla.id).toBeDefined();
			expect(malla.name).toBe("Malla");
			expect(anssi.id).not.toEqual(malla.id);
			expect(sheet.persons).toEqual([anssi, malla]);
		});

		it("creates person with numbered name when no name given", function() {
			var person1 = sheet.createPerson();
			expect(person1.name).toBe("Person 1");
			
			sheet.createPerson({name: "Defined"});
			sheet.createExpense({name: "Defined"});
			
			var person3 = sheet.createPerson();
			expect(person3.name).toBe("Person 3");
		});

	});
	
	describe("expense", function() {
		
		it("gets distinct id when added", function() {
			var food = sheet.createExpense({name: "Food"});
			var gas = sheet.createExpense({name: "Gas"});
			
			expect(food.id).toBeDefined();
			expect(food.name).toBe("Food");
			expect(gas.id).toBeDefined();
			expect(gas.name).toBe("Gas");
			expect(food.id).not.toEqual(gas.id);
			expect(sheet.expenses).toEqual([food, gas]);
		});
		
		it("creates expense with numbered name when no name given", function() {
			var expense1 = sheet.createExpense();
			expect(expense1.name).toBe("Expense 1");
			
			sheet.createPerson({name: "Defined"});
			sheet.createExpense({name: "Defined"});
			
			var expense3 = sheet.createExpense();
			expect(expense3.name).toBe("Expense 3");
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

	describe("expenses and costs", function() {
		
		it("can be found by id", function() {
			var anssi = sheet.createPerson({name: "Anssi"});
			var food = sheet.createExpense({name: "Food"});
			var malla = sheet.createPerson({name: "Malla"});
			var gas = sheet.createExpense({name: "Gas"});

			expect(sheet.getPerson(anssi.id)).toBe(anssi);
			expect(sheet.getPerson(malla.id)).toBe(malla);
			expect(sheet.getExpense(food.id)).toBe(food);
			expect(sheet.getExpense(gas.id)).toBe(gas);
		});
		
	});

});
