"use strict";

var angular = require("angular");
var Decimal = require("simple-decimal-money");

var BalanceSheet = function() {

	var persons = [];
	var expenses = [];
	var participations = [];
	var idSequence = 1;
	
	
	this.persons = persons;
	this.expenses = expenses;
	this.participations = participations;
	
	this.getPerson = getPerson;
	this.createPerson = createPerson;
	
	this.getExpense = getExpense;
	this.createExpense = createExpense;
	this.removeExpense = removeExpense;
	
	this.createParticipation = createParticipation;
	this.removeParticipation= removeParticipation;

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
		if (!data.sharing) {
			data.sharing = 'equal';
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
		angular.forEach(toRemove.getParticipations(), function(p) {
			removeParticipation(p);
		});
	}

	function createParticipation(data) {
		var participation = new Participation(data);
		participations.push(participation);
		return participation;
	}

	function removeParticipation(toRemove) {
		if (!toRemove) return;
		angular.forEach(participations, function(p, i) {
			if (p.equals(toRemove)) {
				participations.splice(i, 1);
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
		this.getParticipations = getParticipations;
		this.shareCost = shareCost;
		this.equals = equals;
		
		function getCost() {
			var cost = 0;
			angular.forEach(getParticipations(), function(p) {
				cost = cost + p.paid;
			});
			return cost;
		}
		
		function getParticipations() {
			var myParticipations = [];
			angular.forEach(participations, function(p) {
				if (_this.equals(p.expense)) {
					myParticipations.push(p);
				}
			});
			return myParticipations;
		}
		
		function shareCost() {
			var cost = new Decimal(_this.getCost());
			var participations = _this.getParticipations();
			var sum = new Decimal(0);
			for (var i = 0; i < participations.length - 1; i++) {
				var share = cost.divideBy(participations.length); 
				sum = sum.add(share);
				participations[i].share = share.toNumber();
			}
			participations[participations.length - 1].share = cost.subtract(sum).toNumber();
		}
		
		function equals(other) {
			return angular.equals(_this, other);
		}
	}
	
	function Participation(data) {
		var _this = this; 
		
		if (!data || !data.person || !data.expense) {
			throw "Undefined participation";
		}
		this.person = data.person;
		this.expense = data.expense;
		
		if (!angular.isDefined(data.paid)) {
			this.paid = 0;
		} else if (!angular.isNumber(data.paid)) {
			throw "'paid' is not a number";
		} else {
			this.paid = data.paid;
		}
		
		if (!angular.isDefined(data.share)) {
			this.share = 0;
		} else if (!angular.isNumber(data.share)) {
			throw "'share' is not a number";
		} else {
			this.share = data.share;
		}
		
		
		this.equals = equals;
		
		function equals(other) {
			return angular.equals(_this, other);
		}
	}

};

module.exports = BalanceSheet;