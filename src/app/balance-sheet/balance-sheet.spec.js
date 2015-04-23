"use strict";

var BalanceSheet = require('./balance-sheet');
var Decimal = require("simple-decimal-money");
var _ = require("lodash");
var angular = require("angular");

describe("Balance sheet", function () {

  var sheet = null;

  beforeEach(function() {
    sheet = new BalanceSheet();
  });
  
  
  it("has as an initial name", function() {
    expect(sheet.name).toBe("New sheet");
  });

  
  it("is balanced if all expenses are balanced", function() {
    var expense1 = sheet.createExpense();
    var expense2 = sheet.createExpense();
    var person1 = sheet.createPerson();
    var person2 = sheet.createPerson();
    
    var prt11 = sheet.createParticipation({person: person1, expense: expense1, paid: 20, share: 15});
    var prt21 = sheet.createParticipation({person: person2, expense: expense1, paid: 0, share: 5});
    var prt12 = sheet.createParticipation({person: person1, expense: expense2, paid: 35, share: 22.5});
    var prt22 = sheet.createParticipation({person: person2, expense: expense2, paid: 10, share: 22.5});
    expect(sheet.isBalanced()).toBe(true);
    
    prt21.share = 0;
    expect(sheet.isBalanced()).toBe(false);
    
    // Total in balance, but individual expenses are not
    prt11.share = 65;
    prt12.share = 0;
    prt21.share = 0;
    prt22.share = 0;
    expect(sheet.isBalanced()).toBe(false);
  });

  describe("import/export", function() {
    
    beforeEach(function() {
      sheet.name = "JSON test sheet";
      var p1 = sheet.createPerson({name: "Anssi"});
      var p2 = sheet.createPerson({name: "Malla"});
      var e1 = sheet.createExpense({name: "Food"});
      var e2 = sheet.createExpense({name: "Stuff"});
      sheet.createParticipation({person: p1, expense: e1, paid: 15, share: 10});
      sheet.createParticipation({person: p2, expense: e1, paid: 0, share: 5});
      sheet.createParticipation({person: p1, expense: e2, paid: 10, share: 0});
      sheet.createParticipation({person: p2, expense: e2, paid: 0, share: 10});
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
    });
      
    it("fails if input data is invalid", function() {
      var data = sheet.exportData();     
      data.participations[0].personId = -666;
      expect(function() {
        new BalanceSheet(data);
      }).toThrow();
    });
    
  });
    
  describe("validates itself", function() {
  
    beforeEach(function() {
      var p1 = sheet.createPerson({name: "Anssi"});
      var e1 = sheet.createExpense({name: "Food"});
      sheet.createParticipation({person: p1, expense: e1, paid: 15, share: 10});
    });
    
    it("when valid", function() {
      expect(sheet.isValid()).toBe(true);        
    });
    
    it("as invalid when a person is missing an id", function() {
      delete sheet.persons[0].name;
      expect(sheet.isValid()).toBe(false);        
    });
    
    it("as invalid when a person is missing a name", function() {
      delete sheet.persons[0].name;
      expect(sheet.isValid()).toBe(false);        
    });
    
    it("as invalid when an expense is missing an id", function() {
      delete sheet.expenses[0].id;
      expect(sheet.isValid()).toBe(false);        
    });
    
    it("as invalid when an expense is missing a name", function() {
      delete sheet.expenses[0].name;
      expect(sheet.isValid()).toBe(false);        
    });
    
    it("as invalid when an expense is missing share mode", function() {
      delete sheet.expenses[0].sharing;
      expect(sheet.isValid()).toBe(false);        
      
    });
    
    it("as invalid when an expense has unknown share mode", function() {
      sheet.expenses[0].sharing = "wtf";
      expect(sheet.isValid()).toBe(false);        
    });
    
    it("as invalid when a participation person is not found", function() {
      sheet.participations[0].person = {id: -1235};
      expect(sheet.isValid()).toBe(false);        
    });
    
    it("as invalid when a participation expense is not found", function() {
      sheet.participations[0].expense = {id: -1235};
      expect(sheet.isValid()).toBe(false);        
    });
    
    it("as invalid when a participation does not have a non-negative payment", function() {
      sheet.participations[0].paid = null;
      expect(sheet.isValid()).toBe(false);
      
      sheet.participations[0].paid = "aargh";
      expect(sheet.isValid()).toBe(false); 
      
      sheet.participations[0].paid = -10;
      expect(sheet.isValid()).toBe(false);  
    });
    
    it("as invalid when a participation does not have a non-negative share", function() {
      sheet.participations[0].share = null;
      expect(sheet.isValid()).toBe(false);
      
      sheet.participations[0].share = "aargh";
      expect(sheet.isValid()).toBe(false); 
      
      sheet.participations[0].share = -10;
      expect(sheet.isValid()).toBe(false);  
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

    it("creates person with numbered name when no name given", function() {
      var person1 = sheet.createPerson();
      expect(person1.name).toBe("Person 1");

      sheet.createPerson({name: "Defined"});
      sheet.createExpense({name: "Defined"});

      var person3 = sheet.createPerson();
      expect(person3.name).toBe("Person 3");
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
    
    it("balance is difference between sum paid and sum shared", function() {
      var expense1 = sheet.createExpense();
      var expense2 = sheet.createExpense();
      var person = sheet.createPerson();
      
      sheet.createParticipation({person: person, expense: expense1, paid: 20, share: 10});
      sheet.createParticipation({person: person, expense: expense2, paid: 0, share: 15});
      
      expect(person.getBalance()).toBe(-5);
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

    it("creates expense with numbered name when no name given", function() {
      var expense1 = sheet.createExpense();
      expect(expense1.name).toBe("Expense 1");

      sheet.createPerson({name: "Defined"});
      sheet.createExpense({name: "Defined"});

      var expense3 = sheet.createExpense();
      expect(expense3.name).toBe("Expense 3");
    });

    it("has sharing mode 'equal' by default", function() {
      var expense = sheet.createExpense();
      expect(expense.sharing).toBe('equal');
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
      var p1To2 = sheet.createParticipation({person: person1, expense: expense2, paid: 20});
      var p2To2 = sheet.createParticipation({person: person2, expense: expense2, paid: 21});

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
    
  });
  
  describe("costs and shares", function() {

    var expense1, expense2, person1, person2;

    beforeEach(function() {
      expense1 = sheet.createExpense();
      expense2 = sheet.createExpense();
      person1 = sheet.createPerson();
      person2 = sheet.createPerson();
    });

    it("of an expense is initially zero", function() {
      expect(expense1.getCost()).toBe(0);
      expect(expense1.getSumOfShares()).toBe(0);
    });
    
    it("paid by a person is initially zero", function() {
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

    it("are updated when payment is updated", function() {
      var payment1 = sheet.createParticipation({person: person1, expense: expense1, paid: 10, share: 10});
      payment1.paid = 200;
      expect(expense1.getCost()).toBe(200);
      expect(expense1.getSumOfShares()).toBe(10);
      expect(person1.getCost()).toBe(200);
      expect(person1.getSumOfShares()).toBe(10);
    });

    it("are updated when payment is deleted", function() {
      var payment1 = sheet.createParticipation({person: person1, expense: expense1, paid: 10, share: 12.5});
      var payment2 = sheet.createParticipation({person: person2, expense: expense1, paid: 15, share: 12.5});

      sheet.removeParticipation(payment2);
      
      expect(expense1.getCost()).toBe(10);
      expect(expense1.getSumOfShares()).toBe(12.5);
      expect(person1.getCost()).toBe(10);
      expect(person1.getSumOfShares()).toBe(12.5);
      expect(person2.getCost()).toBe(0);
      expect(person2.getSumOfShares()).toBe(0);
    });

    it("can be shared equally among participants in cent accuracy without loss of money", function() {
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

    it("is shared as noop without error when no participations", function() {
      expect(function() {
        expense1.shareCost();
      }).not.toThrow();
    });
    
  });
  
});


