"use strict";

var angular = require("angular");
var BalanceSheet = require('./balance-sheet');

angular.module("debtApp")
  .factory("balanceSheetService", balanceSheetService);

function balanceSheetService(localStorageService) {

  var service = {
    balanceSheet: undefined,
    save: save,
    loadFromJson: loadFromJson,
    exportToJson: exportToJson,
    createNew: createNew,
    init: init
  };

  return service;


  function init() {
    var data = localStorageService.get("balanceSheetData");
    service.balanceSheet = new BalanceSheet(data);
  }

  function save() {
    if (!service.balanceSheet) {
      throw new ReferenceError("No balance valid balance sheet");
    }
    service.balanceSheet.throwErrorIfInvalid();
    localStorageService.set("balanceSheetData", service.balanceSheet.exportData());
  }

  function loadFromJson(json) {
    var data = angular.fromJson(json);
    var balanceSheet = new BalanceSheet(data);
    balanceSheet.throwErrorIfInvalid();
    service.balanceSheet = balanceSheet;
    save();
  }

  function exportToJson() {
    var data = service.balanceSheet.exportData();
    return angular.toJson(data);
  }

  function createNew() {
    service.balanceSheet = new BalanceSheet();
    service.save();
  }

}


