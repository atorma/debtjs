"use strict";

var _ = require("lodash");
var angular = require("angular");
require("angular-mocks/ngMock");
require("../debt");
  
describe("BalanceSheetService", function() {

  var balanceSheetService;
  var localStorageService;
  var balanceSheetData;

  var SHEET_LOCAL_STORAGE_KEY = "balanceSheetData";
  
  beforeEach(function() {
    balanceSheetData = {
      name: "Exported data",
      persons: [
        {id: 1, name: "Anssi"}, {id: 2, name: "Malla"}
      ],
      expenses: [
        {id: 3, name: "Food", sharing: "equal", settled: false}
      ],
      participations: [
        {personId: 1, expenseId: 3, paid: 10, share: 5},
        {personId: 2, expenseId: 3, paid: 0, share: 5}
      ]
    };
    
    localStorageService = jasmine.createSpyObj("localStorageService", ["get", "set"]);
    localStorageService.get.and.returnValue(balanceSheetData);
  });
  
  beforeEach(angular.mock.module("debtApp", function($provide) {
    $provide.value("localStorageService", localStorageService);
  }));

  beforeEach(angular.mock.inject(function(_balanceSheetService_) {
    balanceSheetService = _balanceSheetService_;
  }));
  
  
  
  describe("is initialized", function() {
    
    it("with balance sheet data in localStorage when available", function() {
      var sheet = balanceSheetService.balanceSheet;
      
      expect(localStorageService.get).toHaveBeenCalledWith(SHEET_LOCAL_STORAGE_KEY);
      expect(sheet).toBeDefined();
      expect(sheet.persons.length).toBe(balanceSheetData.persons.length);
      expect(sheet.expenses.length).toBe(balanceSheetData.expenses.length);
      expect(sheet.participations.length).toBe(balanceSheetData.participations.length);
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
    
    it("with undefined sheet and stored error from localStorage data fails", function() {
      balanceSheetService.balanceSheet = undefined;
      delete balanceSheetData.participations[0].personId;
      expect(balanceSheetService.init).not.toThrow();
      expect(balanceSheetService.balanceSheet).not.toBeDefined();
      expect(balanceSheetService.error).toBeDefined();
    });
    
  });
  
  describe("loads balanceSheet from JSON", function() {
    
    it("and saves the result if the JSON is valid", function() {
      balanceSheetService.loadFromJson(JSON.stringify(balanceSheetData));
      
      expect(localStorageService.set).toHaveBeenCalledWith(SHEET_LOCAL_STORAGE_KEY, balanceSheetData);
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
    var json = balanceSheetService.exportToJson();
    var data = JSON.parse(json);
    expect(data).toEqual(balanceSheetData);
  });
  
  
  describe("save to localStorage", function() {
    
    it("validates balance sheet and throws error if invalid", function() {
      spyOn(balanceSheetService.balanceSheet, "throwErrorIfInvalid").and.throwError("some error");
      expect(balanceSheetService.save).toThrow();
      expect(localStorageService.set).not.toHaveBeenCalled();
      expect(balanceSheetService.error).toBeDefined();
    });
    
  });

  it("createNew() sets the sheet reference to a new sheet and saves it", function() {
    var oldSheet = balanceSheetService.balanceSheet;

    balanceSheetService.createNew();
    var newSheet = balanceSheetService.balanceSheet;

    expect(newSheet).not.toBe(oldSheet);
    expect(localStorageService.set).toHaveBeenCalledWith(SHEET_LOCAL_STORAGE_KEY, newSheet.exportData());

  });

});

