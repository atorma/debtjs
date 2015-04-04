"use strict";

var angular = require("angular");
var _ = require('lodash');
var Decimal = require("simple-decimal-money");

var BalanceSheet = function() {

	var persons = [];
	var expenses = [];
	var participations = [];
	var idSequence = 1;
	
	this.name = "New sheet";
	this.persons = persons;
	this.expenses = expenses;
	this.participations = participations;
	
	this.isBalanced = isBalanced;
	
	this.getPerson = getPerson;
	this.createPerson = createPerson;
	
	this.getExpense = getExpense;
	this.createExpense = createExpense;
	this.removeExpense = removeExpense;
	
	this.getParticipation = getParticipation;
	this.createParticipation = createParticipation;
	this.removeParticipation= removeParticipation;

	
	/////////////////////////////////////
	
	
	function isBalanced() {
	  return _.reduce(expenses, function(isBalanced, e) {
	    return isBalanced && e.isBalanced();
	  }, true); 
	}
	
	
	function getPerson(id) {
		return _(persons).find(function(p) {
		  return p.id == id;
		});
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
	
	function getExpense(id) {
	  return _(expenses).find(function(e) {
      return e.id == id;
    });
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

	
	function getParticipation(criteria) {
	  var toSeek = new Participation(criteria); 
	  return _(participations).find(function(p) {
	    return toSeek.equals(p);
	  });
	}
	
	function createParticipation(data) {
		if (getParticipation(data)) {
      throw "Duplicate participation";
    }
		var participation = new Participation(data); 
		participations.push(participation);
		return participation;
	}

	function removeParticipation(toRemove) {
		if (!toRemove) return;
		toRemove = new Participation(toRemove);
		angular.forEach(participations, function(p, i) {
			if (p.equals(toRemove)) {
				participations.splice(i, 1);
			}
		});
	}
	

	function Person(data) {
		angular.extend(this, data);
		var _this = this;
		
		this.equals = equals;
		
		function equals(other) {
      return (other instanceof Person) && (other.id === _this.id);
    }
	}

	
	
	function Expense(data) {
		angular.extend(this, data);
		var _this = this;

		this.getCost = getCost;
		this.getSumOfShares = getSumOfShares;
		this.isBalanced = isBalanced;
		this.getParticipations = getParticipations;
		this.shareCost = shareCost;
		this.equals = equals;
		
		var _myParticipations = _.chain(participations).filter(function(p) {
		  return _this.equals(p.expense);
		});
		
		var _cost = _myParticipations
		.map("paid").reduce(function(cost, paid) {
		  return cost.add(paid);
		}, new Decimal(0));
		
		var _sumOfShares = _myParticipations
    .map("share").reduce(function(sum, share) {
      return sum.add(share);
    }, new Decimal(0));
		
		var _balance = _myParticipations
		.map(function(p) {
		  return (new Decimal(p.share)).subtract(p.paid);
		})
		.reduce(function(sum, b) {
		  return sum.add(b);
		}, new Decimal(0));
		
		
		function getCost() {
		  return _cost.value().toNumber();
		}
		
		function getSumOfShares() {
      return _sumOfShares.value().toNumber();
		}
		
		function isBalanced() {
		  return _balance.value().toNumber() === 0;
		}

		function getParticipations() {
			return _myParticipations.value();
		}
		
		function shareCost() {
		  var participations = _this.getParticipations();
		  if (participations.length === 0) {
		    return;
		  }
		  
			var cost = new Decimal(_this.getCost());
			var sum = new Decimal(0);
			for (var i = 0; i < participations.length - 1; i++) {
				var share = cost.divideBy(participations.length); 
				sum = sum.add(share);
				participations[i].share = share.toNumber();
			}
			participations[participations.length - 1].share = cost.subtract(sum).toNumber();
		}
		
		function equals(other) {
			return (other instanceof Expense) && (other.id === _this.id);
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
			return (other instanceof Participation) && _this.person.equals(other.person) && _this.expense.equals(other.expense);
		}
	}

};

module.exports = BalanceSheet;