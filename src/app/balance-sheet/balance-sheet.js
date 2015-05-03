"use strict";

var _ = require('lodash');
var angular = require("angular");
var Decimal = require("simple-decimal-money");

var BalanceSheet = function(data) {

  var _this = this;
  
  // Data 
  
	var persons = [];
	var expenses = [];
	var participations = [];
	var idSequence = 1;

	this.name = "New sheet";
	this.persons = persons;
	this.expenses = expenses;
	this.participations = participations;

	if (data) {
	  importData(data);
	}
	
	// Methods
	
	this.isBalanced = isBalanced;
	
	this.getPerson = getPerson;
	this.createPerson = createPerson;
	this.removePerson = removePerson;
	
	this.getExpense = getExpense;
	this.createExpense = createExpense;
	this.removeExpense = removeExpense;
	
	this.getParticipation = getParticipation;
	this.createParticipation = createParticipation;
	this.removeParticipation= removeParticipation;

	this.exportData = exportData;
	
	this.isValid = isValid;
	this.throwErrorIfInvalid = throwErrorIfInvalid;
	
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
	
	function removePerson(toRemove) {
    toRemove = getPerson(toRemove.id);
    _.remove(persons, function(e) {
      return e.equals(toRemove);
    });
    _.forEach(toRemove.getParticipations(), function(pt) {
      removeParticipation(pt);
    });
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
		_.forEach(toRemove.getParticipations(), function(pt) {
			removeParticipation(pt);
		});
	}

	
	function getParticipation(criteria) {
	  var toSeek = new Participation(criteria); 
	  return _(participations).find(function(pt) {
	    return toSeek.equals(pt);
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
		_.remove(participations, function(pt) {
			return pt.equals(toRemove);
		});
	}
	

	function Person(data) {
	  var _this = this;
	  
	  // Data
	  
		this.id = data.id;
		this.name = data.name;
		
		// Methods
		
		this.equals = equals;
		this.getCost = getCost;
    this.getSumOfShares = getSumOfShares;
    this.getBalance = getBalance;
    this.isBalanced = isBalanced;
    this.getParticipations = getParticipations;
		
		///////////////////////////////////////
		
		var _myParticipations = _.chain(participations).filter(function(pt) {
      return _this.equals(pt.person);
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
    .map(function(pt) {
      return (new Decimal(pt.share)).subtract(pt.paid);
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
		
		function equals(other) {
      return (other instanceof Person) && (other.id === _this.id);
    }
		
	}

	
	
	function Expense(data) {
	  var _this = this;
	  
	  // Data
	  
	  this.id = data.id;
	  this.name = data.name;
	  this.sharing = data.sharing;
	  
	  // Methods
		
		this.getCost = getCost;
		this.getSumOfShares = getSumOfShares;
		this.getBalance = getBalance;
		this.isBalanced = isBalanced;
		this.getParticipations = getParticipations;
		this.shareCost = shareCost;
		this.equals = equals;
		
		///////////////////////////////////////
		
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
		.map(function(pt) {
		  return (new Decimal(pt.share)).subtract(pt.paid);
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
			if (_this.sharing === "equal") {
			  shareEqually();
			}
		}
		
		function shareEqually() {
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
		
		// Data
		
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
		
		// Methods
		
		this.equals = equals;
		
		
		///////////////////////////////////////
		
		function equals(other) {
			return (other instanceof Participation) && _this.person.equals(other.person) && _this.expense.equals(other.expense);
		}
	}

	
	function exportData() {
	  var data = {};
	  
	  data.idSequence = idSequence;
	  data.name = _this.name;
	  data.persons = _.map(persons, function(p) {
      return {id: p.id, name: p.name};
    });
	  data.expenses = _.map(expenses, function(e) {
	    return {id: e.id, name: e.name, sharing: e.sharing};
	  });
	  data.participations = _.map(participations, function(pt) {
	    return {personId: pt.person.id, expenseId: pt.expense.id, paid: pt.paid, share: pt.share};
	  });
	  return  data;
	}
	
	function importData(data) {
	  idSequence = data.idSequence;
	  _this.name = data.name;
	  
	  _.each(data.persons, function(p) {
	    createPerson(p);
	  });
	  
	  _.each(data.expenses, function(e) {
	    createExpense(e);
	  });
	  
	  _.each(data.participations, function(p) {
	    var person = getPerson(p.personId);
	    var expense = getExpense(p.expenseId);
	    createParticipation({person: person, expense: expense, paid: p.paid, share: p.share});
	  });
	
	  throwErrorIfInvalid();
	}
	
	function isValid() {
	  try {
	    throwErrorIfInvalid();
	    return true;
	  } catch (e) {
	    return false;
	  }
	}
	
	function throwErrorIfInvalid() {
	  
	  _.each(persons, function(p) {
	    if (!_.isNumber(p.id)) {
	      throw new Error("Person has no id"); 
	    }
	    if (!_.isString(p.name)) {
	      throw new Error("Person has no name");
	    }
	  });
	  
	  _.each(expenses, function(e) {
	    if (!_.isNumber(e.id)) {
        throw new Error("Expense has no id"); 
      }
      if (!_.isString(e.name)) {
        throw new Error("Expense has no name");
      }
      if (!(e.sharing === "equal" || e.sharing === "custom")) {
        throw new Error("Expense sharing is not 'equal' or 'custom'");
      }
	  });
	  
	  var idToEntity = {};
	  _.each(persons, function(p) {
	    idToEntity[p.id] = p;
	  });
	  _.each(expenses, function(e) {
      idToEntity[e.id] = e;
    });
	  _.each(participations, function(pt) {
	    if (!pt.person) {
	      throw new Error("Participation has no person");
	    }
	    if (!idToEntity[pt.person.id]) {
	      throw new Error("Participation person is unknown");
	    }
	    if (!pt.expense) {
        throw new Error("Participation has no expense");
      }
      if (!idToEntity[pt.expense.id]) {
        throw new Error("Participation expense is unknown");
      }
      if (!_.isNumber(pt.share)) {
        throw new Error("Participation share is not a number");
      }
      if (pt.share < 0) {
        throw new Error("Participation share is negative");
      }
      if (!_.isNumber(pt.paid)) {
        throw new Error("Participation paid is not a number");
      }
      if (pt.paid < 0) {
        throw new Error("Participation paid is negative");
      }
	  });
	  
	}
	
	function Error(message) {
	  this.message = message;
	}

};


module.exports = BalanceSheet;