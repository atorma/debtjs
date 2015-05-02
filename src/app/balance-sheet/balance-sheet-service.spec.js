"use strict";

var _ = require("lodash");
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
  
  
  
  describe("is initialized", function() {
    
    it("with balance sheet data in localStorage when available", function() {
      var sheet = balanceSheetService.balanceSheet;
      
      expect(localStorageService.get).toHaveBeenCalledWith("balanceSheetData");
      expect(sheet).toBeDefined();
      expect(sheet.persons.length).toBe(balanceSheetData.persons.length);
      expect(sheet.expenses.length).toBe(balanceSheetData.expenses.length);
      expect(sheet.participations.length).toBe(balanceSheetData.participations.length);
    });
    
    it("with a new balance sheet if no data in localStorage", function() {
      localStorageService.get.and.returnValue(undefined);
      balanceSheetService.init();
      
      var sheet = balanceSheetService.balanceSheet;
      
      expect(localStorageService.get).toHaveBeenCalledWith("balanceSheetData");
      expect(sheet).toBeDefined();
      expect(sheet.persons.length).toBe(0);
      expect(sheet.expenses.length).toBe(0);
      expect(sheet.participations.length).toBe(0);
    });
    
    it("with error thrown if creating sheet from localStorage data fails", function() {
      balanceSheetService.balanceSheet = undefined;
      balanceSheetData.participations[0].paid = "aargh";
      expect(balanceSheetService.init).toThrow();
      expect(balanceSheetService.balanceSheet).not.toBeDefined();
    });
    
  });
  
  describe("loads balanceSheet from JSON", function() {
    
    it("and saves the result if the JSON is valid", function() {
      balanceSheetData.name = "From JSON";
      
      balanceSheetService.loadFromJson(JSON.stringify(balanceSheetData));
      
      expect(balanceSheetService.balanceSheet.name).toEqual("From JSON");
      expect(localStorageService.set).toHaveBeenCalledWith("balanceSheetData", balanceSheetData);
    });
    
    it("and throws error if the JSON is invalid", function() {
      balanceSheetService.balanceSheet = undefined;
      balanceSheetData.participations[0].paid = "aargh";
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
    });
    
  });
  
  
  describe("creates person", function() {
    
    var balanceSheet;

    beforeEach(function() {
      balanceSheet = new BalanceSheet();
      balanceSheet.createExpense();
      balanceSheet.createExpense();
      spyOn(balanceSheet, "createPerson").and.callThrough();
      spyOn(balanceSheet, "createParticipation");
      
      balanceSheetService.balanceSheet = balanceSheet;
    });
    
    it("with option to participate in all expenses so far", function() {
      var options1 = {name: "Anssi", createParticipations: true};
      var person1 = balanceSheetService.createPerson(options1);
      
      expect(person1).toBeDefined();
      expect(balanceSheet.createPerson).toHaveBeenCalledWith(options1);
      _.each(balanceSheet.expenses, function(e) {
        expect(balanceSheet.createParticipation).toHaveBeenCalledWith({person: person1, expense: e});
      });
      
      var options2 = {name: "Malla", createParticipations: false};
      var person2 = balanceSheetService.createPerson(options2);
      
      expect(person2).toBeDefined();
      expect(balanceSheet.createPerson).toHaveBeenCalledWith(options2);
      _.each(balanceSheet.expenses, function(e) {
        expect(balanceSheet.createParticipation).not.toHaveBeenCalledWith({person: person2, expense: e});
      });
    });
    
  });
  
  describe("creates expense", function() {
    
    var balanceSheet;

    beforeEach(function() {
      balanceSheet = new BalanceSheet();
      balanceSheet.createPerson();
      balanceSheet.createPerson();
      spyOn(balanceSheet, "createExpense").and.callThrough();
      spyOn(balanceSheet, "createParticipation");
      
      balanceSheetService.balanceSheet = balanceSheet;
    });
    
    it("with option to participate in all expenses so far", function() {
      var options1 = {name: "Stuff", sharing: "equal", createParticipations: true};
      var expense1 = balanceSheetService.createExpense(options1);
     
      expect(expense1).toBeDefined();
      expect(balanceSheet.createExpense).toHaveBeenCalledWith(options1);
      _.each(balanceSheet.persons, function(p) {
        expect(balanceSheet.createParticipation).toHaveBeenCalledWith({person: p, expense: expense1});
      });
      
      var options2 = {name: "More stuff", sharing: "custom", createParticipations: false};
      var expense2 = balanceSheetService.createExpense(options2);
      
      expect(expense2).toBeDefined();
      expect(balanceSheet.createExpense).toHaveBeenCalledWith(options2);
      _.each(balanceSheet.persons, function(p) {
        expect(balanceSheet.createParticipation).not.toHaveBeenCalledWith({person: p, expense: expense2});
      });
    });
    
  });
  
});

