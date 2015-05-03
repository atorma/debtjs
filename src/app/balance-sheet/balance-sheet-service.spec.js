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
      var e1 = balanceSheet.createExpense();
      spyOn(e1, "shareCost");
      var e2 = balanceSheet.createExpense();
      spyOn(e2, "shareCost");
      spyOn(balanceSheet, "createPerson").and.callThrough();
      spyOn(balanceSheet, "createParticipation");
      
      balanceSheetService.balanceSheet = balanceSheet;
    });
    
    it("with option to participate in all expenses so far, which requires sharing costs", function() {
      var personData1 = {name: "Anssi"};
      var options1 = {createParticipations: true};
      var person1 = balanceSheetService.createPerson(personData1, options1);
      
      expect(person1).toBeDefined();
      expect(balanceSheet.createPerson).toHaveBeenCalledWith(personData1);
      _.each(balanceSheet.expenses, function(e) {
        expect(balanceSheet.createParticipation).toHaveBeenCalledWith({person: person1, expense: e});
        expect(e.shareCost).toHaveBeenCalled();
      });
    });
    
    it("with option not to participate in any expenses", function() {
      var personData2 = {name: "Malla", createParticipations: false};
      var person2 = balanceSheetService.createPerson(personData2);
      
      expect(person2).toBeDefined();
      expect(balanceSheet.createPerson).toHaveBeenCalledWith(personData2);
      _.each(balanceSheet.expenses, function(e) {
        expect(balanceSheet.createParticipation).not.toHaveBeenCalledWith({person: person2, expense: e});
      });
    });
    
  });
  
  it("removes person and re-shares all expenses the person participated in", function() {
    var balanceSheet = balanceSheetService.balanceSheet;
    spyOn(balanceSheet, "removePerson");
    
    var person = balanceSheet.createPerson({name: "Person"});
    
    var expense1 = balanceSheet.createExpense({name: "Expense 1"});
    balanceSheet.createParticipation({person: person, expense: expense1});
    spyOn(expense1, "shareCost");
    
    var expense2 = balanceSheet.createExpense({name: "Expense 2"});
    balanceSheet.createParticipation({person: person, expense: expense2});
    spyOn(expense2, "shareCost");
    
    var otherExpense = balanceSheet.createExpense({name: "Other expense"});
    spyOn(otherExpense, "shareCost");
    
    balanceSheetService.removePerson(person);
    
    expect(balanceSheet.removePerson).toHaveBeenCalledWith(person);
    expect(expense1.shareCost).toHaveBeenCalled();
    expect(expense2.shareCost).toHaveBeenCalled();
    expect(otherExpense.shareCost).not.toHaveBeenCalled();
    
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
    
    it("with option to add every person so far as participant", function() {
      var expenseData1 = {name: "Stuff", sharing: "equal"};
      var options1 = {createParticipations: true};
      var expense1 = balanceSheetService.createExpense(expenseData1, options1);
     
      expect(expense1).toBeDefined();
      expect(balanceSheet.createExpense).toHaveBeenCalledWith(expenseData1);
      _.each(balanceSheet.persons, function(p) {
        expect(balanceSheet.createParticipation).toHaveBeenCalledWith({person: p, expense: expense1});
      });
    });
    
    it("with option to not add anyone as participant", function() {
      var expenseData2 = {name: "More stuff", sharing: "custom"};
      var expense2 = balanceSheetService.createExpense(expenseData2);
      
      expect(expense2).toBeDefined();
      expect(balanceSheet.createExpense).toHaveBeenCalledWith(expenseData2);
      _.each(balanceSheet.persons, function(p) {
        expect(balanceSheet.createParticipation).not.toHaveBeenCalledWith({person: p, expense: expense2});
      });
    });
    
  });
  
});

