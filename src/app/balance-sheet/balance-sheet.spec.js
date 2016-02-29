"use strict";

var BalanceSheet = require('./balance-sheet');
var _ = require("lodash");
var angular = require("angular");

describe("Balance sheet", function () {

  var sheet = null;

  beforeEach(function() {
    sheet = new BalanceSheet();
  });


  it("has an initial name", function() {
    expect(sheet.name).toEqual("New sheet");
  });

  describe("balanced", function() {
    
    var prt11, prt21, prt12, prt22;

    beforeEach(function() {
      var person1 = sheet.createPerson();
      var person2 = sheet.createPerson();

      var expense1 = sheet.createExpense();
      var expense2 = sheet.createExpense();

      prt11 = sheet.createParticipation({person: person1, expense: expense1, paid: 20, share: 15});
      prt21 = sheet.createParticipation({person: person2, expense: expense1, paid: 0, share: 5});
      prt12 = sheet.createParticipation({person: person1, expense: expense2, paid: 35, share: 22.5});
      prt22 = sheet.createParticipation({person: person2, expense: expense2, paid: 10, share: 22.5});

      var settledExpense = sheet.createExpense();
      settledExpense.settled = true;
      settledExpense.sharing = "custom";
      sheet.createParticipation({person: person2, expense: settledExpense, paid: 0, share: 100});
    });
    
    it("yes, if all non-settled expenses are balanced", function() {
      expect(sheet.isBalanced()).toBe(true);
    });
    
    it("no, if an individual expense is not balanced (even if total is)", function() {
      prt11.share = 65;
      prt12.share = 0;
      prt21.share = 0;
      prt22.share = 0;
      expect(sheet.isBalanced()).toBe(false);
    });
    
    it("no, if an expense payment is undefined", function() {
      prt11.paid = undefined;
      expect(sheet.isBalanced()).toBe(false);
    });
  });
  
  describe("import/export", function() {
    
    beforeEach(function() {
      sheet.name = "Import/export test";
      var p1 = sheet.createPerson({name: "Anssi"});
      var p2 = sheet.createPerson({name: "Malla"});
      var e1 = sheet.createExpense({name: "Food"});
      var e2 = sheet.createExpense({name: "Stuff"});
      sheet.createParticipation({person: p1, expense: e1, paid: 15, share: 10});
      sheet.createParticipation({person: p2, expense: e1, paid: 0, share: 5});
      sheet.createParticipation({person: p1, expense: e2, paid: 10, share: 0});
      sheet.createParticipation({person: p2, expense: e2, paid: 0, share: 10});
      sheet.addOrUpdateExchangeRate({fixed: "EUR", variable: "USD", rate: 1.012});
    });
    
    it("as data object", function() {
      var data = sheet.exportData();     
      var json = JSON.stringify(data);
      data = JSON.parse(json);
      var importedSheet = new BalanceSheet(data);

      expect(importedSheet.name).toEqual(sheet.name);
      expect(angular.equals(sheet.persons, importedSheet.persons)).toBe(true);
      expect(angular.equals(sheet.expenses, importedSheet.expenses)).toBe(true);
      expect(angular.equals(sheet.participations, importedSheet.participations)).toBe(true);
      expect(angular.equals(sheet.getExchangeRates(), importedSheet.getExchangeRates())).toBe(true);
    });
    
    it("determines next id in sequence without imported data containing it", function() {
      var maxId = 100;
      sheet.persons[0].id = maxId;
      var data = sheet.exportData();
      expect(data.idSequence).not.toBeDefined();

      var importedSheet = new BalanceSheet(data);
      var person = importedSheet.createPerson();
      expect(person.id).toBe(maxId + 1);
    });

    it("next id in sequence is 1 if no ids in data", function() {
      var importedSheet = new BalanceSheet({persons: [], expenses: [], participations: []});
      var person = importedSheet.createPerson();
      expect(person.id).toBe(1);
    });
      
    it("fails if input data is invalid", function() {
      var data = sheet.exportData();     
      data.participations[0].personId = -666;
      expect(function() {
        new BalanceSheet(data);
      }).toThrow();
    });
    
  });
    
  describe("validates", function() {
  
    beforeEach(function() {
      var p1 = sheet.createPerson({name: "Anssi"});
      var e1 = sheet.createExpense({name: "Food"});
      sheet.createParticipation({person: p1, expense: e1, paid: 15, share: 10});
    });
    
    it("when valid", function() {
      expect(sheet.isValid()).toBe(true);        
    });
    
    it("as invalid when a person is missing an id", function() {
      delete sheet.persons[0].id;
      expect(sheet.isValid()).toBe(false);        
    });
    
    it("as valid even though a person is missing a name", function() {
      delete sheet.persons[0].name;
      expect(sheet.isValid()).toBe(true);        
    });
    
    it("as invalid when an expense is missing an id", function() {
      delete sheet.expenses[0].id;
      expect(sheet.isValid()).toBe(false);        
    });
    
    it("as valid even though an expense is missing a name", function() {
      delete sheet.expenses[0].name;
      expect(sheet.isValid()).toBe(true);        
    });
    
    it("as valid even though an expense is missing share mode", function() {
      delete sheet.expenses[0].sharing;
      expect(sheet.isValid()).toBe(true);        
      
    });
    
    it("as valid when an expense has unknown share mode", function() {
      sheet.expenses[0].sharing = "wtf";
      expect(sheet.isValid()).toBe(true);        
    });
    
    it("as invalid when a participation person is not found", function() {
      sheet.participations[0].person = {id: -1235};
      expect(sheet.isValid()).toBe(false);        
    });
    
    it("as invalid when a participation expense is not found", function() {
      sheet.participations[0].expense = {id: -1235};
      expect(sheet.isValid()).toBe(false);        
    });
    
    it("as valid even when a participation does not have a non-negative payment", function() {
      sheet.participations[0].paid = null;
      expect(sheet.isValid()).toBe(true);
      
      sheet.participations[0].paid = "aargh";
      expect(sheet.isValid()).toBe(true); 
      
      sheet.participations[0].paid = -10;
      expect(sheet.isValid()).toBe(true);  
    });
    
    it("as valid even when participation does not have a non-negative share", function() {
      sheet.participations[0].share = null;
      expect(sheet.isValid()).toBe(true);
      
      sheet.participations[0].share = "aargh";
      expect(sheet.isValid()).toBe(true); 
      
      sheet.participations[0].share = -10;
      expect(sheet.isValid()).toBe(true);  
    });
 
  });
  
  

  
  describe("person", function() {

    it("gets distinct id when created", function() {
      var anssi = sheet.createPerson({name: "Anssi"});
      var malla = sheet.createPerson({name: "Malla"});

      expect(anssi.id).toBeDefined();
      expect(anssi.name).toBe("Anssi");
      expect(malla.id).toBeDefined();
      expect(malla.name).toBe("Malla");
      expect(anssi.id).not.toEqual(malla.id);
      expect(sheet.persons).toEqual([anssi, malla]);
    });
    
    it("can be found by id", function() {
      var anssi = sheet.createPerson({name: "Anssi"});
      var malla = sheet.createPerson({name: "Malla"});

      expect(sheet.getPerson(anssi.id)).toBe(anssi);
      expect(sheet.getPerson(malla.id)).toBe(malla);
    });
    
    it("equals other expense by id", function() {
      var person1 = sheet.createPerson({name: "Anssi"});
      var person2 = sheet.createPerson({name: "Malla"});
      var expense1 = sheet.createExpense({name: "Anssi"});
      
      expect(person1.equals(person1)).toBe(true);
      expect(person1.equals(person2)).toBe(false);
      expect(person1.equals(expense1)).toBe(false);
      
      person2.id = person1.id;
      expect(person1.equals(person2)).toBe(true);
      
      expense1.id = person1.id;
      expect(person1.equals(expense1)).toBe(false);
    });

    it("created with numbered name when no name given", function() {
      var person1 = sheet.createPerson();
      expect(person1.name).toBe("Person 1");

      sheet.createPerson({name: "Defined"});
      sheet.createExpense({name: "Defined"});

      var person3 = sheet.createPerson();
      expect(person3.name).toBe("Person 3");
    });
    
    it("can be created with option to participate in all non-settled expenses, which requires sharing costs", function() {
      var expense1 = sheet.createExpense();
      var expense2 = sheet.createExpense();
      var settled = sheet.createExpense({settled: true});
      spyOn(expense1, "shareCost");
      spyOn(expense2, "shareCost");
      spyOn(settled, "shareCost");
      
      var person = sheet.createPerson({}, {createParticipations: true});
      
      expect(_.find(person.getParticipations(), {expense: expense1})).toBeDefined();
      expect(_.find(person.getParticipations(), {expense: expense2})).toBeDefined();
      expect(_.find(person.getParticipations(), {expense: settled})).not.toBeDefined();
      expect(expense1.shareCost).toHaveBeenCalled();
      expect(expense2.shareCost).toHaveBeenCalled();
      expect(settled.shareCost).not.toHaveBeenCalled();
    });
    
    it("can return its participations", function() {
      var expense1 = sheet.createExpense();
      var expense2 = sheet.createExpense();
      var person1 = sheet.createPerson();
      var person2 = sheet.createPerson();

      var p1To1 = sheet.createParticipation({person: person1, expense: expense1, paid: 10});
      var p2To1 = sheet.createParticipation({person: person2, expense: expense1, paid: 11});
      var p1To2 = sheet.createParticipation({person: person1, expense: expense2, paid: 20});

      expect(person1.getParticipations().length).toBe(2);
      expect(person1.getParticipations()).toContain(p1To1);
      expect(person1.getParticipations()).toContain(p1To2);
      expect(person2.getParticipations().length).toBe(1);
      expect(person2.getParticipations()).toContain(p2To1);
    });
    
    it("removing removes all its participations", function() {
      var expense1 = sheet.createExpense();
      var expense2 = sheet.createExpense();
      var person1 = sheet.createPerson();
      var person2 = sheet.createPerson();
      
      sheet.createParticipation({person: person1, expense: expense1, paid: 10});
      sheet.createParticipation({person: person2, expense: expense1, paid: 11});
      sheet.createParticipation({person: person1, expense: expense2, paid: 20});
      sheet.createParticipation({person: person2, expense: expense2, paid: 21});

      expect(sheet.persons).toContain(person1);
      
      sheet.removePerson(person1);
      
      expect(sheet.persons).not.toContain(person1);
      expect(sheet.persons).toContain(person2);
      expect(sheet.participations.length).toBe(2);
    });
    
    it("balance is difference between sum shared and sum paid over non-settled expense", function() {
      var person = sheet.createPerson();

      var expense1 = sheet.createExpense();
      expense1.sharing = "custom";

      var expense2 = sheet.createExpense();
      expense2.sharing = "custom";

      var expense3 = sheet.createExpense();
      expense3.sharing = "custom";
      expense3.settled = true;

      sheet.createParticipation({person: person, expense: expense1, paid: 20, share: 10});
      sheet.createParticipation({person: person, expense: expense2, paid: 0, share: 15});
      sheet.createParticipation({person: person, expense: expense3, paid: 0, share: 100}); // expense settled, not to be counted in
      
      expect(person.getBalance()).toBe(5); // share is more than paid => debtor

    });

  });

  describe("expense", function() {

    it("gets distinct id when created", function() {
      var food = sheet.createExpense({name: "Food"});
      var gas = sheet.createExpense({name: "Gas"});

      expect(food.id).toBeDefined();
      expect(food.name).toBe("Food");
      expect(gas.id).toBeDefined();
      expect(gas.name).toBe("Gas");
      expect(food.id).not.toEqual(gas.id);
      expect(sheet.expenses).toEqual([food, gas]);
    });
    
    it("has sharing mode 'equal' by default", function() {
      var expense = sheet.createExpense();
      expect(expense.sharing).toBe('equal');
    });
    
    it("is initially not settled", function() {
      var expense = sheet.createExpense();
      expect(expense.settled).toBe(false);
    });
    
    it("can be found by id", function() {
      var food = sheet.createExpense({name: "Food"});
      var gas = sheet.createExpense({name: "Gas"});

      expect(sheet.getExpense(food.id)).toBe(food);
      expect(sheet.getExpense(gas.id)).toBe(gas);

    });
    
    it("equals other expense by id", function() {
      var expense1 = sheet.createExpense({name: "Food"});
      var expense2 = sheet.createExpense({name: "Gas"});
      var person1 = sheet.createPerson({name: "Food"});
      
      expect(expense1.equals(expense1)).toBe(true);
      expect(expense1.equals(expense2)).toBe(false);
      expect(expense1.equals(person1)).toBe(false);
      
      expense2.id = expense1.id;
      expect(expense1.equals(expense2)).toBe(true);
      
      person1.id = expense1.id;
      expect(expense1.equals(person1)).toBe(false);
    });

    it("created with numbered name when no name given", function() {
      var expense1 = sheet.createExpense();
      expect(expense1.name).toBe("Expense 1");

      sheet.createPerson({name: "Defined"});
      sheet.createExpense({name: "Defined"});

      var expense3 = sheet.createExpense();
      expect(expense3.name).toBe("Expense 3");
    });
    
    it("can be created with option to add every person so far as participant", function() {
      var person1 = sheet.createPerson();
      var person2 = sheet.createPerson();

      var expense = sheet.createExpense({}, {createParticipations: true});
     
      expect(_.find(expense.getParticipations(), {person: person1})).toBeDefined();
      expect(_.find(expense.getParticipations(), {person: person2})).toBeDefined();
    });

    it("can return its participations", function() {
      var expense1 = sheet.createExpense();
      var expense2 = sheet.createExpense();
      var person1 = sheet.createPerson();
      var person2 = sheet.createPerson();

      var p1To1 = sheet.createParticipation({person: person1, expense: expense1});
      var p2To1 = sheet.createParticipation({person: person2, expense: expense1});
      var p1To2 = sheet.createParticipation({person: person1, expense: expense2});

      expect(expense1.getParticipations().length).toBe(2);
      expect(expense1.getParticipations()).toContain(p1To1);
      expect(expense1.getParticipations()).toContain(p2To1);
      expect(expense2.getParticipations().length).toBe(1);
      expect(expense2.getParticipations()).toContain(p1To2);
    });
        
    it("is balanced if cost equals sum of shares", function() {
      var expense = sheet.createExpense();
      
      var person1 = sheet.createPerson();
      var person2 = sheet.createPerson();
      var prt1 = sheet.createParticipation({person: person1, expense: expense, paid: 20, share: 15});
      var prt2 = sheet.createParticipation({person: person2, expense: expense, paid: 0, share: 5});
      
      expect(expense.isBalanced()).toBe(true);
      
      prt2.share = 0;
      
      expect(expense.isBalanced()).toBe(false);
    });

    it("removing removes all its participations", function() {
      var expense1 = sheet.createExpense();
      var expense2 = sheet.createExpense();
      var person1 = sheet.createPerson();
      var person2 = sheet.createPerson();

      sheet.createParticipation({person: person1, expense: expense1, paid: 10});
      sheet.createParticipation({person: person2, expense: expense1, paid: 11});
      sheet.createParticipation({person: person1, expense: expense2, paid: 20});
      sheet.createParticipation({person: person2, expense: expense2, paid: 21});

      sheet.removeExpense(expense1);
      expect(sheet.expenses.length).toBe(1);
      expect(sheet.expenses[0].equals(expense2)).toBe(true);
    });

  });

  describe("participation", function() {
    
    var anssi, food;
    
    beforeEach(function() {
      anssi = sheet.createPerson({name: "Anssi"});
      food = sheet.createExpense({name: "Food"});
    });

    it("is created with correct default values", function() {
      var participation = sheet.createParticipation({expense: food, person: anssi});
      expect(participation.paid).toBe(0);
      expect(participation.share).toBe(0);
    });
    
    it("requires person and expense", function() {
      expect(function() {
        sheet.createParticipation({expense: food});
      }).toThrow();
      expect(function() {
        sheet.createParticipation({person: anssi});
      }).toThrow();
      expect(function() {
        sheet.createParticipation({person: anssi, expense: food});
      }).not.toThrow();
    });
    
    it("cannot be created as duplicate", function() {
      var participation = sheet.createParticipation({expense: food, person: anssi});
      expect(function() {
        sheet.createParticipation({expense: participation.expense, person: participation.person});
      }).toThrow();
      expect(sheet.participations.length).toBe(1);
    });
    
    it("can be found by person and expense", function() {
      var participation = sheet.createParticipation({expense: food, person: anssi, paid: 10, share: 5});
      expect(sheet.participations.length).toBe(1);
      
      expect(sheet.getParticipation({person: anssi, expense: food})).toBe(participation);
    });

    it("can be removed by person and expense or using itself", function() {
      sheet.createParticipation({expense: food, person: anssi});
      expect(sheet.participations.length).toBe(1);
      
      sheet.removeParticipation({expense: food, person: anssi});
      expect(sheet.participations.length).toBe(0);
      
      var participation = sheet.createParticipation({expense: food, person: anssi});
      expect(sheet.participations.length).toBe(1);
      
      sheet.removeParticipation(participation);
      expect(sheet.participations.length).toBe(0);
    });

    it("get all non-settled", function() {
      var settledExpense = sheet.createExpense({name: "Settled", settled: true});
      var settledPt = sheet.createParticipation({expense: settledExpense, person: anssi});
      var nonSettledPt = sheet.createParticipation({expense: food, person: anssi});

      expect(sheet.getNonSettledParticipations()).toEqual([nonSettledPt]);
    });
  });
  
  describe("costs and shares", function() {

    var expense1, expense2, person1, person2;

    beforeEach(function() {
      expense1 = sheet.createExpense();
      expense2 = sheet.createExpense();
      expense1.sharing = "custom";
      expense2.sharing = "custom";
      spyOn(expense1, "shareCost").and.callThrough();
      spyOn(expense2, "shareCost").and.callThrough();
      
      person1 = sheet.createPerson();
      person2 = sheet.createPerson();
    });

    it("of an expense are initially zero", function() {
      expect(expense1.getCost()).toBe(0);
      expect(expense1.getSumOfShares()).toBe(0);
    });
    
    it("of a person are initially zero", function() {
      expect(person1.getCost()).toBe(0);
      expect(person1.getSumOfShares()).toBe(0);
    });

    it("are updated when payments are created", function() {
      sheet.createParticipation({person: person1, expense: expense1, paid: 11, share: 5});
      expect(expense1.getCost()).toBe(11);
      expect(expense1.getSumOfShares()).toBe(5);
      expect(expense2.getCost()).toBe(0);
      expect(expense2.getSumOfShares()).toBe(0);
      expect(person1.getCost()).toBe(11);
      expect(person1.getSumOfShares()).toBe(5);
      expect(person2.getCost()).toBe(0);
      expect(person2.getSumOfShares()).toBe(0);

      sheet.createParticipation({person: person2, expense: expense1, paid: 22, share: 8});
      expect(expense1.getCost()).toBe(11 + 22);
      expect(expense1.getSumOfShares()).toBe(5 + 8);
      expect(expense2.getCost()).toBe(0);
      expect(expense2.getSumOfShares()).toBe(0);
      expect(person1.getCost()).toBe(11);
      expect(person1.getSumOfShares()).toBe(5);
      expect(person2.getCost()).toBe(22);
      expect(person2.getSumOfShares()).toBe(8);
      
      sheet.createParticipation({person: person1, expense: expense2, paid: 50, share: 40});
      expect(expense1.getCost()).toBe(11 + 22);
      expect(expense1.getSumOfShares()).toBe(5 + 8);
      expect(expense2.getCost()).toBe(50);
      expect(expense2.getSumOfShares()).toBe(40);
      expect(person1.getCost()).toBe(11 + 50);
      expect(person1.getSumOfShares()).toBe(5 + 40);
      expect(person2.getCost()).toBe(22);
      expect(person2.getSumOfShares()).toBe(8);
    });

    it("are updated when participation is updated", function() {
      var participation = sheet.createParticipation({person: person1, expense: expense1, paid: 10, share: 10});
      participation.paid = 200;
      expect(expense1.getCost()).toBe(200);
      expect(expense1.getSumOfShares()).toBe(10);
      expect(person1.getCost()).toBe(200);
      expect(person1.getSumOfShares()).toBe(10);
    });

    it("are updated when participation is deleted", function() {
      var pt1 = sheet.createParticipation({person: person1, expense: expense1, paid: 10, share: 12.5});
      var pt2 = sheet.createParticipation({person: person2, expense: expense1, paid: 15, share: 12.5});

      sheet.removeParticipation(pt2);
      
      expect(expense1.getCost()).toBe(10);
      expect(expense1.getSumOfShares()).toBe(12.5);
      expect(person1.getCost()).toBe(10);
      expect(person1.getSumOfShares()).toBe(12.5);
      expect(person2.getCost()).toBe(0);
      expect(person2.getSumOfShares()).toBe(0);
    });

    it("shareCost() shares cost equally among participants in cent accuracy without loss of money when sharing is 'equal'", function() {
      expense1.sharing = "equal";
      var person3 = sheet.createPerson();
      var nonParticipant = sheet.createPerson();

      var part1 = sheet.createParticipation({person: person1, expense: expense1, paid: 10});
      var part2 = sheet.createParticipation({person: person2, expense: expense1, paid: 0});
      var part3 = sheet.createParticipation({person: person3, expense: expense1, paid: 0});

      expense1.shareCost();

      expect(part1.share + part2.share + part3.share).toBe(10);
      expect(part1.share).toBe(3.33);
      expect(part2.share).toBe(3.33);
      expect(part3.share).toBe(3.34);
    });
    
    it("shareCost() is a noop when sharing is 'custom'", function() {
      expense1.sharing = "custom";
      var person3 = sheet.createPerson();
      var nonParticipant = sheet.createPerson();

      var part1 = sheet.createParticipation({person: person1, expense: expense1, paid: 10});
      var part2 = sheet.createParticipation({person: person2, expense: expense1, paid: 0});
      var part3 = sheet.createParticipation({person: person3, expense: expense1, paid: 0});

      expense1.shareCost();

      expect(part1.share).toBe(0);
      expect(part2.share).toBe(0);
      expect(part3.share).toBe(0);
    });

    it("shareCost() is a noop without error when no participations", function() {
      expect(function() {
        expense1.shareCost();
      }).not.toThrow();
    });
    
    it("expense is re-shared when participation is created or removed", function() {
      var pt = sheet.createParticipation({person: person1, expense: expense1});
      expect(expense1.shareCost.calls.count()).toBe(1);
      
      sheet.removeParticipation(pt);
      expect(expense1.shareCost.calls.count()).toBe(2);
      
      expect(expense2.shareCost.calls.count()).toBe(0);
    });
    
    it("all expenses a person participates in are removed when person is removed", function() {
      sheet.createParticipation({person: person1, expense: expense1});
      sheet.createParticipation({person: person1, expense: expense2});
      
      var otherExpense = sheet.createExpense();
      sheet.createParticipation({person: person2, expense: otherExpense}); // don't track this call
      spyOn(otherExpense, "shareCost");
      
      sheet.removePerson(person1);
      
      expect(expense1.shareCost).toHaveBeenCalled();
      expect(expense2.shareCost).toHaveBeenCalled();
      expect(otherExpense.shareCost).not.toHaveBeenCalled();
    });
    
  });

});


