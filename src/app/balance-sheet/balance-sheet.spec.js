"use strict";

var BalanceSheet = require('./balance-sheet');
var Decimal = require("simple-decimal-money");

describe("Balance sheet", function () {

  var sheet = null;

  beforeEach(function() {
    sheet = new BalanceSheet();
  });

  describe("person", function() {

    it("gets distinct id when added", function() {
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

  });

  describe("expense", function() {

    it("gets distinct id when added", function() {
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


    describe("cost", function() {

      var expense, person1, person2;

      beforeEach(function() {
        expense = sheet.createExpense();
        person1 = sheet.createPerson();
        person2 = sheet.createPerson();
      });

      it("is initially zero", function() {
        expect(expense.getCost()).toBe(0);
      });

      it("is updated when payment is created", function() {
        var payment1 = sheet.createParticipation({person: person1, expense: expense, paid: 11});
        expect(expense.getCost()).toBe(11);

        var payment2 = sheet.createParticipation({person: person2, expense: expense, paid: 22});
        expect(expense.getCost()).toBe(11 + 22);
      });

      it("is updated when payment is updated", function() {
        var payment1 = sheet.createParticipation({person: person1, expense: expense, paid: 10});
        payment1.paid = 200;
        expect(expense.getCost()).toBe(200);
      });

      it("is updated when payment is deleted", function() {
        var payment1 = sheet.createParticipation({person: person1, expense: expense, paid: 10});
        var payment2 = sheet.createParticipation({person: person2, expense: expense, paid: 15});
        expect(expense.getCost()).toBe(25);
        sheet.removeParticipation(payment2);
        expect(expense.getCost()).toBe(10);
      });

      it("is computed over correct expenses", function() {
        var expense2 = sheet.createExpense({});
        sheet.createParticipation({person: person1, expense: expense, paid: 10});
        expect(expense.getCost()).toBe(10);

        sheet.createParticipation({person: person1, expense: expense2, paid: 999});
        expect(expense.getCost()).toBe(10);
      });

      it("can be shared equally among participants in cent accuracy without loss of money", function() {
        var person3 = sheet.createPerson({});
        var nonParticipant = sheet.createPerson({});

        var part1 = sheet.createParticipation({person: person1, expense: expense, paid: 10});
        var part2 = sheet.createParticipation({person: person2, expense: expense, paid: 0});
        var part3 = sheet.createParticipation({person: person3, expense: expense, paid: 0});

        expense.shareCost();

        expect(part1.share + part2.share + part3.share).toBe(10);
        expect(part1.share).toBe(3.33);
        expect(part2.share).toBe(3.33);
        expect(part3.share).toBe(3.34);
      });

      it("is shared as noop without error when no participations", function() {
        expect(function() {
          expense.shareCost();
        }).not.toThrow();
      });
      
    });

    it("can return participations to it", function() {
      var expense1 = sheet.createExpense();
      var expense2 = sheet.createExpense();
      var person1 = sheet.createPerson();
      var person2 = sheet.createPerson();

      var p1To1 = sheet.createParticipation({person: person1, expense: expense1, paid: 10});
      var p2To1 = sheet.createParticipation({person: person2, expense: expense1, paid: 11});
      var p1To2 = sheet.createParticipation({person: person1, expense: expense2, paid: 20});

      expect(expense1.getParticipations().length).toBe(2);
      expect(expense1.getParticipations()[0].equals(p1To1)).toBe(true);
      expect(expense1.getParticipations()[1].equals(p2To1)).toBe(true);
      expect(expense2.getParticipations().length).toBe(1);
      expect(expense2.getParticipations()[0].equals(p1To2)).toBe(true);
    });
    
    it("can compute sum of shares of participants", function() {
      var expense = sheet.createExpense();
      expect(expense.getSumOfShares()).toBe(0);
      
      var person1 = sheet.createPerson();
      var person2 = sheet.createPerson();
      sheet.createParticipation({person: person1, expense: expense, paid: 20, share: 15});
      sheet.createParticipation({person: person2, expense: expense, paid: 0, share: 5});
      
      expect(expense.getSumOfShares()).toBe(20);
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

    it("removing removes all payments of it", function() {
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

});
