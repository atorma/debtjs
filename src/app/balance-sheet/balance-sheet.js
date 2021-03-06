"use strict";

var _ = require('lodash');
var Decimal = require("simple-decimal-money");
var CurrencyConversionError = require("./currency-conversion-error");

var BalanceSheet = function(data) {

  var _this = this;
  var _sheet = this;

  var EXCHANGE_RATE_DECIMALS = 4;

  // Data

  var persons = [];
  var expenses = [];
  var participations = [];

  var exchangeRates = [];

  var idSequence = 1;

  _this.name = "New sheet";
  _this.currency = undefined;
  _this.persons = persons;
  _this.expenses = expenses;
  _this.participations = participations;

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

  _this.currenciesEnabled = currenciesEnabled;
  _this.getExchangeRates = getExchangeRates;
  _this.getCurrencies = getCurrencies;
  _this.getExpenseCurrencies = getExpenseCurrencies;
  _this.getExchangeRateCurrencies = getExchangeRateCurrencies;
  _this.addOrUpdateExchangeRate = addOrUpdateExchangeRate;
  _this.removeExchangeRate = removeExchangeRate;
  _this.convertCurrency = convertCurrency;
  _this.getConvertibleCurrencies = getConvertibleCurrencies;
  _this.getNonConvertibleCurrencies = getNonConvertibleCurrencies;
  _this.throwErrorIfInvalidExpenseCurrencies = throwErrorIfInvalidExpenseCurrencies;

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

  /**
   * Creates a person.
   *
   * @param {Object} [data] - Person data
   * @param {String} [data.name=Person <number>] - Person's name
   * @param {Object} [options] - Options for creating a person
   * @param {boolean} [options.createParticipations=true] - Whether the person is set to participate in all existing expenses
   * @returns {Person} - The created Person object
   */
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

  /**
   * Creates an expense.
   *
   * @param {Object} [data] - Expense data
   * @param {String} [data.name=Expense <number>] - Expense's name
   * @param {String} [data.currency] - The currency the expense was paid in
   * @param {Object} [options] - Options for creating an expense
   * @param {boolean} [options.createParticipations=true] - Whether all existing persons are set to participate in the expense
   * @returns {Expense} - The created Expense object
   */
  function createExpense(data, options) {
    data = _.extend({
      name: "Expense " + (expenses.length + 1),
      sharing: "equal",
      settled: false,
      currency: undefined
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

  /**
   * Creates a participation of a Person to an Expense.
   *
   * @param {Object} data - Participation data
   * @param {Person} data.person - The participant person
   * @param {Expense} data.expense - The expense to participate in
   * @param {number} [data.paid=0] - How much the person has paid for the expense (in the expense currency)
   * @param {number} [data.share=0] - The person's share of the expense's total cost (in the expense currency)
   * @returns {Participation} - The created Participation object
   */
  function createParticipation(data) {
    if (getParticipation(data)) {
      throw new Error("Duplicate participation");
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


  /**
   * @returns {boolean} Whether currencies are enabled in this balance sheet
   */
  function currenciesEnabled() {
    return exchangeRates && exchangeRates.length > 0;
  }
  /**
   * @return {string[]} copy of exchange rates in this sheet
   */
  function getExchangeRates() {
    return _.cloneDeep(exchangeRates);
  }

  /**
   * @return list of currencies in alphabetical order
   */
  function getCurrencies() {
    return _.chain(getExchangeRateCurrencies())
      .concat(getExpenseCurrencies(), _this.currency)
      .uniq()
      .sort()
      .value();
  }

  function getExchangeRateCurrencies() {
    return _.reduce(exchangeRates, function(result, er) {
      result.push(er.fixed);
      result.push(er.variable);
      return result;
    }, []);
  }

  function getExpenseCurrencies() {
    return _.map(expenses, function(e) {
      return e.computedCurrency();
    });
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
    var existing = _.find(exchangeRates, _.pick(quotation, 'fixed', 'variable'));
    if (existing) {
      _.extend(existing, quotation);
    } else {
      exchangeRates.push(quotation);
    }
    updateBalanceSheetCurrencyIfNeeded();
  }

  function validateQuotation(quotation) {
    if (!_.isString(quotation.fixed) || _.trim(quotation.fixed) === "") {
      throw new TypeError("Fixed currency symbol must be a non-empty string");
    }
    if (!_.isString(quotation.variable) || _.trim(quotation.variable) === "") {
      throw new TypeError("Variable currency symbol must be a non-empty string");
    }
    if (!_.isNumber(quotation.rate) || quotation.rate < 0.0001) {
      throw new RangeError("Foreign currency rate must be >= 0.0001");
    }
  }

  function cleanUpCurrency(currency) {
    if (!currency) {
      return undefined;
    } else if (_.isString(currency) && _.trim(currency).length === 0) {
      return undefined;
    } else {
      return _.trim(currency);
    }
  }

  function cleanUpCurrencyPair(currencyPair) {
    currencyPair = _.clone(currencyPair);
    currencyPair.fixed = cleanUpCurrency(currencyPair.fixed);
    currencyPair.variable = cleanUpCurrency(currencyPair.variable);
    return currencyPair;
  }

  /**
   * Removes an exchange rate.
   *
   * @param currencyPair - The currency pair to remove
   * @param {string} currencyPair.fixed - The fixed currency symbol
   * @param {string} currencyPair.variable - The variable currency symbol
   */
  function removeExchangeRate(currencyPair) {
    if (!currencyPair) return;
    currencyPair = cleanUpCurrencyPair(currencyPair);
    _.remove(exchangeRates, _.pick(currencyPair, 'fixed', 'variable'));
    updateBalanceSheetCurrencyIfNeeded();
    updateExpenseCurrenciesIfNeeded();
  }

  /**
   * Converts a value from one currency to another. Uses the inverse of an exchange
   * rate if an inverse currency pair is found.
   *
   * @param {Object} toConvert - The data object
   * @param {number} toConvert.value - The value to convert
   * @param {string} toConvert.fixed - The currency of the value to be converted
   * @param {string} toConvert.variable - The currency to convert the value to
   * @return {number} - The value in the variable currency
   */
  function convertCurrency(toConvert) {
    var rate;

    if (!toConvert) {
      throw new CurrencyConversionError("Undefined or null conversion data");
    }

    toConvert = cleanUpCurrencyPair(toConvert);

    if (toConvert.fixed == toConvert.variable) {
      return new Decimal(toConvert.value).toNumber();
    }

    var quotation = _.find(exchangeRates, {fixed: toConvert.fixed, variable: toConvert.variable});

    if (quotation) {
      rate = new Decimal(quotation.rate, EXCHANGE_RATE_DECIMALS);
    } else {
      var searchPair = {variable: toConvert.fixed, fixed: toConvert.variable};
      var inverseQuotation = _.find(exchangeRates, searchPair);
      if (inverseQuotation) {
        rate = new Decimal(1/inverseQuotation.rate, EXCHANGE_RATE_DECIMALS);
      }
    }

    if (!rate) {
      throw new CurrencyConversionError("Could not find an exchange rate for conversion '" + toConvert.fixed + "' -> '" + toConvert.variable + "'.");
    }

    return new Decimal(toConvert.value*100).multiply(rate).divideBy(100).toNumber();
  }

  function tryToConvertCurrency(toConvert) {
    try {
      return convertCurrency(toConvert);
    } catch (e) {
      if (e instanceof CurrencyConversionError) {
        return NaN;
      } else {
        throw e;
      }
    }
  }

  /**
   * Returns currencies that can be converted to the given currency.
   *
   * @param {string[]} fromCurrencies - Currencies to convert
   * @param {string} toCurrency - Currency to convert to
   * @returns {string[]} - Convertible currencies in fromCurrencies
   */
  function getConvertibleCurrencies(fromCurrencies, toCurrency) {
    if (!_.isArray(fromCurrencies)) {
      return [];
    }

    var convertible = [];
    _.each(getCurrencies(), function(c) {
      try {
        convertCurrency({fixed: c, variable: toCurrency, value: 1});
        convertible.push(c);
      } catch (e) {}
    });
    return convertible;
  }

  /**
   * Finds currencies that can not be converted to the given currency.
   *
   * @param {string[]} fromCurrencies - Currencies to convert
   * @param {string} toCurrency - Currency to convert to
   * @returns {string[]} - Non-convertible currencies
   */
  function getNonConvertibleCurrencies(fromCurrencies, toCurrency) {
    return _.difference(fromCurrencies, getConvertibleCurrencies(fromCurrencies, toCurrency));
  }


  function updateBalanceSheetCurrencyIfNeeded() {
    var currencies = getExchangeRateCurrencies();

    if (exchangeRates.length === 0) {
      _this.currency = undefined;
    } else if (_this.currency === undefined || _.indexOf(currencies, _this.currency) === -1) {
      _this.currency = exchangeRates[0].fixed;
    }
  }


  function updateExpenseCurrenciesIfNeeded() {
    var currencies = _.concat(getExchangeRateCurrencies(), _this.currency);
    _.each(expenses, function(e) {
      if (_.indexOf(currencies, e.currency) === -1) {
        e.currency = _this.currency;
      }
    });
  }

  function throwErrorIfInvalidExpenseCurrencies() {
    _.each(expenses, function(expense) {
      try {
        convertCurrency({fixed: expense.computedCurrency(), variable: _this.currency, value: 1});
      } catch (ex) {
        throw new CurrencyConversionError("Cannot convert currency '" + expense.computedCurrency()  + "' of '" + expense.name + "' to balance sheet's currency '" + _this.currency + "'");
      }
    });
  }


  /**
   * Creates a Person object.
   *
   * @param {Object} [data] - Initial data
   * @param {number} [data.id] - Id
   * @param {string} [data.name} - Name
   * @constructor
   */
  function Person(data) {
    var _this = this;

    _.extend(_this, data);

    // Methods

    _this.computedCurrency = computedCurrency;
    _this.equals = equals;
    _this.getCost = getCost;
    _this.getSumOfShares = getSumOfShares;
    _this.getBalance = getBalance;
    _this.isBalanced = isBalanced;
    _this.getParticipations = getParticipations;
    _this.exportData = exportData;

    ///////////////////////////////////////

    var _myParticipations = _.chain(participations)
      .filter(function(pt) {
        return _this.equals(pt.person);
      });

    var _nonSettledParticipations = _myParticipations
      .filter(function(pt) {
        return !pt.expense.settled;
      });


    function getTotal(participationMapping) {
      return _nonSettledParticipations
        .map(participationMapping)
        .reduce(function(total, value) {
          return total.add(value);
        }, new Decimal(0))
        .value()
        .toNumber();
    }

    function computedCurrency() {
      return _sheet.currency;
    }

    /**
     *
     * @param {string} [currency] - The currency in which to get the total (default: balance sheet's default currency)
     * @returns {number} - The total amount this person has paid. NaN if cannot convert currency.
     */
    function getCost(currency) {
      currency = currency || _this.computedCurrency();
      return getTotal(function(pt) {
        return pt.getPaid(currency);
      });
    }

    /**
     *
     * @param {string} [currency] - The currency in which to get the total (default: balance sheet's default currency)
     * @returns {number} - This person's total share of all the expenses. NaN if cannot convert currency.
     */
    function getSumOfShares(currency) {
      currency = currency || _this.computedCurrency();
      return getTotal(function(pt) {
        return pt.getShare(currency);
      });
    }

    /**
     * Checks whether this person's costs and shares sum up to zero, i.e. the person neither
     * owes money nor is owed money by anyone else.
     *
     * @returns {boolean} - Whether this person's costs and shares sum up to zero
     */
    function isBalanced() {
      return getBalance() === 0;
    }

    /**
     * Computes the difference between the total share and cost paid by this person.
     * If the difference is negative, then the person's share is smaller than the costs
     * she has paid, that is others owe her money.
     *
     * @param {string} [currency] - The currency in which to get the balance (default: balance sheet's default currency)
     * @returns {number} - The difference between the total share and cost paid by this person. NaN if cannot convert currency.
     */
    function getBalance(currency) {
      currency = currency || _this.computedCurrency();
      return new Decimal( getSumOfShares(currency) ).subtract( getCost(currency) ).toNumber();
    }

    /**
     * @returns {Participation[]} - The expense participations of this person
     */
    function getParticipations() {
      return _myParticipations.value();
    }

    /**
     * @param {Object} other - Another object
     * @returns {boolean} - True if this person is equal to the other object
     */
    function equals(other) {
      return (other instanceof Person) && (other.id === _this.id);
    }

    function exportData() {
      var isNotFunction = _.negate(_.isFunction);
      return _.extend(_.pickBy(_this, isNotFunction), {});
    }

  }


  /**
   * An expense.
   *
   * @param {object} [data] - Initial data
   * @param {number} [data.id] - The expense's id
   * @param {string} [data.name] - The expense's name
   * @param {string} [data.sharing] -  The expense's cost sharing mode. Value "equal" = share costs equally. All other values mean custom sharing.
   * @param {string} [data.currency] - The expense's currency
   * @constructor
   */
  function Expense(data) {
    var _this = this;

    // Data
    _.extend(_this, data);

    // Methods
    _this.computedCurrency = computedCurrency;
    _this.getCost = getCost;
    _this.getSumOfShares = getSumOfShares;
    _this.getBalance = getBalance;
    _this.isBalanced = isBalanced;
    _this.getParticipations = getParticipations;
    _this.shareCost = shareCost;
    _this.equals = equals;
    _this.exportData = exportData;

    ///////////////////////////////////////

    var _myParticipations = _.chain(participations).filter(function(p) {
      return _this.equals(p.expense);
    });


    function getTotal(participationMapping, currency) {
      var total = _myParticipations
        .map(participationMapping)
        .reduce(function(total, value) {
          return total.add(value);
        }, new Decimal(0))
        .value()
        .toNumber();

      if (!currency || currency === _this.computedCurrency()) {
        return total;
      } else {
        return tryToConvertCurrency({
          value: total,
          fixed: _this.computedCurrency(),
          variable: currency
        });
      }
    }


    /**
     * Gets the currency of this expense used for currency computations.
     *
     * @returns {string} - The currency of this expense
     */
    function computedCurrency() {
      return _this.currency || _sheet.currency;
    }

    /**
     *
     * @param {string} [currency] - Currency in which to get the value. Default is this expense's currency or if undefined, the balance sheet's default currency.
     * @return {number} The cost of this expense. NaN if cannot convert currency.
     */
    function getCost(currency) {
      return getTotal(function(pt) {
        return pt.paid;
      }, currency);
    }

    /**
     *
     * @param {string} [currency] - Currency in which to get the value. Default is this expense's currency or if undefined, the balance sheet's default currency.
     * @return {number} The sum of shares of this expense. NaN if cannot convert currency.
     */
    function getSumOfShares(currency) {
      return getTotal(function(pt) {
        return pt.share;
      }, currency);
    }

    function isBalanced() {
      return getBalance(_this.computedCurrency()) === 0;
    }

    /**
     *
     * @param {string} [currency] - Currency in which to get the value. Default is this expense's currency or if undefined, the balance sheet's default currency.
     * @return {number} The balance of this expense. NaN if cannot convert currency.
     */
    function getBalance(currency) {
      return new Decimal( getSumOfShares(currency) ).subtract( getCost(currency) ).toNumber();
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

    function exportData() {
      var isNotFunction = _.negate(_.isFunction);
      return _.extend(_.pickBy(_this, isNotFunction));
    }

  }

  /**
   * Creates a participation of a Person to an Expense.
   *
   * @param {Object} data - Participation data
   * @param {Person} data.person - The participant person
   * @param {Expense} data.expense - The expense to participate in
   * @param {number} [data.paid=0] - How much the person has paid for the expense (in the expense currency)
   * @param {number} [data.share=0] - The person's share of the expense's total cost (in the expense currency)
   * @constructor
   */
  function Participation(data) {
    var _this = this;

    if (!data || !data.person || !data.expense) {
      throw new ReferenceError("Undefined participation");
    }

    // Data

    _.extend(_this, data);

    // Methods

    _this.getPaid = getPaid;
    _this.getShare = getShare;
    _this.equals = equals;
    _this.exportData = exportData;

    ///////////////////////////////////////

    function getCurrencyConversionFunction(options) {
      if (options.strictConversion) {
        return convertCurrency;
      } else {
        return tryToConvertCurrency;
      }
    }

    /**
     * Returns the value of property propName with currency conversion (if applicable) adjusted such
     * that the expense is balanced in the target currency.
     *
     * @param {string} propName - The name of the monetary value property
     * @param {string} currency - The target currency
     * @param {object} options - Currrency conversion options
     * @returns {number} - The property value with currency conversion
     */
    function getValue(propName, currency, options) {
      if (!currency || currency === _this.expense.computedCurrency()) {
        return _this[propName];
      }

      options = _.extend({strictConversion: false}, options);
      var convert = getCurrencyConversionFunction(options);
      var expenseParticipations = _this.expense.getParticipations();

      if (_.last(expenseParticipations) === _this) {

        var thisValueConverted = convert({
          value: _this[propName],
          fixed: _this.expense.computedCurrency(),
          variable: currency
        });

        var originalSum = _.reduce(expenseParticipations, function(sum, prt) {
          return sum.add(prt[propName]);
        }, new Decimal(0)).toNumber();

        var convertedSum = convert({
          value: originalSum,
          fixed: _this.expense.computedCurrency(),
          variable: currency
        });

        var sumOfConverted = _.reduce(expenseParticipations, function(sum, prt) {
          var value = convert({
            value: prt[propName],
            fixed: prt.expense.computedCurrency(),
            variable: currency
          });
          return sum.add(value);
        }, new Decimal(0));

        var delta = sumOfConverted.subtract(convertedSum);

        return new Decimal(thisValueConverted).subtract(delta).toNumber();

      } else {

        return convert({
          value: _this[propName],
          fixed: _this.expense.computedCurrency(),
          variable: currency
        });

      }
    }

    /**
     *
     * @param {string} [currency] - Currency in which to get the payment. Default is expense's currency.
     * @param {object} [options] - Options
     * @param {boolean} [options.strictConversion] - True to throw error if currency conversion fails, false to return NaN. Default is false.
     * @return {number} How much the person paid for the expense.
     */
    function getPaid(currency, options) {
      return getValue("paid", currency, options);
    }

    /**
     *
     * @param {string} [currency] - Currency in which to get the share. Default is expense's currency.
     * @param {object} [options] - Options
     * @param {boolean} [options.strictConversion] - True to throw error if currency conversion fails, false to return NaN. Default is false.
     * @return {number} How much the person shares for the expense.
     */
    function getShare(currency, options) {
      return getValue("share", currency, options);
    }

    function equals(other) {
      return (other instanceof Participation) && _this.expense.equals(other.expense) && _this.person.equals(other.person);
    }

    function exportData() {
      return {personId: _this.person.id, expenseId: _this.expense.id, paid: _this.paid, share: _this.share};
    }

  }


  function exportData() {
    var isNotFunction = _.negate(_.isFunction);
    var data = _.pickBy(_this, isNotFunction);
    data.persons = _.map(persons, function(p) {
      return p.exportData();
    });
    data.expenses = _.map(expenses, function(e) {
      return e.exportData();
    });
    data.participations = _.map(participations, function(pt) {
      return pt.exportData();
    });
    data.exchangeRates = getExchangeRates();
    return data;
  }

  function importData(data) {
    idSequence = _([])
        .concat(data.persons)
        .concat(data.expenses)
        .map("id")
        .max() + 1;
    if (_.isNaN(idSequence)) {
      idSequence = 1;
    }

    var separately = {persons: true, expenses: true, participations: true, exchangeRates: true};

    _.each(data.exchangeRates, function(q) {
      addOrUpdateExchangeRate(q);
    });

    _.extend(_this, _.pickBy(data, function(value, key) {
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

};


module.exports = BalanceSheet;