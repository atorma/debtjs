"use strict";

var angular = require("angular");

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
	
	this.getPerson = getPerson;
	this.createPerson = createPerson;
	
	this.getExpense = getExpense;
	this.createExpense = createExpense;
	this.removeExpense = removeExpense;
	
	
	this.createPayment = createPayment;
	this.removePayment = removePayment;

	/////////////////////////////////////
	
	function getPerson(id) {
		return getById(id, persons);
	}
	
	
	function createPerson(data) {
		if (!data) {
			data = {};
		}
		if (data.id === undefined) {
			data.id = idSequence;
			idSequence = idSequence + 1;	
		}
		if (data.name === undefined) {
			data.name = "Person " + (persons.length + 1);
		}
		var person = new Person(data);
		persons.push(person);
		return person;
	}
	
	
	function getById(id, array) {
		var found = null;
		angular.forEach(array, function(obj) {
			if (obj.id == id) {
				found = obj;
			}
		});
		return found;
	}
	
	function getExpense(id) {
		return getById(id, expenses);
	}

	function createExpense(data) {
		if (!data) {
			data = {};
		}
		if (data.id === undefined) {
			data.id = idSequence;
			idSequence = idSequence + 1;
		}
		if (data.name === undefined) {
			data.name = "Expense " + (expenses.length + 1);
		}
		var expense = new Expense(data);
		expenses.push(expense);
		return expense;
	}
	
	function removeExpense(toRemove) {
		if (!toRemove) return;
		angular.forEach(expenses, function(e, i) {
			if (e.equals(toRemove)) {
				expenses.splice(i, 1);
			}
		});
		angular.forEach(toRemove.getPayments(), function(p) {
			removePayment(p);
		});
	}

	function createPayment(data) {
		var payment = new Payment(data);
		payments.push(payment);
		return payment;
	}

	function removePayment(toRemove) {
		if (!toRemove) return;
		angular.forEach(payments, function(p, i) {
			if (p.equals(toRemove)) {
				payments.splice(i, 1);
			}
		});
	}
	
	
	function Person(data) {
		angular.extend(this, data);
	}

	
	function Expense(data) {
		angular.extend(this, data);
		var _this = this;
		
		this.getCost = getCost;
		this.getPayments = getPayments;
		this.equals = equals;
		
		function getCost() {
			var cost = 0;
			angular.forEach(getPayments(), function(p) {
				cost = cost + p.amount;
			});
			return cost;
		}
		
		function getPayments() {
			var myPayments = [];
			angular.forEach(payments, function(p) {
				if (_this.equals(p.expense)) {
					myPayments.push(p);
				}
			});
			return myPayments;
		}
		
		function equals(other) {
			return angular.equals(_this, other);
		}
	}
	
	function Payment(data) {
		var _this = this; 
		
		if (!data || !data.person || !data.expense) {
			throw "Undefined payment";
		}
		this.person = data.person;
		this.expense = data.expense;
		
		if (!angular.isDefined(data.amount)) {
			this.amount = 0;
		} else if (!angular.isNumber(data.amount)) {
			throw "Amount is not a number";
		} else {
			this.amount = data.amount;
		}
		
		this.equals = equals;
		
		function equals(other) {
			return angular.equals(_this, other);
		}
	}

};

module.exports = BalanceSheet;