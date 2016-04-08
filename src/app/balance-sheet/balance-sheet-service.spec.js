"use strict";

var angular = require("angular");
require("angular-mocks/ngMock");
require("../debt");
  
describe("BalanceSheetService", function() {

  var balanceSheetService;
  var localStorageService;
  var balanceSheetData, balanceSheetJson, balanceSheetJsonHolder;

  var SHEET_LOCAL_STORAGE_KEY = "balanceSheetData";
  
  beforeEach(function() {
    balanceSheetData = {
      name: "Exported data",
      persons: [
        {id: 1, name: "Anssi"},
        {id: 2, name: "Malla"}
      ],
      expenses: [
        {id: 3, name: "Food", date: new Date("2016-04-07T21:00:00.000Z"), currency: "USD", sharing: "equal", settled: false},
        {id: 4, name: "Gas", date: new Date("2016-04-07T21:00:00.000Z"), currency: "EUR", sharing: "equal", settled: false}
      ],
      participations: [
        {personId: 1, expenseId: 3, paid: 10, share: 5},
        {personId: 2, expenseId: 3, paid: 0, share: 5}
      ],
      exchangeRates: [{
        fixed: "EUR",
        variable: "USD",
        rate: 1.1010
      }],
      currency: "EUR"
    };
    balanceSheetJson = JSON.stringify(balanceSheetData);
    balanceSheetJsonHolder = {json: balanceSheetJson};
    
    localStorageService = jasmine.createSpyObj("localStorageService", ["get", "set"]);
    localStorageService.get.and.returnValue(balanceSheetJsonHolder);
  });
  
  beforeEach(angular.mock.module("debtApp", function($provide) {
    $provide.value("localStorageService", localStorageService);
  }));

  beforeEach(angular.mock.inject(function(_balanceSheetService_) {
    balanceSheetService = _balanceSheetService_;
  }));
  
  
  
  describe("init() initializes the service", function() {

    
    it("with balance sheet data in localStorage when available", function() {
      balanceSheetService.init();
      
      var sheet = balanceSheetService.balanceSheet;
      
      expect(localStorageService.get).toHaveBeenCalledWith(SHEET_LOCAL_STORAGE_KEY);
      expect(sheet).toBeDefined();
      expect(sheet.persons.length).toBe(balanceSheetData.persons.length);
      expect(sheet.expenses.length).toBe(balanceSheetData.expenses.length);
      expect(sheet.participations.length).toBe(balanceSheetData.participations.length);
      expect(sheet.getExchangeRates()).toEqual(balanceSheetData.exchangeRates);
    });
    
    it("with a new balance sheet if no data in localStorage", function() {
      localStorageService.get.and.returnValue(undefined);
      balanceSheetService.init();
      
      var sheet = balanceSheetService.balanceSheet;
      
      expect(localStorageService.get).toHaveBeenCalledWith(SHEET_LOCAL_STORAGE_KEY);
      expect(sheet).toBeDefined();
      expect(sheet.persons.length).toBe(0);
      expect(sheet.expenses.length).toBe(0);
      expect(sheet.participations.length).toBe(0);
    });
    
    it("with undefined sheet and throws error if importing sheet from localStorage data fails", function() {
      balanceSheetService.init();
      balanceSheetService.balanceSheet = undefined;

      delete balanceSheetData.participations[0].personId;
      balanceSheetJson = JSON.stringify(balanceSheetData);
      localStorageService.get.and.returnValue({json: balanceSheetJson});

      expect(balanceSheetService.init).toThrow();
      expect(balanceSheetService.balanceSheet).not.toBeDefined();
    });
    
  });
  
  describe("loads balanceSheet from JSON", function() {

    it("and saves the result if the JSON is valid", function() {
      balanceSheetService.loadFromJson(balanceSheetJson);

      var jsonHolder = {
        json: balanceSheetService.exportToJson()
      };
      expect(localStorageService.set).toHaveBeenCalledWith(SHEET_LOCAL_STORAGE_KEY, jsonHolder);
    });
    
    it("and throws error if the JSON is invalid", function() {
      balanceSheetService.balanceSheet = undefined;
      delete balanceSheetData.participations[0].personId;
      expect(function() {
        balanceSheetService.loadFromJson(JSON.stringify(balanceSheetData));
      }).toThrow();
      expect(balanceSheetService.balanceSheet).not.toBeDefined();
    });
    
  });
  
  
  it("exports balanceSheet data to JSON", function() {
    balanceSheetService.init();

    var json = balanceSheetService.exportToJson();
    balanceSheetService.loadFromJson(json);
    var data = balanceSheetService.balanceSheet.exportData();
    expect(data).toEqual(balanceSheetData);
  });
  
  
  describe("save to localStorage", function() {

    beforeEach(function() {
      balanceSheetService.init();
    });
    
    it("validates balance sheet and throws error if invalid", function() {
      spyOn(balanceSheetService.balanceSheet, "throwErrorIfInvalid").and.throwError("some error");
      expect(balanceSheetService.save).toThrow();
      expect(localStorageService.set).not.toHaveBeenCalled();
    });

  });

  it("createNew() sets the sheet reference to a new sheet and saves it", function() {
    var oldSheet = balanceSheetService.balanceSheet;

    balanceSheetService.createNew();
    var newSheet = balanceSheetService.balanceSheet;

    expect(newSheet).not.toBe(oldSheet);
    var jsonHolder = {json: JSON.stringify(newSheet.exportData())};
    expect(localStorageService.set).toHaveBeenCalledWith(SHEET_LOCAL_STORAGE_KEY, jsonHolder);

  });

});


describe("BalanceSheetService save to localStorage", function() {

  var balanceSheetService;

  beforeEach(angular.mock.module("debtApp"));

  beforeEach(angular.mock.inject(function(_balanceSheetService_) {
    balanceSheetService = _balanceSheetService_;
  }));

  it("saves and loads expense with date", function() {
    balanceSheetService.createNew();
    var expense = balanceSheetService.balanceSheet.createExpense();
    expense.date = new Date("2016-04-07T21:00:00.000Z");
    balanceSheetService.save();
    balanceSheetService.init();
    expect(balanceSheetService.balanceSheet.expenses[0].date).toEqual(expense.date);
  });

});