"use strict";

var BalanceSheet = require('./balance-sheet');
var _ = require("lodash");

describe("Balance sheet currencies", function () {

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

    it("getCurrencies() returns currencies in alphabetical order", function() {
      var exchangeRates = [
        {fixed: "EUR", variable: "GBP", rate: 0.7898},
        {fixed: "EUR", variable: "USD", rate: 1.1030}
      ];
      sheet.addOrUpdateExchangeRate(exchangeRates[0]);
      sheet.addOrUpdateExchangeRate(exchangeRates[1]);

      expect(sheet.getCurrencies()).toEqual(["EUR", "GBP", "USD"]);
    });

    describe("convertCurrency()", function() {

      it("converts a value from one currency to another in two decimal accuracy", function() {
        sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "GBP", rate: 0.7898});
        sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "USD", rate: 1.1030});

        expect(sheet.convertCurrency({value: 2.5, from: "EUR", to: "GBP"})).toBe(1.97);
        expect(sheet.convertCurrency({value: 2.5, from: "EUR", to: "USD"})).toBe(2.76);
      });

      it("converts a value from one currency to another using an inverse rate unless an exact rate is available", function() {
        sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "GBP", rate: 0.7898});
        sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "USD", rate: 1.1030});
        sheet.addOrUpdateExchangeRate({fixed: "USD", variable: "EUR", rate: 0.1}); // Totally weird, but this is the exact rate

        expect(sheet.convertCurrency({value: 2.5, from: "EUR", to: "GBP"})).toBe(1.97); // Computed using exact rate
        expect(sheet.convertCurrency({value: 2.5, from: "GBP", to: "EUR"})).toBe(3.17); // Computed using inverse rate

        expect(sheet.convertCurrency({value: 2.5, from: "EUR", to: "USD"})).toBe(2.76); // Computed using exact rate
        expect(sheet.convertCurrency({value: 2.5, from: "USD", to: "EUR"})).toBe(0.25); // Computed using exact rate
      });

      it("throws error if it cannot find an exchange rate when converting currency", function() {
        expect(function() {
          sheet.convertCurrency({value: 2.5, from: "EUR", to: "GBP"});
        }).toThrow();
      });


    });


    describe("has a default currency", function() {

      it("set as first fixed currency if default is undefined", function() {
        expect(sheet.getDefaultCurrency()).toBeUndefined();
        sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "GBP", rate: 0.7898});
        expect(sheet.getDefaultCurrency()).toEqual("EUR");
        sheet.addOrUpdateExchangeRate({fixed: "USD", variable: "GBP", rate: 0.7131});
      });

      it("set as first fixed currency if default currency removed", function() {
        sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "GBP", rate: 0.7898});
        sheet.addOrUpdateExchangeRate({fixed: "USD", variable: "GBP", rate: 0.7131});
        sheet.removeExchangeRate({fixed: "EUR", variable: "GBP"});
        expect(sheet.getDefaultCurrency()).toEqual("USD");
      });

      it("set as undefined if all currencies removed", function() {
        sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "GBP", rate: 0.7898});
        sheet.addOrUpdateExchangeRate({fixed: "USD", variable: "GBP", rate: 0.7131});
        sheet.removeExchangeRate({fixed: "EUR", variable: "GBP"});
        sheet.removeExchangeRate({fixed: "USD", variable: "GBP"});
        expect(sheet.getDefaultCurrency()).toBeUndefined();
      });

    });

  });

  describe("expense and participations", function() {

    var prt11, prt21;

    beforeEach(function() {
      sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "GBP", rate: 0.7898});

      prt11 = sheet.createParticipation({person: person1, expense: expense1, paid: 20, share: 12.5});
      prt21 = sheet.createParticipation({person: person2, expense: expense1, paid: 5, share: 12.5});
    });

    it("cost and shares are defined in what ever currency the expense is, even if undefined", function() {
      expense1.currency = undefined;

      expect(expense1.getCost()).toBe(25);
      expect(expense1.getSumOfShares()).toBe(25);
    });

    it("can be 'converted' to expense's currency without the need for an exchange rate", function() {
      expense1.currency = "EUR";

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
    });

    it("can be converted to given currency if expense currency is defined and an exhange rate exists", function() {
      expense1.currency = "EUR";

      expect(prt11.getPaid("GBP")).toBe(15.80);
      expect(prt21.getPaid("GBP")).toBe(3.95);
      expect(expense1.getCost("GBP")).toBe(19.75);

      expect(prt11.getShare("GBP")).toBe(9.87);
      expect(prt21.getShare("GBP")).toBe(9.87);
      expect(expense1.getSumOfShares("GBP")).toBe(19.75); // Converted values do not need to sum up exactly
    });
  });

});


