BalanceSheet = (function() {

"use strict";

var BalanceSheet = function() {

	var persons = [];
	var expenses = [];
	var payments = [];
	var debts = [];
	var participations = [];
	var idSequence = 1;
	
	
	this.persons = persons;
	this.expenses = expenses;
	this.payments = payments;
	this.debts = debts;
	this.participations = participations;
	
	this.createPerson = createPerson;
	this.createExpense = createExpense;

	/////////////////////////////////////
	
	function createPerson(data) {
		if (data.id === undefined) {
			data.id = idSequence;
			idSequence = idSequence + 1;	
		}
		var person = new Person(data);
		persons.push(person);
		return person;
	}

	function createExpense(data) {
		if (data.id === undefined) {
			data.id = idSequence;
			idSequence = idSequence + 1;
			
		}
		var expense = new Expense(data);
		expenses.push(expense);
		return expense;
	}

	
	
	function Person(data) {
		this.id = data.id;
	}

	function Expense(data) {
		this.id = data.id;
		
		this.getCost = getCost;
		
		function getCost() {
			
		}
	}
};

return BalanceSheet;




})();