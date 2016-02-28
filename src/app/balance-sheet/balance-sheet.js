"use strict";

var _ = require('lodash');
var angular = require("angular");
var Decimal = require("simple-decimal-money");

var BalanceSheet = function(data) {

  var _this = this;

  var EXCHANGE_RATE_DECIMALS = 4;

  // Data

  var persons = [];
  var expenses = [];
  var participations = [];
  var exchangeRates = [];
  var idSequence = 1;

  _this.name = "New sheet";
  _this.persons = persons;
  _this.expenses = expenses;
  _this.participations = participations;
  _this.homeCurrency = undefined; // Symbol

  if (data) {
    importData(data);
  }

  // Methods

  _this.getNonSettledParticipations = getNonSettledParticipations;

  _this.isBalanced = isBalanced;

  _this.getPerson = getPerson;
  _this.createPerson = createPerson;
  _this.removePerson = removePerson;

  _this.getExpense = getExpense;
  _this.createExpense = createExpense;
  _this.removeExpense = removeExpense;

  _this.getParticipation = getParticipation;
  _this.createParticipation = createParticipation;
  _this.removeParticipation = removeParticipation;

  _this.exportData = exportData;

  _this.isValid = isValid;
  _this.throwErrorIfInvalid = throwErrorIfInvalid;

  _this.setHomeCurrency = setHomeCurrency;
  _this.getExchangeRates = getExchangeRates;
  _this.addOrUpdateExchangeRate = addOrUpdateExchangeRate;
  _this.removeExchangeRate = removeExchangeRate;
  _this.convertCurrency = convertCurrency;

  /////////////////////////////////////


  function getNonSettledParticipations() {
    return _.filter(participations, function(pt) {
      return !pt.expense.settled;
    });
  }

  function isBalanced() {
    return _.reduce(expenses, function(isBalanced, e) {
      return isBalanced && (e.settled || e.isBalanced());
    }, true);
  }


  function getPerson(id) {
    return _(persons).find(function(p) {
      return p.id == id;
    });
  }


  function createPerson(data, options) {
    data = _.extend({
      name: "Person " + (persons.length + 1)
    }, data);

    options = _.extend({}, options);

    if (data.id === undefined) {
      data.id = idSequence;
      idSequence = idSequence + 1;
    }

    var person = new Person(data);
    persons.push(person);

    if (options.createParticipations === true) {
      _.each(expenses, function(e) {
        if (!e.settled) {
          createParticipation({person: person, expense: e});
          e.shareCost();
        }
      });
    }

    return person;
  }

  function removePerson(toRemove) {
    toRemove = getPerson(toRemove.id);

    if (!toRemove) return;

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

  function createExpense(data, options) {
    data = _.extend({
      name: "Expense " + (expenses.length + 1),
      sharing: "equal",
      settled: false
    }, data);

    options = _.extend({}, options);

    if (data.id === undefined) {
      data.id = idSequence;
      idSequence = idSequence + 1;
    }

    var expense = new Expense(data);
    expenses.push(expense);

    if (options.createParticipations === true) {
      _.each(persons, function(p) {
        createParticipation({person: p, expense: expense});
      });
    }

    return expense;
  }

  function removeExpense(toRemove) {
    toRemove = getExpense(toRemove.id);

    if (!toRemove) return;

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

    data = _.extend({
      paid: 0,
      share: 0
    }, data);

    var participation = new Participation(data);
    participations.push(participation);

    participation.expense.shareCost();

    return participation;
  }

  function removeParticipation(toRemove) {
    toRemove = getParticipation(toRemove);

    if (!toRemove) return;

    _.remove(participations, function(pt) {
      return pt.equals(toRemove);
    });

    toRemove.expense.shareCost();
  }


  function setHomeCurrency(currencySymbol) {
    if (currencySymbol && !_.isString(currencySymbol)) {
      throw "Home currency name must be a string";
    }
    _this.homeCurrency = currencySymbol;
  }

  /**
   * @return copy of exchange rates in this sheet
   */
  function getExchangeRates() {
    return _.cloneDeep(exchangeRates);
  }

  /**
   * Adds or updates an exchange rate.
   *
   * @param {Object} quotation - The exchange rate object
   * @param {string} quotation.fixed - The fixed currency symbol
   * @param {string} quotation.variable - The variable currency symbol
   * @param {number} quotation.rate - The rate: 1 unit of the fixed currency buys this amount of the variable currency. Must be a positive number with at most 4 decimals.
   */
  function addOrUpdateExchangeRate(quotation) {
    validateQuotation(quotation);
    removeExchangeRate(quotation);
    exchangeRates.push(quotation);
  }

  function validateQuotation(quotation) {
    if (!_.isString(quotation.fixed)) {
      throw "Fixed currency symbol must be a string";
    }
    if (!_.isString(quotation.variable)) {
      throw "Variable currency symbol must be a string";
    }
    if (!_.isNumber(quotation.rate) || quotation.rate <= 0) {
      throw "Foreign currency rate must be a positive number";
    }
  }

  /**
   * Removes an exchange rate.
   *
   * @param currencyPair - The currency pair to remove
   * @param {string} currencyPair.fixed - The fixed currency symbol
   * @param {string} currencyPair.variable - The variable currency symbol
   */
  function removeExchangeRate(currencyPair) {
    _.remove(exchangeRates, {fixed: currencyPair.fixed, variable: currencyPair.variable});
  }

  /**
   * Converts a value from one currency to another. Uses the inverse of an exchange
   * rate if an inverse currency pair is found.
   *
   * @param {Object} toConvert - The data object
   * @param {number} toConvert.value - The value to convert
   * @param {string} toConvert.from - The currency of the value
   * @param {string} toConvert.to - The currency to convert the value to
   * @return {number} - The value in the "to" currency
   */
  function convertCurrency(toConvert) {
    var rate;

    if (toConvert.from == toConvert.to) {
      return new Decimal(toConvert.value).toNumber();
    }

    var quotation = _.find(exchangeRates, {fixed: toConvert.from, variable: toConvert.to});

    if (quotation) {
      rate = new Decimal(quotation.rate, EXCHANGE_RATE_DECIMALS);
    } else {
      var searchPair = {variable: toConvert.from, fixed: toConvert.to};
      var inverseQuotation = _.find(exchangeRates, searchPair);
      if (inverseQuotation) {
        rate = new Decimal(1/inverseQuotation.rate, EXCHANGE_RATE_DECIMALS);
      }
    }

    if (!rate) {
      throw "Could not find an exchange rate for the requested conversion.";
    }

    return new Decimal(toConvert.value*100).multiply(rate).divideBy(100).toNumber();
  }

  /**
   * A person.
   *
   * @param data
   *  id: The person's id.
   *  name: The person's name
   * @constructor
   */
  function Person(data) {
    var _this = this;

    _.extend(_this, data);

    // Methods

    _this.equals = equals;
    _this.getCost = getCost;
    _this.getSumOfShares = getSumOfShares;
    _this.getBalance = getBalance;
    _this.isBalanced = isBalanced;
    _this.getParticipations = getParticipations;

    ///////////////////////////////////////

    var _myParticipations = _.chain(participations)
      .filter(function(pt) {
        return _this.equals(pt.person);
      });

    var _nonSettledParticipations = _myParticipations
      .filter(function(pt) {
        return !pt.expense.settled;
      });

    var _cost = _nonSettledParticipations
      .filter(function(pt) {
        return !pt.expense.settled;
      })
      .map("paid").reduce(function(cost, paid) {
        return cost.add(paid);
      }, new Decimal(0));

    var _sumOfShares = _nonSettledParticipations
      .map("share").reduce(function(sum, share) {
        return sum.add(share);
      }, new Decimal(0));

    var _balance = _nonSettledParticipations
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


  /**
   * An expense.
   *
   * @param data
   *  id: The expense's id.
   *  name: The expense's name
   *  sharing: The expense's cost sharing mode. Value "equal" = share costs equally. All other values mean custom sharing.
   * @constructor
   */
  function Expense(data) {
    var _this = this;

    // Data

    _.extend(_this, data);

    // Methods

    _this.getCost = getCost;
    _this.getSumOfShares = getSumOfShares;
    _this.getBalance = getBalance;
    _this.isBalanced = isBalanced;
    _this.getParticipations = getParticipations;
    _this.shareCost = shareCost;
    _this.equals = equals;

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

    /**
     *
     * @param {string} [currency] - Currency in which to get the value. Default is this expense's currency.
     * @return {number} The cost of this expense.
     */
    function getCost(currency) {
      return convertCurrency({
        value: _cost.value(),
        from: _this.currency,
        to: currency || _this.currency
      });
    }

    /**
     *
     * @param {string} [currency] - Currency in which to get the value. Default is this expense's currency.
     * @return {number} The sum of shares of this expense.
     */
    function getSumOfShares(currency) {
      return convertCurrency({
        value: _sumOfShares.value(),
        from: _this.currency,
        to: currency || _this.currency
      });
    }

    function isBalanced() {
      return _balance.value().toNumber() === 0;
    }

    /**
     *
     * @param {string} [currency] - Currency in which to get the value. Default is this expense's currency.
     * @return {number} The balance of this expense.
     */
    function getBalance() {
      return convertCurrency({
        value: _balance.value(),
        from: _this.currency,
        to: currency || _this.currency
      });
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

  /**
   * A participation of a person to an expense.
   *
   * Data:
   *  person: the Person object
   *  expense: the Expense object
   *  paid: how much the person has paid for the expense (float with max two decimals)
   *  share: the person's share of the expense cost
   */
  function Participation(data) {
    var _this = this;

    if (!data || !data.person || !data.expense) {
      throw "Undefined participation";
    }

    // Data

    _.extend(this, data);

    // Methods

    this.getPaid = getPaid;
    this.getShare = getShare;
    this.equals = equals;


    ///////////////////////////////////////

    /**
     *
     * @param {string} [currency] - Currency in which to get the payment. Default is expense's currency.
     * @return {number} How much the person paid for the expense.
     */
    function getPaid(currency) {
      return convertCurrency({
        value: _this.paid,
        from: _this.expense.currency,
        to: currency || _this.expense.currency
      });
    }

    /**
     *
     * @param {string} [currency] - Currency in which to get the share. Default is expense's currency.
     * @return {number} How much the person shares for the expense.
     */
    function getShare(currency) {
      return convertCurrency({
        value: _this.share,
        from: _this.expense.currency,
        to: currency || _this.expense.currency
      });
    }

    function equals(other) {
      return (other instanceof Participation) && _this.expense.equals(other.expense) && _this.person.equals(other.person);
    }
  }


  function exportData() {
    var isNotFunction = _.negate(_.isFunction);
    var data = _.pick(_this, isNotFunction);
    data.persons = _.map(persons, function(p) {
      return _.pick(p, isNotFunction);
    });
    data.expenses = _.map(expenses, function(e) {
      return _.pick(e, isNotFunction);
    });
    data.participations = _.map(participations, function(pt) {
      return {personId: pt.person.id, expenseId: pt.expense.id, paid: pt.paid, share: pt.share};
    });
    return data;
  }

  function importData(data) {
    idSequence = _([])
        .concat(data.persons)
        .concat(data.expenses)
        .pluck("id")
        .max() + 1;
    if (idSequence == -Infinity) {
      idSequence = 1;
    }

    var separately = {persons: true, expenses: true, participations: true};
    _.extend(_this, _.pick(data, function(value, key) {
      return !separately[key];
    }));

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
    });

    _.each(expenses, function(e) {
      if (!_.isNumber(e.id)) {
        throw new Error("Expense has no id");
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
    });

  }

  function Error(message) {
    this.message = message;
  }

};


module.exports = BalanceSheet;