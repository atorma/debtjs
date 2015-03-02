BalanceSheet = (function() {

"use strict";

var BalanceSheet = function() {
	
	this.idSequence = 1;
	this.persons = [];
	this.expenses = [];
	this.payments = [];
	this.debts = [];
	this.participations = [];
};

BalanceSheet.prototype.createPerson = createPerson;
BalanceSheet.prototype.createExpense = createExpense;

return BalanceSheet;


function createPerson(data) {
	if (data.id === undefined) {
		data.id = this.idSequence;
		this.idSequence = this.idSequence + 1;	
	}
	var person = new Person(data);
	this.persons[person.id] = person;
	return person;
}

function createExpense(data) {
	if (data.id === undefined) {
		data.id = this.idSequence;
		this.idSequence = this.idSequence + 1;
		
	}
	var expense = new Expense(data);
	this.expenses[expense.id] = expense;
	return expense;
}

function Person(data) {
	this.id = data.id;
}

function Expense(data) {
	this.id = data.id;
	this.cost = data.cost || 0;
}

})();