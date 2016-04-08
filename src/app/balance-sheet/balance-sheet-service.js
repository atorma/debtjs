"use strict";

var angular = require("angular");
var BalanceSheet = require('./balance-sheet');

angular.module("debtApp")
  .factory("balanceSheetService", balanceSheetService);

function balanceSheetService(localStorageService) {

  var DATE_REGEX = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/; // 2016-04-07T21:00:00.000Z

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
    var localStorageData = localStorageService.get("balanceSheetData");
    var data;
    if (localStorageData && localStorageData.json) {
       data = JSON.parse(localStorageData.json, dateReviver);
    } else if (localStorageData) {
      data = localStorageData; // backwards compatibility
    } else {
      data = {};
    }
    service.balanceSheet = new BalanceSheet(data);
  }

  function save() {
    if (!service.balanceSheet) {
      throw new ReferenceError("No balance valid balance sheet");
    }
    service.balanceSheet.throwErrorIfInvalid();

    // Store a JSON string in localStorage instead of allowing localStorageService to stringify
    // the data so that we can control date parsing.
    var jsonString = JSON.stringify(service.balanceSheet.exportData());
    localStorageService.set("balanceSheetData", {json: jsonString});
  }

  function loadFromJson(json) {
    var data = JSON.parse(json, dateReviver);
    var balanceSheet = new BalanceSheet(data);
    balanceSheet.throwErrorIfInvalid();
    service.balanceSheet = balanceSheet;
    save();
  }

  function dateReviver(key, value) {
    if (typeof value === 'string' && DATE_REGEX.test(value)) {
      return new Date(value);
    }
    return value;
  }

  function exportToJson() {
    var data = service.balanceSheet.exportData();
    return JSON.stringify(data);
  }

  function createNew() {
    service.balanceSheet = new BalanceSheet();
    service.save();
  }

}


