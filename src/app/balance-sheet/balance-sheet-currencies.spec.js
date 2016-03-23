"use strict";

var BalanceSheet = require('./balance-sheet');
var CurrencyConversionError = require("./currency-conversion-error");

describe("Currencies", function () {

  var sheet = null;
  var person1, person2;
  var expense1, expense2;

  beforeEach(function() {
    sheet = new BalanceSheet();
    person1 = sheet.createPerson();
    person2 = sheet.createPerson();

    expense1 = sheet.createExpense();
    expense2 = sheet.createExpense();
  });

  describe("Balance sheet", function() {

    it("getExchangeRates() returns copy of exchange rates", function() {
      var exchangeRates = [
        {fixed: "GBP", variable: "EUR", rate: 1.2100},
        {fixed: "EUR", variable: "USD", rate: 1.1030}
      ];
      sheet.addOrUpdateExchangeRate(exchangeRates[0]);
      sheet.addOrUpdateExchangeRate(exchangeRates[1]);

      expect(sheet.getExchangeRates()).toEqual(exchangeRates);
    });

    describe("addOrUpdateExchangeRate()", function() {

      it("adds or updates an exchange rate", function() {
        sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "GBP", rate: 0.7898});
        expect(sheet.getExchangeRates()).toEqual([{fixed: "EUR", variable: "GBP", rate: 0.7898}]);

        sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "GBP", rate: 0.8});
        expect(sheet.getExchangeRates().length).toBe(1);
        expect(sheet.getExchangeRates()).toEqual([{fixed: "EUR", variable: "GBP", rate: 0.8}]);
      });

      it("throws an error if the input quotation is invalid", function() {
        expect(function() {
          sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "GBP", rate: -1});
        }).toThrow();
        expect(function() {
          sheet.addOrUpdateExchangeRate({fixed: undefined, variable: "GBP", rate: 0.7898});
        }).toThrow();
        expect(function() {
          sheet.addOrUpdateExchangeRate({fixed: {name: "aargh"}, variable: "GBP", rate: 0.7898});
        }).toThrow();
        expect(function() {
          sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: -1, rate: 0.7898});
        }).toThrow();
      });
    });

    describe("removeExchangeRate()", function() {

      it("removes input exchange rate", function() {
        sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "GBP", rate: 0.7898});
        sheet.removeExchangeRate({fixed: "EUR", variable: "GBP"});

        expect(sheet.getExchangeRates()).toEqual([]);
      });

    });

    describe("getCurrencies()", function() {

      it("returns currencies of exchange rates, balance sheet, and expenses in alphabetical order", function() {
        sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "GBP", rate: 0.7898});
        sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "USD", rate: 1.1030});
        sheet.currency("JPY");
        expense1.currency("FOO");
        expense2.currency("USD");

        expect(sheet.getCurrencies()).toEqual(["EUR", "FOO", "GBP", "JPY", "USD"]);
      });

    });

    describe("convertCurrency()", function() {

      it("converts a value from one currency to another in two decimal accuracy", function() {
        sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "GBP", rate: 0.7898});
        sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "USD", rate: 1.1030});

        expect(sheet.convertCurrency({value: 2.5, fixed: "EUR", variable: "GBP"})).toBe(1.97);
        expect(sheet.convertCurrency({value: 2.5, fixed: "EUR", variable: "USD"})).toBe(2.76);
      });

      it("converts a value from one currency to another using an inverse rate unless an exact rate is available", function() {
        sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "GBP", rate: 0.7898});
        sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "USD", rate: 1.1030});
        sheet.addOrUpdateExchangeRate({fixed: "USD", variable: "EUR", rate: 0.1}); // Totally weird, but this is the exact rate

        expect(sheet.convertCurrency({value: 2.5, fixed: "EUR", variable: "GBP"})).toBe(1.97); // Computed using exact rate
        expect(sheet.convertCurrency({value: 2.5, fixed: "GBP", variable: "EUR"})).toBe(3.17); // Computed using inverse rate

        expect(sheet.convertCurrency({value: 2.5, fixed: "EUR", variable: "USD"})).toBe(2.76); // Computed using exact rate
        expect(sheet.convertCurrency({value: 2.5, fixed: "USD", variable: "EUR"})).toBe(0.25); // Computed using exact rate
      });

      it("throws error if it cannot find an exchange rate when converting currency", function() {
        expect(function() {
          sheet.convertCurrency({value: 2.5, fixed: "EUR", variable: "GBP"});
        }).toThrowError(CurrencyConversionError);
      });
      
    });

    describe("currency()", function() {

      it("initially undefined", function() {
        expect(sheet.currency()).toBeUndefined();
      });

      it("sets currency to given currency (trimmed)", function() {
        sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "GBP", rate: 0.7898});

        sheet.currency("EUR");
        expect(sheet.currency()).toBe("EUR");

        sheet.currency(" FOO ");
        expect(sheet.currency()).toBe("FOO");

        sheet.currency(undefined);
        expect(sheet.currency()).toBe(undefined);

        sheet.currency(" ");
        expect(sheet.currency()).toBe(undefined);

        sheet.currency(null);
        expect(sheet.currency()).toBe(undefined);
      });

      it("set as first fixed currency if default is undefined", function() {
        sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "GBP", rate: 0.7898});
        expect(sheet.currency()).toEqual("EUR");
        sheet.addOrUpdateExchangeRate({fixed: "USD", variable: "GBP", rate: 0.7131});
        expect(sheet.currency()).toEqual("EUR");
      });

      it("set as first fixed currency if default currency removed", function() {
        sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "GBP", rate: 0.7898});
        sheet.addOrUpdateExchangeRate({fixed: "USD", variable: "GBP", rate: 0.7131});
        sheet.removeExchangeRate({fixed: "EUR", variable: "GBP"});
        expect(sheet.currency()).toEqual("USD");
      });

      it("set as undefined if all currencies removed", function() {
        sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "GBP", rate: 0.7898});
        sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "DKK", rate: 7.2501});
        sheet.currency("EUR");

        sheet.removeExchangeRate({fixed: "EUR", variable: "GBP"});
        expect(sheet.currency()).toBe("EUR"); // There still exists an exchange rate for that currency.

        sheet.removeExchangeRate({fixed: "EUR", variable: "DKK"});
        expect(sheet.currency()).toBeUndefined();
      });

    });

    describe("getConvertibleCurrencies()", function() {

      it("returns array of currencies that can be converted to input currency", function() {
        sheet.addOrUpdateExchangeRate({fixed: "GBP", variable: "EUR", rate: 1.2100});
        sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "USD", rate: 1.1030});

        var currencies = ["EUR", "GBP", "USD"];
        expect(sheet.getConvertibleCurrencies(currencies, "EUR")).toEqual(currencies);
        expect(sheet.getConvertibleCurrencies(currencies, "USD")).toEqual(["EUR", "USD"]);
        expect(sheet.getConvertibleCurrencies(currencies, "FOO")).toEqual([]);
      });

    });

    describe("getNonConvertibleCurrencies()", function() {

      it("returns array of currencies that cannot be converted to input currency", function() {
        sheet.addOrUpdateExchangeRate({fixed: "GBP", variable: "EUR", rate: 1.2100});
        sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "USD", rate: 1.1030});

        var currencies = ["EUR", "GBP", "USD"];
        expect(sheet.getNonConvertibleCurrencies(currencies, "EUR")).toEqual([]);
        expect(sheet.getNonConvertibleCurrencies(currencies, "USD")).toEqual(["GBP"]);
        expect(sheet.getNonConvertibleCurrencies(currencies, "FOO")).toEqual(currencies);
      });

    });

    describe("throwErrorIfInvalidExpenseCurrencies()", function() {

      it("throws error if an expense's currency cannot be converted to the sheet's currency", function() {
        sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "DKK", rate: 7.0});
        sheet.addOrUpdateExchangeRate({fixed: "FOO", variable: "BAR", rate: 1});
        sheet.currency("EUR");

        expense1.currency("FOO");

        expect(sheet.throwErrorIfInvalidExpenseCurrencies).toThrowError("Cannot convert currency 'FOO' of 'Expense 1' to balance sheet's currency 'EUR'");
      });

    });


  });

  describe("Expense", function() {

    it("has currency equal to balance sheet currency by default", function() {
      sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "USD", rate: 1.1030});

      sheet.currency("EUR");
      expect(expense1.currency()).toEqual("EUR");

      sheet.currency("USD");
      expect(expense1.currency()).toEqual("USD");
    });

    it("has currency that can be defined", function() {
      sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "USD", rate: 1.1030});
      sheet.currency("EUR");

      expense1.currency("EUR");
      expect(expense1.currency()).toEqual("EUR");
      expense1.currency("USD");
      expect(expense1.currency()).toEqual("USD");
      expense1.currency(" FOO ");
      expect(expense1.currency()).toEqual("FOO");
    });


    it("currency is reset when no exchange rate", function() {
      sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "USD", rate: 1.1});
      sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "DKK", rate: 7.2});
      sheet.currency("EUR");

      expense1.currency("USD");
      expect(expense1.currency()).toEqual("USD");

      sheet.removeExchangeRate({fixed: "EUR", variable: "USD"});

      expect(expense1.currency()).toEqual("EUR");

      sheet.removeExchangeRate({fixed: "EUR", variable: "DKK"});

      expect(expense1.currency()).toEqual(undefined);

    });

  });

  describe("Person", function() {

    it("has currency equal to balance sheet currency", function() {
      sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "USD", rate: 1.1030});

      sheet.currency("EUR");
      expect(person1.currency()).toEqual("EUR");

      sheet.currency("USD");
      expect(person1.currency()).toEqual("USD");
    });

  });

  describe("shares and costs", function() {

    var prt11, prt21, prt12, prt22;

    beforeEach(function() {
      sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "GBP", rate: 0.7898});

      prt11 = sheet.createParticipation({person: person1, expense: expense1, paid: 20, share: 12.5});
      prt21 = sheet.createParticipation({person: person2, expense: expense1, paid: 5, share: 12.5});

      prt12 = sheet.createParticipation({person: person1, expense: expense2, paid: 3.5, share: 8.5});
      prt22 = sheet.createParticipation({person: person2, expense: expense2, paid: 13.5, share: 8.5});
    });

    // We sum up converted payments and shares instead of converting sums of payments and shares
    // in order to keep sums consistent with their constituents. Because shares can be arbitrary,
    // we cannot just divide totals between participants.
    it("can be converted to given currency if expense currency is defined and an exhange rate exists, and totals are based on rounded shares", function() {
      expense1.currency("EUR");
      expense2.currency("EUR");

      expect(prt11.getPaid("GBP")).toBe(15.80);
      expect(prt21.getPaid("GBP")).toBe(3.95);
      expect(expense1.getCost("GBP")).toBe(19.75);

      expect(prt11.getShare("GBP")).toBe(9.87);
      expect(prt21.getShare("GBP")).toBe(9.87);
      expect(expense1.getSumOfShares("GBP")).toBe(19.74); // 19.75 if sum of shares was converted instead of summing up converted shares

      expect(prt12.getPaid("GBP")).toBe(2.76);
      expect(prt22.getPaid("GBP")).toBe(10.66);
      expect(expense2.getCost("GBP")).toBe(13.42); // 13.43 if sum of costs was converted instead of summing up converted payments

      expect(prt12.getShare("GBP")).toBe(6.71);
      expect(prt22.getShare("GBP")).toBe(6.71);
      expect(expense2.getSumOfShares("GBP")).toBe(13.42); // 13.43 if sum of shares was converted instead of summing up converted shares

      expect(expense1.getBalance("GBP")).toBe(-0.01); // The consequence of summing up converted and rounded shares
      expect(expense2.getBalance("GBP")).toBe(0);

      expect(person1.getCost("GBP")).toBe(18.56);
      expect(person1.getSumOfShares("GBP")).toBe(16.58);
      expect(person1.getBalance("GBP")).toBe(-1.98);

      expect(person2.getCost("GBP")).toBe(14.61);
      expect(person2.getSumOfShares("GBP")).toBe(16.58);
      expect(person2.getBalance("GBP")).toBe(1.97); // The consequence of summing up converted and rounded shares: sums of persons' balances is not zero
    });

    it("throws error if conversion not possible", function() {
      expect(function() {
        prt11.getPaid("FOO");
      }).toThrowError(CurrencyConversionError);

      expect(function() {
        prt11.getShare("FOO");
      }).toThrowError(CurrencyConversionError);

      expect(function() {
        expense1.getCost("FOO");
      }).toThrowError(CurrencyConversionError);

      expect(function() {
        expense1.getSumOfShares("FOO");
      }).toThrowError(CurrencyConversionError);

      expect(function() {
        expense1.getBalance("FOO");
      }).toThrowError(CurrencyConversionError);

      expect(function() {
        person1.getCost("FOO");
      }).toThrowError(CurrencyConversionError);

      expect(function() {
        person1.getSumOfShares("FOO");
      }).toThrowError(CurrencyConversionError);

      expect(function() {
        person1.getBalance("FOO");
      }).toThrowError(CurrencyConversionError);
    });

    describe("of expenses and participations", function() {

      it("sum up as entered if expense currency is undefined", function() {
        expense1.currency(undefined);

        expect(expense1.getCost()).toBe(25);
        expect(expense1.getSumOfShares()).toBe(25);
      });

      it("can be 'converted' to expense's currency without the need for an exchange rate", function() {
        expense1.currency("EUR");

        expect(prt11.getPaid()).toBe(20);
        expect(prt11.getPaid("EUR")).toBe(20);
        expect(prt11.getShare()).toBe(12.5);
        expect(prt11.getShare("EUR")).toBe(12.5);

        expect(prt21.getPaid()).toBe(5);
        expect(prt21.getPaid("EUR")).toBe(5);
        expect(prt21.getShare()).toBe(12.5);
        expect(prt21.getShare("EUR")).toBe(12.5);

        expect(expense1.getCost()).toBe(25);
        expect(expense1.getCost("EUR")).toBe(25);
        expect(expense1.getSumOfShares()).toBe(25);
        expect(expense1.getSumOfShares("EUR")).toBe(25);
        expect(expense1.getBalance()).toBe(0);
        expect(expense1.getBalance("EUR")).toBe(0);
      });

    });

    describe("of persons", function() {

      it("sum up as balance sheet's default currency if no input currency", function() {
        expense1.currency("EUR");
        expense2.currency("EUR");

        sheet.currency("EUR");

        expect(person1.getCost()).toBe(23.5);
        expect(person1.getSumOfShares()).toBe(21);
        expect(person1.getBalance()).toBe(-2.5);

        expect(person2.getCost()).toBe(18.5);
        expect(person2.getSumOfShares()).toBe(21);
        expect(person2.getBalance()).toBe(2.5);

        sheet.currency("GBP");

        expect(person1.getCost()).toBe(18.56);
        expect(person1.getSumOfShares()).toBe(16.58);
        expect(person1.getBalance()).toBe(-1.98);

        expect(person2.getCost()).toBe(14.61);
        expect(person2.getSumOfShares()).toBe(16.58);
        expect(person2.getBalance()).toBe(1.97);
      });

    });

  });

});


