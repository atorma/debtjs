"use strict";

var angular = require("angular");
var BalanceSheet = require("./balance-sheet");
require("angular-mocks/ngMock");
require("../debt");
  
describe("BalanceSheetService", function() {

  var balanceSheetService;
  var localStorageService;
  var balanceSheetData;
  
  beforeEach(function() {
    balanceSheetData = {
        name: "Stored sheet",
        persons: [
                  {id: 1, name: "Anssi"}, {id: 2, name: "Malla"}
                  ],
        expenses: [
                   {id: 3, name: "Food"}
                   ],
        participations: [
                         {personId: 1, expenseId: 3, paid: 10, share: 5}, 
                         {personId: 2, expenseId: 3, paid: 0, share: 5}
                         ],
        idSequence: 4                 
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

  it("is initialized with balance sheet data in localStorage when available", function() {
    var sheet = balanceSheetService.balanceSheet;
    
    expect(localStorageService.get).toHaveBeenCalledWith("balanceSheetData");
    expect(sheet).toBeDefined();
    expect(sheet.persons.length).toBe(balanceSheetData.persons.length);
    expect(sheet.expenses.length).toBe(balanceSheetData.expenses.length);
    expect(sheet.participations.length).toBe(balanceSheetData.participations.length);
  });
  
  it("is initialized with a new balance sheet if no data in localStorage", function() {
    localStorageService.get.and.returnValue(undefined);
    balanceSheetService.init();
    
    var sheet = balanceSheetService.balanceSheet;
    
    expect(localStorageService.get).toHaveBeenCalledWith("balanceSheetData");
    expect(sheet).toBeDefined();
    expect(sheet.persons.length).toBe(0);
    expect(sheet.expenses.length).toBe(0);
    expect(sheet.participations.length).toBe(0);
  });
  
  it("loads balanceSheet from JSON and saves the result", function() {
    balanceSheetData.name = "From JSON";
    
    balanceSheetService.loadFromJson(JSON.stringify(balanceSheetData));
    
    expect(balanceSheetService.balanceSheet.name).toEqual("From JSON");
    expect(localStorageService.set).toHaveBeenCalledWith("balanceSheetData", balanceSheetData);
  });
  
  it("exports balanceSheet data to JSON", function() {
    var json = balanceSheetService.exportToJson();
    var data = JSON.parse(json);
    expect(data).toEqual(balanceSheetData);
  });
});

