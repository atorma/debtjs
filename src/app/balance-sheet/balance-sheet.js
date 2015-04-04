"use strict";

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
	  toRemove = getExpense(toRemove.id);
		_.remove(expenses, function(e) {
		  return e.equals(toRemove);
		});
		_.forEach(toRemove.getParticipations(), function(p) {
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
	  toRemove = getParticipation(toRemove);
		_.remove(participations, function(p) {
			return p.equals(toRemove);
		});
	}
	

	function Person(data) {
	  var _this = this;
		_.extend(_this, data);
		
		this.equals = equals;
		
		function equals(other) {
      return (other instanceof Person) && (other.id === _this.id);
    }
	}

	
	
	function Expense(data) {
	  var _this = this;
		_.extend(_this, data);
		
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
		
		function getBalance() {
      return _balance.value().toNumber();
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
			var share = cost.divideBy(participations.length);
			var lastShare = cost.subtract(share.multiply(participations.length - 1));

			_.forEach(participations, function(p, i) {
			  if (i < participations.length - 1) {
			    p.share = share.toNumber();
			  }
			});
			_.last(participations).share = lastShare.toNumber();
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

		if (_.isUndefined(data.paid)) {
			this.paid = 0;
		} else if (!_.isNumber(data.paid)) {
			throw "'paid' is not a number";
		} else {
			this.paid = data.paid;
		}
		
		if (_.isUndefined(data.share)) {
			this.share = 0;
		} else if (!_.isNumber(data.share)) {
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