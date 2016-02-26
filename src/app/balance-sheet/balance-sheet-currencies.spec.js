"use strict";

var BalanceSheet = require('./balance-sheet');
var _ = require("lodash");
var Decimal = require("simple-decimal-money");

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


  describe("balance sheet", function() {

    it("can convert a value from one currency to another in two decimal accuracy", function() {
      sheet.addExchangeRate({fixed: "EUR", variable: "GBP", rate: 0.7898});
      sheet.addExchangeRate({fixed: "EUR", variable: "USD", rate: 1.1030});

      expect(sheet.convertCurrency({value: 2.5, from: "EUR", to: "GBP"})).toBe(1.97);
      expect(sheet.convertCurrency({value: 2.5, from: "EUR", to: "USD"})).toBe(2.76);
    });

    it("can convert a value from one currency to another using an inverse rate unless an exact rate is available", function() {
      sheet.addExchangeRate({fixed: "EUR", variable: "GBP", rate: 0.7898});
      sheet.addExchangeRate({fixed: "EUR", variable: "USD", rate: 1.1030});
      sheet.addExchangeRate({fixed: "USD", variable: "EUR", rate: 0.1}); // Totally weird, but this is the exact rate

      expect(sheet.convertCurrency({value: 2.5, from: "EUR", to: "GBP"})).toBe(1.97); // Computed using exact rate
      expect(sheet.convertCurrency({value: 2.5, from: "GBP", to: "EUR"})).toBe(3.17); // Computed using inverse rate

      expect(sheet.convertCurrency({value: 2.5, from: "EUR", to: "USD"})).toBe(2.76); // Computed using exact rate
      expect(sheet.convertCurrency({value: 2.5, from: "USD", to: "EUR"})).toBe(0.25); // Computed using exact rate
    });

    it("throws error if it cannot find an exchange rate", function() {
      expect(function() {
        sheet.convertCurrency({value: 2.5, from: "EUR", to: "GBP"});
      }).toThrow();
    });

    it("can remove an exchange rate", function() {
      sheet.addExchangeRate({fixed: "EUR", variable: "GBP", rate: 0.7898});
      sheet.removeExchangeRate({fixed: "EUR", variable: "GBP"});

      expect(function() {
        sheet.convertCurrency({value: 2.5, from: "EUR", to: "GBP"});
      }).toThrow();
    });

    it("throws an error if a quotation is invalid", function() {
      expect(function() {
        sheet.addExchangeRate({fixed: "EUR", variable: "GBP", rate: -1});
      }).toThrow();
      expect(function() {
        sheet.addExchangeRate({fixed: undefined, variable: "GBP", rate: 0.7898});
      }).toThrow();
      expect(function() {
        sheet.addExchangeRate({fixed: {name: "aargh"}, variable: "GBP", rate: 0.7898});
      }).toThrow();
      expect(function() {
        sheet.addExchangeRate({fixed: "EUR", variable: -1, rate: 0.7898});
      }).toThrow();
    });

  });

  describe("expense and participations", function() {

    var prt11, prt21;

    beforeEach(function() {
      sheet.addExchangeRate({fixed: "EUR", variable: "GBP", rate: 0.7898});

      prt11 = sheet.createParticipation({person: person1, expense: expense1, paid: 20, share: 12.5});
      prt21 = sheet.createParticipation({person: person2, expense: expense1, paid: 5, share: 12.5});
    });

    it("are defined in what ever currency the expense is, even if undefined", function() {
      expect(expense1.getCost()).toBe(25);
    });

    it("can be 'converted' expense's currency without the need for an exchange rate", function() {
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
    });

    it("can be converted to given currency if expense currency is defined and an exhange rate exists", function() {
      expense1.currency = "EUR";

      expect(prt11.getPaid("GBP")).toBe(15.80);
      expect(prt11.getShare("GBP")).toBe(9.87);

      expect(prt21.getPaid("GBP")).toBe(3.95);
      expect(prt21.getShare("GBP")).toBe(9.87);

      expect(expense1.getCost("GBP")).toBe(19.75);
    });
  });

});


