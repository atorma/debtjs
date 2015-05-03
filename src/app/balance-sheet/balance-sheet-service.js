"use strict";

var _ = require("lodash");
var angular = require("angular");
var BalanceSheet = require('./balance-sheet');

angular.module("debtApp")
.factory("balanceSheetService", balanceSheetService);

function balanceSheetService(localStorageService) {
  
  var service = {
    balanceSheet: null,
    save: save,
    loadFromJson: loadFromJson,
    exportToJson: exportToJson,
    init: init,
    createPerson: createPerson,
    createExpense: createExpense
  };
  service.init();
  
  return service;
  
  
  function init() {
    var data = localStorageService.get("balanceSheetData");
    service.balanceSheet = new BalanceSheet(data); 
  }

  function save() {
    service.balanceSheet.throwErrorIfInvalid();
    localStorageService.set("balanceSheetData", service.balanceSheet.exportData());
  }
  
  function loadFromJson(json) {
    var data = angular.fromJson(json);
    service.balanceSheet = new BalanceSheet(data);
    save();
  }
  
  function exportToJson() {
    var data = service.balanceSheet.exportData(); 
    return angular.toJson(data);
  }
  
  function createPerson(data, options) {
    var person = service.balanceSheet.createPerson(data);
    if (options && options.createParticipations === true) {
      _.each(service.balanceSheet.expenses, function(e) {
        service.balanceSheet.createParticipation({person: person, expense: e});
        e.shareCost();
      });
    }
    return person;
  }
  
  function createExpense(data, options) {
    var expense = service.balanceSheet.createExpense(data);
    if (options && options.createParticipations === true) {
      _.each(service.balanceSheet.persons, function(p) {
        service.balanceSheet.createParticipation({person: p, expense: expense});
      });
    }
    return expense;
  }
}


